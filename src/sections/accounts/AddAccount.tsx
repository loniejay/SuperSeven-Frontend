'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { FormContainer } from '@/sections/settings/styles';
import { AddAccountWrapper } from './styles';
import { FormHeading } from '@/components/Heading/FormHeading';
import { HeadingComponent } from '@/components/Heading';
import { FilterBy } from '@/components/Filter';
import { User } from '@/types/user';
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  validateName,
  validateEmail,
  validatePhone,
} from '@/utils/validation';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import Swal from 'sweetalert2';
import { FormSection, FormField } from '@/types/field';
import { addEmployee, updateEmployee, updateClient } from '@/lib/api/fetchAccount';
import { useLoading } from '@/context/LoadingContext';

interface RegisterAccountProps {
    account?: User | null;
    onBackClick: () => void;
    isEditMode?: boolean;
    onSuccess?: () => void;
    existingOwners?: User[];
}

export function RegisterAccount({ 
    account, 
    onBackClick, 
    isEditMode = false,
    onSuccess,
    existingOwners = []
}: RegisterAccountProps): React.JSX.Element {
    const { showLoader, hideLoader } = useLoading();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const ownerExists = existingOwners.some(owner => owner.user_type === '3');
    const isClient = account?.user_type === '1';

    let accountUserType = '4';
    if (account?.user_role === 'Owner') {
        accountUserType = '3';
    } else if (account?.user_role === 'Coordinator') {
        accountUserType = '2';
    } else if (account?.user_role === 'Secretary') {
        accountUserType = '4';
    } else if (account?.user_role === 'Photographer') {
        accountUserType = '5';
    } else if (account?.user_role === 'Editor') {
        accountUserType = '6';
    }
  
    const [formData, setFormData] = useState({
        firstName: account?.first_name || '',
        middleName: account?.mid_name || '',
        lastName: account?.last_name || '',
        email: account?.email || '',
        contactNumber: account?.contact_no || '',
        address: account?.address || '',
        status: account?.status === 'active' ? '1' : account?.status ? '1' : '0',
        userType: accountUserType,
    });

    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' }
    ];

    const userTypeOptions = [
        { value: '2', label: 'Coordinator' },
        { value: '4', label: 'Secretary' },
        { value: '5', label: 'Photographer' },
        { value: '6', label: 'Editor' },
        ...(!ownerExists ? [{ value: '3', label: 'Owner' }] : [])
    ];

    const formSections: FormSection[] = [
        {
            id: "name_section",
            columnCount: 3,
            fields: [
                {
                    id: "firstName",
                    name: "firstName",
                    label: 'First Name',
                    type: "text",
                    required: true
                },
                {
                    id: "middleName",
                    name: "middleName",
                    label: 'Middle Name',
                    type: "text"
                },
                {
                    id: "lastName",
                    name: "lastName",
                    label: 'Last Name',
                    type: "text",
                    required: true
                }
            ]
        },
        {
            id: "contact_section",
            columnCount: 2,
            fields: [
                {
                id: "email",
                name: "email",
                label: 'Email Address',
                type: "email",
                required: true
                },
                {
                id: "contactNumber",
                name: "contactNumber",
                label: 'Contact Number',
                type: "text",
                required: true,
                maxChar: 11
                }
            ]
        },
        {
            id: "address_section",
            columnCount: 1,
            fields: [
                {
                id: "address",
                name: "address",
                label: 'Address',
                type: "text",
                required: true
                }
            ]
        }
    ];

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        // Name validations
        const firstNameError = validateName('First name', formData.firstName);
        if (firstNameError) newErrors.firstName = firstNameError;
        
        const lastNameError = validateName('Last name', formData.lastName);
        if (lastNameError) newErrors.lastName = lastNameError;
        
        if (formData.middleName) {
            const middleNameError = validateName('Middle name', formData.middleName);
            if (middleNameError) newErrors.middleName = middleNameError;
        }
        
        // Email validation
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;
        
        // Phone validation
        const phoneError = validatePhone(formData.contactNumber);
        if (phoneError) newErrors.contactNumber = phoneError;
        
        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        // Owner validation rules
        if (!isEditMode && formData.userType === '3' && ownerExists) {
            newErrors.userType = 'An owner already exists. Only one owner account is allowed.';
        }

        if (isEditMode && account?.user_type === '3' && formData.userType !== '3') {
            newErrors.userType = 'Cannot change owner role. Please delete and recreate the account.';
        }

        if (isEditMode && account?.user_type !== '3' && formData.userType === '3' && ownerExists) {
            newErrors.userType = 'An owner already exists. Cannot change this account to owner.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let sanitizedValue = value;
        
        if (name === 'email') {
            sanitizedValue = sanitizeEmail(value);
        } else if (name === 'contactNumber') {
            sanitizedValue = sanitizePhone(value);
        } else {
            sanitizedValue = sanitizeInput(value);
        }
        
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        showLoader();

        try {
            let result;
            
            if (isClient) {
                // Handle client update
                if (!account?.id) {
                    throw new Error('Client ID is required for update');
                }
                result = await updateClient(account.id, formData);
            } else if (isEditMode) {
                // Handle employee update
                if (!account?.id) {
                    throw new Error('Employee ID is required for update');
                }
                
                // Additional validation for owner role changes
                if (account?.user_type === '3' && formData.userType !== '3') {
                    throw new Error('Cannot change owner role. Please delete and recreate the account.');
                }
                
                if (account?.user_type !== '3' && formData.userType === '3' && ownerExists) {
                    throw new Error('An owner already exists. Cannot change this account to owner.');
                }
                
                result = await updateEmployee(account.id, formData);
            } else {
                // Handle new employee creation
                if (formData.userType === '3' && ownerExists) {
                    throw new Error('An owner already exists. Only one owner account is allowed.');
                }
                
                result = await addEmployee(formData);
            }

            if (!result.success) {
                throw new Error(result.message);
            }

            if (isEditMode) {
                await Swal.fire({
                    title: 'Success!',
                    text: 'Account updated successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK',    
                    confirmButtonColor: '#3085d6',
                });
                router.push(paths.accounts);
            } else {
                const cleanFirstName = formData.firstName.replace(/\s/g, '');
                const cleanLastName = formData.lastName.replace(/\s/g, '');
                
                // Capitalize first letter of first name, leave rest unchanged
                const formattedFirstName = 
                    cleanFirstName.charAt(0).toUpperCase() + 
                    cleanFirstName.slice(1).toLowerCase();
                
                // Convert last name to lowercase
                const formattedLastName = cleanLastName.toLowerCase();
                
                const defaultPassword = `${formattedFirstName}${formattedLastName}12345`;
                
                const { isConfirmed } = await Swal.fire({
                    title: 'Account Created Successfully!',
                    html: `
                        <div>
                            <p><strong>Temporary Password: </strong>${defaultPassword}</p>
                            <p>Please instruct the user to change this password after first login.</p>
                        </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    cancelButtonText: 'Go to accounts page',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                });

                if (!isConfirmed) {
                    window.location.href = paths.accounts;
                } else {
                    // Reset form for new entry
                    setFormData({
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        email: '',
                        contactNumber: '',
                        address: '',
                        status: '1',
                        userType: '4', // Default to Secretary for new entries
                    });
                }
            }

            if (onSuccess) onSuccess();
            
        } catch (err) {
            console.error('Operation error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            await Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : 'An unknown error occurred',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
            hideLoader();
        }
    };

    const renderFormField = (field: FormField) => {
        return (
            <Box className="form-group" key={field.id}>
                <label className="form-label">{field.label}</label>
                <TextField 
                    name={field.name}
                    type={field.type}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                    required={field.required}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    inputProps={{
                        maxLength: field.maxChar
                    }}
                />
            </Box>
        );
    };

    return (
        <AddAccountWrapper>
            <HeadingComponent/>
            <FormContainer className="register-account">
                <Box className="wrapper">
                    <FormHeading title={isEditMode ? "Edit Account" : "Add Account"}/>

                    {ownerExists && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {isEditMode 
                        ? "Note: Editing an owner account. You cannot change the user type."
                        : "Note: An owner account already exists. You can only create non-owner accounts."}
                    </Alert>
                    )}

                    {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {formSections.map(section => (
                            <Box className={`row col-${section.columnCount}`} key={section.id}>
                                {section.fields.map(field => renderFormField(field))}
                            </Box>
                        ))}

                        <Box className="row col-1">
                            {isEditMode ? (
                                <FilterBy
                                    options={statusOptions}
                                    selectedValue={formData.status}
                                    onFilterChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                    label="Status"
                                />
                            ) : (
                                <FilterBy
                                    options={userTypeOptions}
                                    selectedValue={formData.userType}
                                    onFilterChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                                    label="User Type"
                                    disabled={ownerExists && formData.userType === '3'}
                                />
                            )}
                        </Box>

                        {errors.userType && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.userType}
                            </Alert>
                        )}

                        <Box className="row col-1 right">
                            <Button 
                                variant="outlined" 
                                className="btn cancel"
                                onClick={onBackClick}
                                disabled={isSubmitting}
                            >
                            Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                className="btn register"
                                type="submit"
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                            >
                            {isSubmitting ? (isEditMode ? "Updating..." : "Registering...") : (isEditMode ? "Update" : "Register")}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </FormContainer>
        </AddAccountWrapper>
    );
}