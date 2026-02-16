'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AddBookingContainer, BookingWrapper } from './styles';
import { FormHeading } from '@/components/Heading/FormHeading';
import { FormSection, FormField } from '@/types/field';
import { Box, TextField, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { FilterBy } from '@/components/Filter';
import { icons } from '@/icons';
import Image from 'next/image';
import { paths } from '@/paths';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { PackageProps, AddOnsProps } from '@/types/field';
import { formatCurrency } from '@/utils/billing';
import {
  fetchInitialBookingData,
  fetchUnavailableDatesForMonth,
  submitBooking,
} from '@/lib/api/fetchBooking';
import CustomDatePicker from '@/components/datepicker';
import CustomTimePicker from '@/components/TimePicker';
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  validateName,
  validateEmail,
  validatePhone,
} from '@/utils/validation';

interface AddBookingComponentProps {
  onCancel: () => void;
  packageId?: string | null;
}

export default function AddBookingComponent({ onCancel, packageId }: AddBookingComponentProps) {
  const { user } = useAuth();
  const userRole = user?.user_role;
  
  const categoryTypeOptions = [
    { value: '', label: 'Select category' },
    { value: '0', label: 'Others' },
    { value: '1', label: 'Birthday' },
    { value: '2', label: 'Prenup' },
    { value: '3', label: 'Debut' },
    { value: '4', label: 'Wedding' },
  ]
  
  const [state, setState] = useState({
    isPackageDropdownOpen: false,
    packageSearch: "",
    selectedPackage: null as PackageProps | null,
    packages: [] as PackageProps[],
    addOns: [] as AddOnsProps[],
    selectedAddOns: [] as number[],
    disabledDates: [] as Date[],
    loading: {
      packages: true,
      addOns: true,
      submitting: false,
      disabledDates: true,
      user: true
    },
    error: {
      packages: null as string | null,
      addOns: null as string | null,
      disabledDates: null as string | null,
      form: null as string | null
    },
    formData: {
      bookingDate: null as Dayjs | null,
      formattedBookingDate: "",
      eventName: "",
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      contactNumber: "",
      bookingAddress: "",
      ceremonyTime: dayjs() as Dayjs,
      categoryType: "",
    },
    errors: {} as Record<string, string>
  });

  const filteredPackages = state.packages.filter(pkg =>
    pkg.packageName
      .toLowerCase()
      .includes(state.packageSearch.toLowerCase())
  );

  // Pre-fill client data when available
  useEffect(() => {
    if (userRole === 'Client' && user) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, user: false },
        formData: {
          ...prev.formData,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          contactNumber: user.contact_no || '',
          address: user.address || '',
        }
      }));
    } else if (userRole) {
      setState(prev => ({ ...prev, loading: { ...prev.loading, user: false } }));
    }
  }, [user, userRole]);

  // Show SweetAlert for form errors
  useEffect(() => {
    if (state.error.form) {
      Swal.fire({
        title: 'Error!',
        text: state.error.form,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2BB673',
      }).then(() => {
        setState(prev => ({ ...prev, error: { ...prev.error, form: null } }));
      });
    }
  }, [state.error.form]);

  // Show SweetAlert for package loading errors
  useEffect(() => {
    if (state.error.packages) {
      Swal.fire({
        title: 'Loading Error',
        text: state.error.packages,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2BB673',
      });
    }
  }, [state.error.packages]);

  // Show SweetAlert for add-ons loading errors
  useEffect(() => {
    if (state.error.addOns) {
      Swal.fire({
        title: 'Loading Error',
        text: state.error.addOns,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2BB673',
      });
    }
  }, [state.error.addOns]);

  // Show SweetAlert for disabled dates loading errors
  useEffect(() => {
    if (state.error.disabledDates) {
      Swal.fire({
        title: 'Warning',
        text: `Couldn't load all date restrictions: ${state.error.disabledDates}`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2BB673',
      });
    }
  }, [state.error.disabledDates]);

  const formatBookingDate = (date: Date) => {
    return format(date, "MMMM d, yyyy (eeee)");
  };

  const shouldDisableDate = (date: Dayjs) => {
    const jsDate = new Date(date.year(), date.month(), date.date());
    
    return state.disabledDates.some(disabledDate => {
      const disabledDateObj = new Date(disabledDate);
      const disabledDateNormalized = new Date(disabledDateObj.getFullYear(), disabledDateObj.getMonth(), disabledDateObj.getDate());
      
      return disabledDateNormalized.getTime() === jsDate.getTime();
    });
  };

  const validateDate = (date: Dayjs | null): boolean => {
    if (!date) return false;
    
    const jsDate = new Date(date.year(), date.month(), date.date());
    
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 30);
    minDate.setHours(0, 0, 0, 0);
    
    if (jsDate.getTime() < minDate.getTime()) return false;
    
    return !state.disabledDates.some(disabledDate => {
      const disabledDateObj = new Date(disabledDate);
      const disabledDateLocal = new Date(
        disabledDateObj.getFullYear(),
        disabledDateObj.getMonth(),
        disabledDateObj.getDate()
      );
      return disabledDateLocal.getTime() === jsDate.getTime();
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { approvedDates, packages, addOns, initialUnavailableDates } = await fetchInitialBookingData();

        console.log('Fetch Initial Data:', { approvedDates, packages, addOns, initialUnavailableDates });

        // Find the selected package if packageId is provided
        const selectedPackage = packageId
        ? packages.find(pkg => pkg.id.toString() === packageId) ?? null
        : null
        
        setState(prev => ({
          ...prev,
          disabledDates: [...approvedDates, ...initialUnavailableDates],
          packages,
          addOns,
          selectedPackage,
          loading: { 
            ...prev.loading, 
            packages: false,
            addOns: false,
            disabledDates: false
          }
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: {
            ...prev.error,
            disabledDates: err instanceof Error ? err.message : 'Failed to load disabled dates',
            packages: err instanceof Error ? err.message : 'Failed to load packages',
            addOns: err instanceof Error ? err.message : 'Failed to load add-ons'
          },
          loading: {
            ...prev.loading,
            packages: false,
            addOns: false,
            disabledDates: false
          }
        }));
      }
    };

    loadData();
  }, []);

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      const jsDate = date.toDate();
      const isValid = validateDate(date);
      
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          bookingDate: date,
          formattedBookingDate: formatBookingDate(jsDate)
        },
        errors: {
          ...prev.errors,
          booking_date: isValid ? "" : "Date is unavailable or must be at least 30 days from today",
          bookingDate: isValid ? "" : "Date is unavailable or must be at least 30 days from today"
        }
      }));
    }
  };

  const handleMonthChange = (date: Dayjs) => {
    const month = date.month() + 1;
    const year = date.year();
    fetchUnavailableDatesForMonth(month, year)
      .then(newDates => {
        setState(prev => {
          const existingDates = new Set(prev.disabledDates.map(d => 
            new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
          ));
          
          const uniqueNewDates = newDates.filter((date: Date) => {
            const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return !existingDates.has(normalizedDate.getTime());
          });
          
          return {
            ...prev,
            disabledDates: [...prev.disabledDates, ...uniqueNewDates]
          };
        });
      })
      .catch(err => {
        console.error('Error fetching unavailable dates:', err);
      });
  };

  // Define common sections
  const commonSections: FormSection[] = [
    {
      id: "booking-date",
      columnCount: 2,
      fields: [
        {
          id: "booking-date",
          name: "bookingDate",
          label: "Booking Date",
          type: "custom-date",
          required: true
        }, 
        {
          id: "ceremony-time",
          name: "ceremonyTime",
          label: "Ceremony Time",
          type: "custom-time",
          required: true
        }
      ]
    },
    {
      id: "event-name",
      columnCount: 1,
      fields: [
        {
          id: "event-name",
          name: "eventName",
          label: "Event Name",
          type: "text",
          required: true
        }
      ]
    }
  ];

  // Define personal info sections only for non-client users
  const personalSections: FormSection[] = userRole === 'Client' ? [] : [
    {
      id: "first-name",
      columnCount: 1,
      fields: [
        {
          id: "first-name",
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true
        }
      ]
    },
    {
      id: "last-name",
      columnCount: 1,
      fields: [
        {
          id: "last-name",
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true
        }
      ]
    },
    {
      id: "address",
      columnCount: 1,
      fields: [
        {
          id: "address",
          name: "address",
          label: "Address",
          type: "text",
          required: true
        }
      ]
    },
    {
      id: "email",
      columnCount: 1,
      fields: [
        {
          id: "email",
          name: "email",
          label: "Email Address",
          type: "email",
          required: true
        }
      ]
    },
    {
      id: "contact-number",
      columnCount: 1,
      fields: [
        {
          id: "contact-number",
          name: "contactNumber",
          label: "Contact Number",
          type: "text",
          required: true,
          maxChar: 11
        }
      ]
    }
  ];

  // Combine sections based on user role
  const bookingForm: FormSection[] = [
    ...commonSections,
    ...personalSections
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { formData } = state;

    // Sanitize all input fields
    const sanitizedData = {
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      email: sanitizeEmail(formData.email),
      contactNumber: sanitizePhone(formData.contactNumber),
      address: sanitizeInput(formData.address),
      bookingAddress: sanitizeInput(formData.bookingAddress),
      eventName: sanitizeInput(formData.eventName)
    };

    // Validate booking date
    if (!formData.bookingDate) {
      newErrors.booking_date = 'Booking date is required';
      newErrors.bookingDate = 'Booking date is required';
    } else if (!validateDate(formData.bookingDate)) {
      newErrors.booking_date = 'Date is unavailable or must be at least 30 days from today';
      newErrors.bookingDate = 'Date is unavailable or must be at least 30 days from today';
    }

    // Only validate personal fields for non-client users
    if (userRole !== 'Client') {
      // Validate first name
      const firstNameError = validateName('First name', formData.firstName);
      if (firstNameError) newErrors.first_name = firstNameError;

      // Validate last name
      const lastNameError = validateName('Last name', formData.lastName);
      if (lastNameError) newErrors.last_name = lastNameError;

      // Validate email
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;

      // Validate contact number
      const phoneError = validatePhone(formData.contactNumber);
      if (phoneError) newErrors.contact_no = phoneError;

      // Validate address
      if (!sanitizedData.address.trim()) newErrors.address = 'Address is required';
    }

    // Validate other required fields
    if (!sanitizedData.eventName.trim()) newErrors.event_name = 'Event name is required';
    if (!sanitizedData.bookingAddress.trim()) newErrors.booking_address = 'Booking address is required';
    if (!state.selectedPackage) newErrors.package_id = 'Please select a package';

    if (formData.categoryType === '') {
      newErrors.category_type = 'Event category is required';
    }

    // Update state with sanitized data and errors
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...sanitizedData
      },
      errors: newErrors
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Filter out numbers for first and last name fields
    let filteredValue = value;
    if (name === 'firstName' || name === 'lastName') {
      filteredValue = value.replace(/[0-9]/g, '');
    } else if (name === 'contactNumber') {
      filteredValue = value.replace(/\D/g, '');
    }

    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === 'contactNumber' ? value.replace(/\D/g, '') : value
      },
      errors: {
        ...prev.errors,
        [name]: '',
        [name === 'firstName' ? 'first_name' : 
         name === 'lastName' ? 'last_name' :
         name === 'contactNumber' ? 'contact_no' :
         name === 'eventName' ? 'event_name' :
         name === 'bookingAddress' ? 'booking_address' : name]: ''
      }
    }));
  };

  const handleTimeChange = (newTime: Dayjs | null) => {
    if (newTime) {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          ceremonyTime: newTime
        }
      }));
    }
  };

  const handlePackageSelect = (pkg: PackageProps) => {
    setState(prev => ({
      ...prev,
      selectedPackage: pkg,
      packageSearch: pkg.packageName,
      isPackageDropdownOpen: false,
      errors: {
        ...prev.errors,
        package_id: ''
      }
    }));
  };

  const handleAddOnToggle = (addOnId: number) => {
    setState(prev => {
      const newSelectedAddOns = prev.selectedAddOns.includes(addOnId)
        ? prev.selectedAddOns.filter(id => id !== addOnId)
        : [...prev.selectedAddOns, addOnId];
      
      return {
        ...prev,
        selectedAddOns: newSelectedAddOns
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ 
      ...prev, 
      error: { ...prev.error, form: null },
      errors: {} 
    }));
    
    if (!validateForm()) return;

    setState(prev => ({ ...prev, loading: { ...prev.loading, submitting: true } }));

    try {
      await submitBooking(
        state.formData,
        state.selectedPackage!.id.toString(),
        state.selectedAddOns,
        state.packages
      );
      const cleanFirstName = state.formData.firstName.replace(/\s/g, '');
      const cleanLastName = state.formData.lastName.replace(/\s/g, '');

      // Capitalize first letter of first name, leave rest unchanged
      const formattedFirstName = 
        cleanFirstName.charAt(0).toUpperCase() + 
        cleanFirstName.slice(1);
      
      // Convert last name to lowercase
      const formattedLastName = cleanLastName.toLowerCase();

      const defaultPassword = `${formattedFirstName}${formattedLastName}12345`;

      if (userRole === 'Client') {
        await Swal.fire({
          title: 'Success!',
          text: 'Booking created successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        await Swal.fire({
          title: 'Success!',
          text: 'Booking created successfully!',
          html: `
            <div>
              <p><strong>Temporary Password: </strong>${defaultPassword}</p>
              <p>Please instruct the user to change this password after first login.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
      
      window.location.href = paths.booking;
    } catch (err: any) {
      let newErrors: Record<string, string> = {};
      
      // Check if the error contains field-specific validation errors
      if (err.errors) {
        // Convert the error object to match our error state structure
        Object.keys(err.errors).forEach(key => {
          // Take the first error message if it's an array
          const errorMessage = Array.isArray(err.errors[key]) 
            ? err.errors[key][0] 
            : err.errors[key];
          
          // Map backend field names to frontend field names if needed
          const frontendFieldName = 
            key === 'first_name' ? 'firstName' :
            key === 'last_name' ? 'lastName' :
            key === 'contact_no' ? 'contactNumber' :
            key === 'event_name' ? 'eventName' :
            key === 'booking_address' ? 'bookingAddress' :
            key;
          
          newErrors[frontendFieldName] = errorMessage;
          newErrors[key] = errorMessage; // Also keep the backend field name for compatibility
        });
      } else {
        // Fallback to general error message if no field-specific errors
        setState(prev => ({
          ...prev,
          error: {
            ...prev.error,
            form: err instanceof Error ? err.message : 'Booking failed'
          }
        }));
      }

      setState(prev => ({
        ...prev,
        errors: newErrors,
        loading: {
          ...prev.loading,
          submitting: false
        }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: {
          ...prev.loading,
          submitting: false
        }
      }));
    }
  };

  const renderFormField = (field: FormField) => {
    if (field.type === "custom-date") {
      return (
        <Box className="form-group" key={field.id}>
          <label className="form-label">
            {field.label}
            {field.required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <CustomDatePicker
            value={state.formData.bookingDate}
            onChange={handleDateChange}
            onMonthChange={handleMonthChange}
            label=""
            required
            error={state.errors.bookingDate || state.errors.booking_date}
            minDate={dayjs().add(30, 'day')}
            shouldDisableDate={shouldDisableDate}
          />
        </Box>
      );
    }

    if (field.type === "custom-time") {
      return (
        <Box className="form-group" key={field.id}>
          <label className="form-label">
            {field.label}
            {field.required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <CustomTimePicker 
            value={state.formData.ceremonyTime}
            onChange={handleTimeChange}
            label=""
          />
        </Box>
      );
    }

    const backendFieldName = 
      field.name === 'firstName' ? 'first_name' :
      field.name === 'lastName' ? 'last_name' :
      field.name === 'contactNumber' ? 'contact_no' :
      field.name === 'eventName' ? 'event_name' :
      field.name === 'bookingAddress' ? 'booking_address' : field.name;

    return (
      <Box className="form-group" key={field.id}>
        <label className="form-label">
          {field.label}
          {field.required && <span style={{ color: 'red' }}>*</span>}
        </label>
        <TextField 
          name={field.name}
          type={field.type}
          value={state.formData[field.name as keyof typeof state.formData]}
          onChange={handleInputChange}
          variant="outlined" 
          size="small" 
          fullWidth 
          required={field.required}
          error={!!state.errors[field.name] || !!state.errors[backendFieldName]}
          helperText={state.errors[field.name] || state.errors[backendFieldName]}
          inputProps={{
            maxLength: field.maxChar
          }}
        />
      </Box>
    );
  };

  const handleCancel = () => {
    onCancel();
  }

  return (
    <AddBookingContainer>
      <BookingWrapper>
        <FormHeading title="Add New Booking"/>

        {state.error.disabledDates && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Couldn't load all date restrictions: {state.error.disabledDates}
          </Alert>
        )}

        <form 
          onSubmit={handleSubmit}
        >
          <Box 
            className="form-wrapper add-account"
            style={{
              flexDirection: userRole === 'Client' ? 'column' : 'row'
            }}
          >
            <Box 
              className="form-row"
              sx={{ 
                display: 'flex',
                gap: '20px', 
                flexDirection: userRole === 'Client' ? 'row' : 'column', 
                width: userRole === 'Client' ? '100%' : '50%', 
              }}
            >
              <Box className="row col-1">
                <FilterBy
                  options={categoryTypeOptions}
                  selectedValue={state.formData.categoryType}
                  onFilterChange={(value) =>
                    setState(prev => ({
                      ...prev,
                      formData: {
                        ...prev.formData,
                        categoryType: value
                      },
                      errors: {
                        ...prev.errors,
                        category_type: ''
                      }
                    }))
                  }
                  label="Event Category"
                />
                {state.errors.category_type && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 0.5, display: 'block' }}
                  >
                    {state.errors.category_type}
                  </Typography>
                )}
              </Box>
              {state.loading.user ? (
                <CircularProgress size={24} sx={{ mt: 2 }} />
              ) : (
                bookingForm.map(section => (
                  <Box 
                    className={`row col-${section.columnCount}`} 
                    key={section.id}
                    sx={{ display: 'flex', gap: '20px', width: '100%' }}
                  >
                    {section.fields.map(field => renderFormField(field))}
                  </Box>
                ))
              )}
            </Box>

            <Box 
              className="form-row"
              sx={{ 
                display: userRole === 'Client' ? 'grid' : 'flex', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px', 
                flexDirection: 'column', 
                width: userRole === 'Client' ? '100%' : '50%' 
              }}
            >
              <Box className="form-group">
                <label className="form-label">
                  Reception:
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <TextField
                  name="bookingAddress"
                  value={state.formData.bookingAddress}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  required
                  error={!!state.errors.bookingAddress || !!state.errors.booking_address}
                  helperText={state.errors.bookingAddress || state.errors.booking_address}
                />
              </Box>

              <Box className="form-group">
                <label className="form-label">
                  Package <span style={{ color: 'red' }}>*</span>
                </label>

                {/* Input */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: state.errors.package_id ? '1px solid #d32f2f' : '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'text',
                    backgroundColor: '#f7faf5'
                  }}
                  onClick={() =>
                    setState(prev => ({
                      ...prev,
                      isPackageDropdownOpen: true
                    }))
                  }
                >
                  <TextField
                    placeholder="Search package..."
                    variant="standard"
                    className='dropdown-search'
                    fullWidth
                    value={state.packageSearch}
                    onChange={(e) =>
                      setState(prev => ({
                        ...prev,
                        packageSearch: e.target.value,
                        isPackageDropdownOpen: true
                      }))
                    }
                    InputProps={{ disableUnderline: true }}
                    sx={{ background: "none", border: "none" }}
                  />

                  <Image
                    src={icons.angleDown}
                    alt="dropdown"
                    width={12}
                    height={7}
                    style={{
                      marginLeft: '8px',
                      transform: state.isPackageDropdownOpen ? 'rotate(180deg)' : 'none'
                    }}
                  />
                </Box>

                {/* Dropdown */}
                {state.isPackageDropdownOpen && (
                  <Box
                    sx={{
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginTop: '4px',
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}
                  >
                    {filteredPackages.length > 0 ? (
                      filteredPackages.map(pkg => (
                        <Box
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg)}
                          sx={{
                            padding: '12px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                          }}
                        >
                          <Typography fontWeight={600}>
                            {pkg.packageName}
                          </Typography>
                          <Typography variant="body2">
                            {pkg.package_details}
                          </Typography>
                          <Typography fontWeight={600}>
                            {formatCurrency(pkg.package_price)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ p: 2 }} color="text.secondary">
                        No packages found
                      </Typography>
                    )}
                  </Box>
                )}

                {state.errors.package_id && (
                  <Typography color="error" variant="caption">
                    {state.errors.package_id}
                  </Typography>
                )}
              </Box>

              <Box className="form-group">
                <label className="form-label">Add-Ons:</label>
                {state.loading.addOns ? (
                  <CircularProgress size={20} />
                ) : state.error.addOns ? (
                  <Alert severity="error">{state.error.addOns}</Alert>
                ) : (
                  <Box 
                    className="addon-list dropdown-list"
                    sx={{ 
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {state.addOns.length > 0 ? (
                      state.addOns.map((addOn) => (
                        <Box 
                          key={addOn.id}
                          className="addon-item row" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'flex-start',
                            padding: '8px 0',
                            borderBottom: '1px solid #eee',
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`addon-${addOn.id}`}
                            checked={state.selectedAddOns.includes(addOn.id)}
                            onChange={() => handleAddOnToggle(addOn.id)}
                            style={{ 
                              marginRight: '12px',
                              width: '18px',
                              height: '18px'
                            }}
                          />
                          <label htmlFor={`addon-${addOn.id}`} style={{ flex: 1 }}>
                            <Typography component='p' fontWeight="600" textTransform="capitalize">
                              {addOn.addOnName}
                            </Typography>
                            <Typography component='span' className='addon-details'>{addOn.addOnDetails}</Typography>
                            <Typography component='p' className='addon-price'>{formatCurrency(addOn.addOnPrice)}</Typography>
                          </label>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No add-ons available
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {userRole !== 'Client' ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleCancel}
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
                    type="submit"
                    disabled={state.loading.submitting || state.loading.user}
                    startIcon={state.loading.submitting ? <CircularProgress size={20} /> : null}
                    sx={{
                      backgroundColor: '#2BB673',
                      '&:hover': {
                        backgroundColor: '#155D3A'
                      },
                      padding: '10px 15px',
                      fontSize: '14px',
                      fontWeight: '500 !important'
                    }}
                  >
                    {state.loading.submitting ? 'Submitting...' : 'Submit Booking'}
                  </Button>
                </Box>
              ) : null}

            </Box>
            
          </Box>
          
          {userRole === 'Client' ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                sx={{
                  color: '#FFFFFF',
                  borderColor: '#AAAAAA',
                  backgroundColor: '#AAAAAA',
                  padding: '10px 15px',
                  fontSize: '14px',
                  fontWeight: '500 !important',
                  boxShadow: 'none',
                  
                  '&:hover': {
                    backgroundColor: '#898989',
                    color: 'white'
                  },
                }}
              >
                Cancel
              </Button>

              <Button 
                variant="contained" 
                type="submit"
                disabled={state.loading.submitting || state.loading.user}
                startIcon={state.loading.submitting ? <CircularProgress size={20} /> : null}
                sx={{
                  backgroundColor: '#2BB673',
                  padding: '10px 15px',
                  fontSize: '14px',
                  fontWeight: '500 !important',
                  boxShadow: 'none',
                  
                  '&:hover': {
                    backgroundColor: '#155D3A'
                  },
                }}
              >
                {state.loading.submitting ? 'Submitting...' : 'Submit Booking'}
              </Button>
            </Box>
          ) : null}
        </form>
      </BookingWrapper>
    </AddBookingContainer>
  );
}