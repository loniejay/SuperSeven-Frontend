'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomDatePicker from '@/components/datepicker';
import dayjs from 'dayjs';
import {
    CloseWrapper, 
    Details, 
    AssignedWrapper,
    ReleaseDateWrapper,
    StatusWrapper,
    LinkAttached,
    ActionButton,
    ModalWrapper 
} from './styles';
import { Box, Typography, CircularProgress, Button, styled } from '@mui/material';
import { icons } from '@/icons';
import Image from 'next/image';
import { DeliverableStatus, MappedWorkloadItem, WorkloadApiItem, statusMap, Employee, statusOptions, statusStringToNumberMap } from '@/types/workload';
import { fetchAvailableEmployees, fetchWorkloadDetailsById, showConfirmationDialog, showValidationError, updateWorkloadAssignment, validateAssignment, updateEmployeeWorkloadStatus } from '@/lib/api/fetchWorkloads';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/AuthContext';
import { fadeInRight, fadeOutRight } from "@/utils/animate";
import Preloader from '@/components/Preloader';

export interface EditModalProps {
    open: boolean;
    onClose: () => void;
    eventData: MappedWorkloadItem | null;
    onUpdateSuccess?: () => void;
}

// Define ModalContainer with transient prop $closing
const StyledModalContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$closing',
})<{ $closing?: boolean }>(({ theme, $closing }) => ({
  animation: `${$closing ? fadeOutRight : fadeInRight} 0.3s forwards`,
  position: 'relative',
  top: '100px',
  right: 0,
  maxWidth: '560px',
  width: '100%',
  height: 'auto',
  backgroundColor: '#FFFFFF',
  zIndex: 1,
  border: '0.3px solid #E0E0E0',
  borderRadius: '4px',
  paddingBottom: '30px',
  marginBottom: '150px',
  marginLeft: 'auto',
}));

export default function EditModal({ open, onClose, eventData, onUpdateSuccess }: EditModalProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<DeliverableStatus>(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [completionDate, setCompletionDate] = useState<dayjs.Dayjs | null>(null);
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingDetails, setBookingDetails] = useState<WorkloadApiItem | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [closing, setClosing] = useState(false);
    const isMounted = useRef(true);
    const isClosing = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { user, loading: authLoading } = useAuth();
    const isEmployee = user?.user_role === 'Editor' || user?.user_role === 'Photographer';

    // Cleanup on unmount
    useEffect(() => {
        return () => {
        isMounted.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);
    
    // Handle open/close transitions
    useEffect(() => {
        if (open) {
            // Open modal: show and animate in
            setShouldRender(true);
            setClosing(false);
        } else if (shouldRender) {
            // Start closing animation
            setClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);
    
    const handleClose = useCallback(() => {
        if (isClosing.current) return;
        isClosing.current = true;
        
        setClosing(true);
        onClose();
        timeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
                setShouldRender(false);
                onClose();
            }
        }, 300);
    }, [onClose]);
    
    // Handle escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                handleClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [open, handleClose]);

    useEffect(() => {
        if (!open || !eventData) return;

        const loadData = async () => {
            try {
                setFetching(true);
                setError(null);

                const [details, availableEmployees] = await Promise.all([
                    fetchWorkloadDetailsById(eventData.id),
                    fetchAvailableEmployees(eventData.id)
                ]);
                
                // Set initial state from API response
                setBookingDetails(details);
                setLink(details.link || '');
                setCompletionDate(
                    details.completion_date ? dayjs(details.completion_date) : null
                );

                const numericStatus = statusStringToNumberMap[details.booking_workload_status] || 0;
                setSelectedStatus(numericStatus);

                const assignedIds = details.assigned_employees.map(e => e.id);
                setEmployees(
                    availableEmployees.map(emp => ({
                        ...emp,
                        selected: assignedIds.includes(emp.id)
                    }))
                );
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setFetching(false);
            }
        };

        loadData();
    }, [open, eventData, authLoading]);

    const getAvailableStatusOptions = useCallback(() => {
        // Owner can see all status options
        if (user?.user_role === 'Owner') {
            return statusOptions;
        }

        // Editor specific rules
        if (user?.user_role === 'Editor') {
            return statusOptions.filter(option => {
                // Hide For Edit (3) completely for Editors
                if (option.value === 3) return false;

                // Can select Editing (4) only if current status is For Edit (3)
                if (selectedStatus === 3 && option.value === 4) return true;
                
                // Can select For Release (5) only if current status is Editing (4)
                if (selectedStatus === 4 && option.value === 5) return true;
                
                // Can go back one step in workflow
                if (selectedStatus === 5 && option.value === 4) return true; // For Release → Editing
                
                return false;
            });
        }

        // Photographer can only select Uploaded (2)
        if (user?.user_role === 'Photographer') {
            return statusOptions.filter(option => option.value === 2);
        }

        return [];
    }, [user?.user_role, selectedStatus]);

    const isStatusDisabled = (statusValue: number) => {
        // Common workflow progression rules
        if (selectedStatus === 0) return statusValue !== 1 && statusValue !== 0;
        if (selectedStatus === 1) return statusValue !== 2 && statusValue !== 1 && statusValue !== 0;
        if (selectedStatus === 2) return statusValue !== 3 && statusValue !== 2 && statusValue !== 1;
        if (selectedStatus === 3) return statusValue !== 4 && statusValue !== 3 && statusValue !== 2;
        if (selectedStatus === 4) return statusValue !== 5 && statusValue !== 4 && statusValue !== 3;
        if (selectedStatus === 5) return statusValue !== 6 && statusValue !== 5 && statusValue !== 4;
        if (selectedStatus === 6) return !(statusValue === 5 || statusValue === 6);

        return false;
    };

    const isUpdateDisabled = useCallback(() => {
        if (loading || !bookingDetails) {
            return true;
        }

        // Disable if booking is already completed
        if (bookingDetails.booking_workload_status === 'Completed') {
            return true;
        }

        // Non-owners cannot submit when status is For Edit (3)
        if (user?.user_role !== 'Owner' && selectedStatus === 3) {
            return true;
        }

        // Editor specific rules
        if (user?.user_role === 'Editor') {
            const currentStatusNumber = statusStringToNumberMap[bookingDetails.booking_workload_status];
            return !(
            (selectedStatus === 4 && currentStatusNumber === 3) || // For Edit → Editing
            (selectedStatus === 5 && currentStatusNumber === 4)    // Editing → For Release
            );
        }

        // Photographer can only submit Uploaded (2)
        if (user?.user_role === 'Photographer') {
            return selectedStatus !== 2;
        }

        // Default case
        return selectedStatus === 0;
    }, [loading, bookingDetails, selectedStatus, user?.user_role]);

    const handleAssignedClick = () => setIsDropdownOpen(prev => !prev);
    const handleStatusClick = () => setIsStatusDropdownOpen(prev => !prev);

    const handleStatusSelect = (status: DeliverableStatus) => {
        setSelectedStatus(status);
        setIsStatusDropdownOpen(false);
    };

    const toggleEmployeeSelection = (id: number) => {
        setEmployees(prevEmployees => 
            prevEmployees.map(emp => 
                emp.id === id ? { ...emp, selected: !emp.selected } : emp
            )
        );
    };

    const formatDateForBackend = (date: dayjs.Dayjs | null): string | null => {
        if (!date) return null;
        return date.format('YYYY-MM-DD');
    };

    const handleUpdate = async () => {
        if (!eventData || !bookingDetails) return;

        const selectedEmployeeIds = employees
            .filter(e => e.selected)
            .map(e => e.id);

        // Validate assignment
        const validationError = validateAssignment(selectedStatus, selectedEmployeeIds);
        if (validationError) {
            await showValidationError(validationError);
            return;
        }

        // Validate link when status is Completed
        if (selectedStatus !== 0) {
            if (!link.trim()) {
                await showValidationError("Please provide a link for completed deliverables");
                return;
            }
            
            // Validate Google Drive/Dropbox pattern
            const drivePattern = /^https:\/\/drive\.google\.com\/.+/;
            const dropboxPattern = /^https:\/\/www\.dropbox\.com\/.+/;
            if (!drivePattern.test(link) && !dropboxPattern.test(link)) {
                await showValidationError("Please provide a valid Google Drive or Dropbox link");
                return;
            }
        }

        try {

            // Confirmation dialog
            const confirmed = await showConfirmationDialog();
            if (!confirmed) return;

            setLoading(true);
            setError(null);

            // For employees: update their own status
            if (isEmployee) {
                await updateEmployeeWorkloadStatus(eventData.id, {
                    workload_status: selectedStatus
                });
            } else {
                await updateWorkloadAssignment(eventData.id, {
                    completion_date: formatDateForBackend(completionDate),
                    deliverable_status: selectedStatus,
                    link: link || '',
                    user_id: selectedEmployeeIds
                });
            }

            onUpdateSuccess?.();
            onClose();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (error) {
            Swal.fire({
                icon: 'error',
                text: error,
                background: '#ffebee',
                color: 'error.main'
            });
        }
    }, [error]);

    if (!open || !eventData || !bookingDetails) return null;

    if (!shouldRender) return null;

    if (fetching) {
        return (
            <Preloader />
        )
    }

    return (
        <ModalWrapper>
            <StyledModalContainer
                ref={modalRef}
                $closing={closing}
            >
                <CloseWrapper onClick={handleClose}>
                    <Image width={18} height={18} src={icons.closeIcon} alt="close icon" />
                </CloseWrapper>

                <Details>
                    <Box className="event-head">
                        <Box className="event-icon"/>
                        <Box className="event-name">
                            <h2 className="title">{eventData.eventName}</h2>
                            <Typography component="span" className="event-date">
                                {eventData.bookingDate}
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="client-info">
                        <Image width={25} height={25} src={icons.eventProfile} alt="profile icon" />
                        <Typography component="span">{eventData.client}</Typography>
                    </Box>
                    <Box className="client-info">
                        <Image width={25} height={25} src={icons.packageIcon} alt="profile icon" />
                        <Typography component="span">{eventData.package_name}</Typography>
                    </Box>
                    <Box className="client-info">
                        <Image width={25} height={25} src={icons.clockIcon} alt="profile icon" />
                        <Typography component="span">{eventData.ceremony_time}</Typography>
                    </Box>
                    <Box className="client-info">
                        <Image width={25} height={25} src={icons.locationIcon} alt="profile icon" />
                        <Typography component="span">{eventData.booking_address}</Typography>
                    </Box>
                    
                </Details>

                <StatusWrapper>
                    <Box className="label">Status:</Box>
                    <Box className="status-to" onClick={handleStatusClick}>
                        <Typography component="span">
                            {statusMap[selectedStatus]}
                        </Typography>
                        <Image
                            width={12}
                            height={7}
                            src={icons.angleDown}
                            alt="angle down"
                            className={isStatusDropdownOpen ? 'rotated' : ''}
                        />
                    </Box>
                    
                    {isStatusDropdownOpen && (
                        <Box className="dropdown-list">
                            {getAvailableStatusOptions().map((status) => {
                                const disabled = isStatusDisabled(status.value);

                                return (
                                    <Box
                                    className={`row status-option ${disabled ? 'disabled' : ''}`}
                                    key={status.id}
                                    onClick={() => !disabled && handleStatusSelect(status.value)}
                                    sx={{
                                        opacity: disabled ? 0.5 : 1,
                                        pointerEvents: disabled ? 'none' : 'auto',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        '&:hover': {
                                        backgroundColor: disabled ? 'inherit' : '#f5f5f5'
                                        }
                                    }}
                                    >
                                    <Typography component="span">{status.name}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </StatusWrapper>

                <AssignedWrapper>

                    {!isEmployee ? (
                        <>
                            <Box className="label">Assigned To:</Box>
                            <Box 
                                className="assigned-to" 
                                onClick={handleAssignedClick}
                                sx={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            >
                                <Typography component="span">
                                    {employees.filter(e => e.selected).length > 0 
                                        ? `${employees.filter(e => e.selected).length} selected` 
                                        : 'Select employees'}
                                </Typography>
                                <Image
                                    width={12}
                                    height={7}
                                    src={icons.angleDown}
                                    alt="angle down"
                                    className={isDropdownOpen ? 'rotated' : ''}
                                />
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box className="label">Assigned To:</Box>
                            <Box sx={{ marginTop: '10px' }}>
                                {employees.map((employee) => (
                                    employee.selected && (
                                        <Box key={employee.id}>
                                        <Typography 
                                            component="span" 
                                            sx={{
                                                fontFamily: 'Nunito Sans',
                                                fontWeight: '500', 
                                                fontSize: '16px',
                                                color: '#000000'
                                            }}
                                        >
                                            {employee.full_name}</Typography>
                                        </Box>
                                    )
                                ))}
                            </Box>
                        </>
                    )}

                    
                    {isDropdownOpen && (
                        <Box className="dropdown-list">
                            {employees.map((employee) => (
                                <Box className="row" key={employee.id}>
                                    <Box className="checkbox">
                                        <input
                                            type="checkbox"
                                            id={`employee-${employee.id}`}
                                            checked={employee.selected || false}
                                            onChange={() => toggleEmployeeSelection(employee.id)}
                                        />
                                        <label htmlFor={`employee-${employee.id}`}>
                                            {employee.full_name}
                                            <span> ({employee.user_role})</span>
                                            <span>({employee.workload_count})</span>
                                        </label>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </AssignedWrapper>

                <ReleaseDateWrapper sx={{ pointerEvents: 'none' }}>
                    <Box className="label">Release Date:</Box>
                    <CustomDatePicker
                        value={completionDate}
                        onChange={(newValue) => setCompletionDate(newValue)}
                        minDate={dayjs().add(1, 'day')}
                        label=""
                    />
                </ReleaseDateWrapper>

                <LinkAttached>
                    <Box className="label">Link Attached:</Box>
                    <input 
                        type="text" 
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Paste Google Drive or Dropbox link" 
                    />
                </LinkAttached>

                <ActionButton>
                    <Button 
                        variant="outlined" 
                        onClick={handleClose}
                        disabled={loading}
                        sx={{
                            color: '#FFFFFF',
                            borderColor: '#AAAAAA',
                            backgroundColor: '#AAAAAA',
                            '&:hover': {
                                backgroundColor: '#898989',
                                color: 'white'
                            },
                            padding: '10px 15px',
                            fontSize: '14px',
                            fontWeight: '500 !important'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpdate}
                        disabled={isUpdateDisabled()}
                        sx={{
                            backgroundColor: isUpdateDisabled() ? '#AAAAAA' : '#2BB673',
                            pointerEvents: isUpdateDisabled() ? 'none' : 'auto',
                            '&:hover': {
                            backgroundColor: '#155D3A'
                            },
                            padding: '10px 15px',
                            fontSize: '14px',
                            fontWeight: '500 !important'
                        }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                </ActionButton>
            </StyledModalContainer>
        </ModalWrapper>
    );
}