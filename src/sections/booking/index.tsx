'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookingContainer, BookingContent, LeftContent,
  AddBooking, BigCalendar, StatusFilter,
  EventHeading, EventDetails, Details, CloseButton
} from './styles';
import { HeadingComponent } from '@/components/Heading';
import AddBookingComponent from './AddBooking';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckboxComponent from '@/components/checkbox';
import { FeedbackModalComponent } from '@/components/Modal/FeedbackModal';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import "react-big-calendar/lib/css/react-big-calendar.css";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { icons } from '@/icons';
import type { BookingEvent, StatusFilters, UnavailableDate } from '@/types/booking';
import CustomDatePicker from '@/components/datepicker';
import CustomTimePicker from '@/components/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import {
  fetchBookings,
  fetchUnavailableDateRecords,
  markDateAsUnavailable,
  unmarkDateAsAvailable,
  approveBooking,
  rejectBooking,
  cancelBooking,
  rescheduleBooking,
  normalizeToPHDate
} from '@/lib/api/fetchBooking';
import { getAddonNames } from '@/utils/billing';
import { useAuth } from '@/context/AuthContext';
import { submitFeedback } from '@/lib/api/fetchFeedback';
import { useLoading } from '@/context/LoadingContext';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function BookingComponent(): React.JSX.Element {
  const { showLoader, hideLoader } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // State management
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<Dayjs | null>(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [timeError, setTimeError] = useState<string | undefined>(undefined);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState<BookingEvent | null>(null);
  const [statusFilters, setStatusFilters] = useState<StatusFilters>({
    booked: true,
    pending: true,
  });

  // Derived values
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');
  const canDisableDates = user?.user_role === 'Owner' || user?.user_role === 'Secretary';
  const showAddBooking = searchParams.get('add') === 'true';
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);


  // Event handlers : redirect helper (same pattern as BillingComponent)
  const handleViewBilling = useCallback((billingId: number) => {
    router.push(`/billing/${billingId}`);
  }, [router]);

  // Cache states
  const [cache, setCache] = useState<{
    bookings: Record<string, BookingEvent[]>;
    unavailable: Record<string, UnavailableDate[]>;
  }>({ bookings: {}, unavailable: {} });

  // Fetch data
  const fetchData = useCallback(async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const cacheKey = `${month}-${year}`;

    // Check cache first
    if (cache.bookings[cacheKey] && cache.unavailable[cacheKey] && !isInitialLoad) {
      setEvents(cache.bookings[cacheKey]);
      setUnavailableDates(cache.unavailable[cacheKey]);
      return;
    }
    
    try {
      // Show full loader only for initial load or month/year changes
      if (isInitialLoad) {
        showLoader();
      } else {
        setIsTableLoading(true);
      }
      
      const [bookings, unavailable] = await Promise.all([
        fetchBookings(month, year),
        fetchUnavailableDateRecords(month, year)
      ]);

      console.log('Fetched bookings:', bookings);
      
      setEvents(bookings);
      setUnavailableDates(unavailable);
      setError(null);

      // Update cache
      setCache(prev => ({
        bookings: { ...prev.bookings, [cacheKey]: bookings },
        unavailable: { ...prev.unavailable, [cacheKey]: unavailable }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
      setIsTableLoading(false);
      hideLoader();
    }
  }, [currentDate, isInitialLoad, cache, showLoader, hideLoader]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchData]);
  
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current && !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calendar day styling
  const dayPropGetter = useCallback((date: Date) => {
    const normalizedDate = normalizeToPHDate(date);
    const hasApprovedEvent = events.some(event => 
      event.booking_status === 'approved' &&
      normalizeToPHDate(new Date(event.start)).getTime() === normalizedDate.getTime()
    );
    
    const isManuallyDisabled = unavailableDates.some(d => 
      normalizeToPHDate(new Date(d.date)).getTime() === normalizedDate.getTime()
    );

    const isDisabled = hasApprovedEvent || isManuallyDisabled;

    return {
      className: isDisabled ? 'disabled-day' : '',
      style: {
        backgroundColor: isDisabled ? '#f5f5f5' : '',
        color: isDisabled ? '#ccc' : '',
        cursor: isDisabled || isClient ? 'default' : 'pointer'
      }
    };
  }, [unavailableDates, events, isClient]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      return (
        (statusFilters.pending && event.booking_status === "pending") || 
        (statusFilters.booked && event.booking_status === "approved")
      );
    });
  }, [events, statusFilters]);

  const nearestEvent = useMemo(() => {
    return events
      .filter(event => event.booking_status === 'approved' && event.start > new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  }, [events]);

  const disabledDates = useMemo(() => {
    return [
      ...events
        .filter(event => event.booking_status === 'approved')
        .map(event => dayjs(normalizeToPHDate(new Date(event.start)))),
      ...unavailableDates.map(d => dayjs(normalizeToPHDate(new Date(d.date))))
    ];
  }, [events, unavailableDates]);

  // Event handlers
  const handleAddBookingClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('add', 'true');
    router.push(`/booking?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleCancelBooking = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('add');
    router.push(`/booking?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((name: keyof StatusFilters) => {
    setStatusFilters(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  // Handle event click
  const handleEventClick = useCallback((event: BookingEvent) => {
    setSelectedEvent(event);
  }, []);

  // Handle date selection (mark/unmark unavailable)
  const handleDateSelect = async (start: Date) => {

    if (isClient) return; // Prevent clients from disabling dates

    const normalizedStart = normalizeToPHDate(start);
    const unavailableDate = unavailableDates.find(d => 
      normalizeToPHDate(new Date(d.date)).getTime() === normalizedStart.getTime()
    );

    if (unavailableDate) {
      const result = await Swal.fire({
        title: 'Enable Date?',
        text: 'This date is currently marked as unavailable. Would you like to make it available for bookings?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, enable it',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        try {
          await unmarkDateAsAvailable(unavailableDate.id);
          await fetchData();
          Swal.fire('Date Enabled!', 'This date is now available for bookings.', 'success');
        } catch (err) {
          Swal.fire('Error', err instanceof Error ? err.message : 'Failed to enable date', 'error');
        }
      }
      return;
    }

    const hasBooking = events.some(event => 
      normalizeToPHDate(new Date(event.start)).getTime() === normalizedStart.getTime()
    );

    if (hasBooking) {
      Swal.fire(
        'Date Unavailable',
        'This date already has a booking (approved or pending). Please resolve the booking first.',
        'warning'
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Disable Date?',
      text: 'Would you like to disable this date for bookings?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, disable it',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await markDateAsUnavailable(normalizedStart);
        await fetchData();
        Swal.fire('Date Disabled!', 'This date has been marked as unavailable.', 'success');
      } catch (err) {
        Swal.fire('Error', err instanceof Error ? err.message : 'Failed to disable date', 'error');
      }
    }
  };

  // Handle booking actions
  const handleAction = async (action: 'reschedule' | 'reject' | 'approve' | 'update' | 'cancel' | 'feedback') => {
    if (!selectedEvent) return;

    if (action === 'approve') {
      if (!selectedEvent.billing_id) {
        Swal.fire(
          'Missing Billing',
          'No billing record is linked to this booking.',
          'error'
        );
        return;
      }

      handleViewBilling(selectedEvent.billing_id);
      setSelectedEvent(null);
      return;
    }

    if (action === 'reschedule') {
      setShowRescheduleForm(true);
      setRescheduleDate(dayjs(selectedEvent.start));
      setRescheduleTime(dayjs(selectedEvent.ceremony_time, 'HH:mm'));
      return;
    }

    if (action === 'update') {
      router.push(`/booking/${selectedEvent.id}/edit`);
      return;
    }

    // Skip confirmation for feedback action
    if (action === 'feedback') {
      setFeedbackBooking(selectedEvent);
      setShowFeedbackModal(true);
      return;
    }

    // Check if there are other pending bookings for the same date
    const otherPendingBookings = events.filter(event => 
      event.id !== selectedEvent.id &&
      event.booking_status === 'pending' &&
      normalizeToPHDate(new Date(event.start)).getTime() === normalizeToPHDate(selectedEvent.start).getTime()
    );

    let confirmationMessage = '';

    const confirmation = await Swal.fire({
      title: `Are you sure you want to ${action} this booking?`,
      text: confirmationMessage,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#979797',
      confirmButtonColor: '#d33',
      confirmButtonText: `Proceed`,
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'swal-z-index'
      }
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsTableLoading(true);
    try {
      switch(action) {
        case 'reject':
          await rejectBooking(selectedEvent.id);
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === selectedEvent.id 
                ? { ...event, status: 'unavailable' } 
                : event
            )
          );
          await fetchData();
          Swal.fire('Rejected!', 'The booking has been rejected.', 'success');
          break;
        
        case 'cancel':
          await cancelBooking(selectedEvent.id);
          await fetchData();
          Swal.fire({
            title: 'Cancelled!',
            text: 'The booking has been cancelled.',
            icon: 'success',
            customClass: {
              container: 'swal-z-index'
            }
          });
          break;
      }
    } catch (err) {
      Swal.fire('Error', err instanceof Error ? err.message : 'An unknown error occurred', 'error');
      console.error('Error handling action:', err);
    } finally {
      setIsTableLoading(false);
      setSelectedEvent(null);
    }
  };

  // Handle reschedule submission
  const handleRescheduleSubmit = async () => {
    if (!selectedEvent || !rescheduleDate || !rescheduleTime || !rescheduleTime.isValid()) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a valid date and time',
        icon: 'error',
        customClass: {
          container: 'swal-z-index'
        }
      });
      return;
    }
    
    // Check if the new date is the same as the original date
    const originalDate = dayjs(selectedEvent.start);
    if (rescheduleDate.isSame(originalDate, 'day')) {
      Swal.fire({
        title: 'Same Date',
        text: 'Please select a different date for rescheduling',
        icon: 'warning',
        customClass: {
          container: 'swal-z-index'
        }
      });
      return;
    }

    // Add confirmation dialog
    const confirmation = await Swal.fire({
      title: 'Confirm Reschedule',
      html: `Are you sure you want to reschedule this booking to <strong>${rescheduleDate.format('MMMM D, YYYY')} at ${rescheduleTime.format('h:mm A')}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffc300',
      cancelButtonColor: '#979797',
      confirmButtonText: 'Yes, reschedule',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        container: 'swal-z-index'
      }
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsTableLoading(true);
    try {
      await rescheduleBooking(selectedEvent.id, rescheduleDate, rescheduleTime);
      await fetchData();
      Swal.fire({
        title: 'Success!',
        text: 'Booking has been rescheduled',
        icon: 'success',
        customClass: {
          container: 'swal-z-index'
        }
      });
      setShowRescheduleForm(false);
      setSelectedEvent(null);
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to reschedule booking',
        icon: 'error',
        customClass: {
          container: 'swal-z-index'
        }
      });
      console.error('Error rescheduling booking:', err);
    } finally {
      setIsTableLoading(false);
    }
  };

  // Custom event component
  const CustomEvent = useCallback(({ event }: { event: BookingEvent }) => {
    const getEventStyle = () => {
      const baseStyle = {
        color: 'white',
        padding: '5px',
        borderRadius: '4px',
        fontSize: '12px',
        height: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      };

      // First handle booking status
      switch(event.booking_status) {
        case 'pending':
          return { ...baseStyle, backgroundColor: '#FFA500' };
        case 'unavailable':
          return { ...baseStyle, backgroundColor: '#CCCCCC' };
        case 'approved':
          // For approved bookings, check deliverable_status
          switch(event.deliverable_status) {
            case 'Unassigned':
              return { ...baseStyle, backgroundColor: '#9CA3AF' };
            case 'Scheduled':
              return { ...baseStyle, backgroundColor: '#EF3826' };
            case 'Uploaded':
              return { ...baseStyle, backgroundColor: '#FACC15'};
            case 'For Edit':
            case 'Editing':
              return { ...baseStyle, backgroundColor: '#FF7B00' };
            case 'Completed':
              return { ...baseStyle, backgroundColor: '#2BB673' };
            default:
              return { ...baseStyle, backgroundColor: '#979797' };
          }
        default:
          return { ...baseStyle, backgroundColor: '#FF7B00' };
      }
    };

    return (
      <div style={getEventStyle()}>
        {event.event_name}
      </div>
    );
  }, [isClient]);

  if (isInitialLoad) {
    return (
      <BookingContainer>
        <HeadingComponent />
      </BookingContainer>
    );
  }

  return (
    <BookingContainer>
      <HeadingComponent />

      {!showAddBooking && (
        <BookingContent>
          <LeftContent>
            <AddBooking>
              <Box
                component="button"
                className="add-booking-link"
                onClick={(e) => handleAddBookingClick(e)}
                sx={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                  cursor: 'pointer',
                  paddingBottom: '20px'
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14, pointerEvents: 'none', marginRight: 5 }} />
                Add New Booking
              </Box>

              <StatusFilter>
                <Box
                  className="status"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  sx={{ cursor: 'pointer', position: 'relative' }}
                >
                  <label htmlFor="statusFilter">Status</label>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{
                      position: 'absolute',
                      right: '25px',
                      top: '27px',
                      transform: isSelectOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      pointerEvents: 'none',
                      color: '#202224'
                    }}
                  />
                </Box>
                <Box
                  id="status-filter-dropdown"
                  className={`dropdown-checkbox ${isSelectOpen ? 'open' : ''}`}
                  ref={dropdownRef}
                  sx={{ display: isSelectOpen ? 'block' : 'none' }}
                >
                  <CheckboxComponent id='approved' name='approved' label='Approved' checked={statusFilters.booked} onChange={() => handleStatusFilterChange('booked')} />
                  <CheckboxComponent id='pending' name='pending' label='Pending' checked={statusFilters.pending} onChange={() => handleStatusFilterChange('pending')} />
                </Box>
              </StatusFilter>
            </AddBooking>

            <Box className="upcoming-event">
              <EventHeading>Upcoming Event</EventHeading>
              <EventDetails sx={{ borderRadius: '22px' }}>
                {isTableLoading  ? (
                  <div className="no-events">Loading events...</div>
                ) : error ? (
                  <div className="no-events">Error loading events</div>
                ) : nearestEvent ? (
                  <ul>
                    <li key={nearestEvent.id}>
                      <span className="label">{nearestEvent.event_name}</span>
                      <span className="date">{format(nearestEvent.start, 'MMMM d yyyy')} {nearestEvent.ceremony_time}</span>
                      <span className="package-type">{nearestEvent.package}</span>
                      <span className="venue">{nearestEvent.booking_address}</span>
                    </li>
                  </ul>
                ) : (
                  <div className="no-events">No upcoming approved events scheduled</div>
                )}
              </EventDetails>
            </Box>
          </LeftContent>

          <BigCalendar>
            {isTableLoading  ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                Loading calendar...
              </div>
            ) : error ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
                Error loading calendar data
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 750 }}
                views={['month', 'week', 'day', 'agenda']}
                view={currentView}
                date={currentDate}
                onView={view => setCurrentView(view as typeof currentView)}
                onNavigate={date => setCurrentDate(date)}
                selectable={canDisableDates}
                dayPropGetter={dayPropGetter}
                onSelectSlot={canDisableDates ? ({ start }) => handleDateSelect(start) : undefined}
                onSelectEvent={handleEventClick}
                components={{
                  event: CustomEvent
                }}
              />
            )}
          </BigCalendar>
        </BookingContent>
      )}

      {selectedEvent && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: '#0000002e',
          boxShadow: 3,
          zIndex: 12,
          p: 3,
          overflowY: 'auto'
        }}>
          <Details>
            <CloseButton onClick={() => {
              setSelectedEvent(null);
              setShowRescheduleForm(false);
            }}>
              <FontAwesomeIcon icon={faXmark} />
            </CloseButton>
            
            {showRescheduleForm ? (
              <Box className="reschedule-form">
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Reschedule Booking
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <CustomDatePicker
                    label="New Booking Date"
                    value={rescheduleDate}
                    onChange={setRescheduleDate}
                    shouldDisableDate={(date) => {
                      return disabledDates.some(d => d.isSame(date, 'day'));
                    }}
                  />
                </Box>

                <Box className="time-picker" sx={{ mb: 3 }}>
                  <CustomTimePicker
                    label="New Ceremony Time"
                    value={rescheduleTime}
                    onChange={(newTime) => {
                      setRescheduleTime(newTime);
                      setTimeError(newTime && !newTime.isValid() ? "Invalid time format" : undefined);
                    }}
                    error={timeError}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowRescheduleForm(false)}
                    disabled={isTableLoading }
                    sx={{ 
                      flex: 1,
                      backgroundColor: '#979797',
                      color: '#fff',
                      borderColor: '#979797',
                      appearance: 'none',
                      boxShadow: 'none',
                      fontWeight: 500,
                      fontSize: '16px',
                      textTransform: 'capitalize',
                      '&:hover': {
                        backgroundColor: '#757575',
                        color: '#fff',
                        borderColor: '#757575',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleRescheduleSubmit}
                    disabled={
                      isTableLoading  || 
                      !rescheduleDate || 
                      !rescheduleTime || 
                      !rescheduleTime.isValid() ||
                      !!timeError
                    }
                    sx={{ 
                      flex: 1,
                      backgroundColor: '#ffc300',
                      color: '#fff',
                      borderColor: '#EFC026',
                      appearance: 'none',
                      boxShadow: 'none',
                      fontWeight: 500,
                      fontSize: '16px',
                      textTransform: 'capitalize',
                      '&:hover': {
                        backgroundColor: '#ddb225',
                        color: '#fff',
                        borderColor: '#cda41f',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {isTableLoading ? <CircularProgress size={20} /> : 'Reschedule'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box 
                  className={`event-head ${selectedEvent.deliverable_status.replace(/\s/g, '-').toLowerCase()}`}
                >
                  <Box className="event-icon"/>
                  <Box className="event-name">
                    <h2 className="title">{selectedEvent.event_name}</h2>
                    <Typography component="span" className="event-date">
                      {format(selectedEvent.start, 'EEEE, MMMM d')}
                    </Typography>
                  </Box>
                </Box>
                <Box className="event-info">
                  <Box className="left-info">
                    {!isClient ? (
                      <Box className="client-info">
                        <Image width={20} height={20} src={icons.eventProfile} alt="package icon" />
                        <Typography component="span">{selectedEvent.customer_name}</Typography>
                      </Box>
                    ) : null}
                    <Box className="client-info">
                      <Image width={20} height={20} src={icons.deliberableIcon} alt="package icon" />
                      <Typography component="span">{selectedEvent.deliverable_status}</Typography>
                    </Box>
                    <Box className="client-info">
                      <Image width={20} height={20} src={icons.packageIcon} alt="package icon" />
                      <Typography component="span">{selectedEvent.package}</Typography>
                    </Box>
                    <Box className="client-info">
                      <Image width={20} height={20} src={icons.packageIcon} alt="package icon" />
                      <Typography component="span">{getAddonNames(selectedEvent.add_ons) || 'None'}</Typography>
                    </Box>
                    <Box className="client-info">
                      <Image width={20} height={20} src={icons.clockIcon} alt="clock icon" />
                      <Typography component="span">
                        {selectedEvent.ceremony_time}
                      </Typography>
                    </Box>
                    <Box className="client-info">
                      <Image width={20} height={20} src={icons.locationIcon} alt="location icon" />
                      <Typography component="span">{selectedEvent.booking_address}</Typography>
                    </Box>
                  </Box>
                </Box>
                {selectedEvent.deliverable_status !== 'Completed' && (                
                  <Box className={`action-btn ${selectedEvent.booking_status === 'approved' ? 'approved' : ''}`}>
                    {(() => {
                      // For non-client users (Owner/Secretary)
                      if (!isClient) {
                        return (
                          <>
                            {/* Reschedule button - always visible for non-clients */}
                            <Button 
                              className="btn reschedule" 
                              onClick={() => handleAction('reschedule')}
                              disabled={isTableLoading}
                            >
                              Reschedule
                            </Button>
                            
                            {/* Action buttons based on booking status */}
                            {selectedEvent.booking_status === 'approved' ? (
                              <>
                                <Button 
                                  className="btn cancel" 
                                  onClick={() => handleAction('cancel')}
                                  disabled={isTableLoading}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  className="btn update" 
                                  onClick={() => handleAction('update')}
                                  disabled={isTableLoading}
                                  startIcon={isTableLoading ? <CircularProgress size={16} /> : null}
                                >
                                  {isTableLoading ? 'Loading...' : 'Update'}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  className="btn reject" 
                                  onClick={() => handleAction('reject')}
                                  disabled={isTableLoading}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  className="btn approve" 
                                  onClick={() => handleAction('approve')}
                                  disabled={isTableLoading}
                                >
                                  Approve
                                </Button>
                              </>
                            )}
                          </>
                        );
                      }
                      // For client users
                        const feedbackDisabled =
                          selectedEvent.deliverable_status !== 'Completed' ||
                          selectedEvent.has_feedback;

                        return (
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {/* Clients only see these buttons regardless of status */}
                            {selectedEvent.booking_status === 'approved' ? (
                              <Button 
                                className="btn cancel" 
                                onClick={() => handleAction('feedback')}
                                disabled={isTableLoading || feedbackDisabled}
                                sx={{ 
                                  pointerEvents: feedbackDisabled  ? 'none' : 'auto',
                                  backgroundColor: feedbackDisabled  ? '#cccccc' : '#2BB673 !important', 
                                  color: '#fff',
                                  '&:hover': {
                                    backgroundColor: feedbackDisabled  ? '#cccccc' : '#155D3A !important',
                                    color: '#fff',
                                  }
                                }}
                              >
                                {selectedEvent.has_feedback ? 'Feedback Submitted' : 'Give Feedback'}
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  className="btn cancel" 
                                  onClick={() => handleAction('cancel')}
                                  disabled={isTableLoading}
                                  sx={{ backgroundColor: '#EF3826 !important', color: '#fff' }}
                                >
                                  Cancel Booking
                                </Button>
                                <Button 
                                  className="btn update" 
                                  onClick={() => handleAction('update')}
                                  disabled={isTableLoading}
                                >
                                  Update
                                </Button>
                              </>
                            )}
                          </Box>
                        );
                    })()}
                  </Box>
                )}
              </>
            )}
          </Details>
        </Box>
      )}

      {/* Show Booking Feedback Modal */}
      {showFeedbackModal && feedbackBooking && (
        <FeedbackModalComponent
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          bookingEvent={feedbackBooking}
          onSubmit={async (feedback: string) => {
            try {
              setIsSubmittingFeedback(true);
              await submitFeedback(feedbackBooking.id, feedback);

              // Update events state to mark this booking as feedback submitted
              setEvents(prevEvents => 
                prevEvents.map(event => 
                  event.id === feedbackBooking.id 
                    ? { ...event, has_feedback: true } 
                    : event
                )
              );

              // Also update the selectedEvent if it's currently open
              setSelectedEvent(prev => 
                prev && prev.id === feedbackBooking.id 
                  ? { ...prev, has_feedback: true } 
                  : prev
              );

              Swal.fire({
                title: 'Success!',
                text: 'Feedback submitted successfully',
                icon: 'success',
                customClass: {
                  container: 'swal-z-index'
                }
              });
              // window.location.reload();
              setShowFeedbackModal(false);
            } catch (err) {
              Swal.fire({
                title: 'Error',
                text: err instanceof Error ? err.message : 'Failed to submit feedback',
                icon: 'error',
                customClass: {
                  container: 'swal-z-index'
                }
              });
            } finally {
              setIsSubmittingFeedback(false);
            }
          }}
          isLoading={isSubmittingFeedback}
        />
      )}

      {showAddBooking && (
        <AddBookingComponent 
          onCancel={handleCancelBooking}
          packageId={searchParams.get('package')}
        />
      )}
    </BookingContainer>
  );
}