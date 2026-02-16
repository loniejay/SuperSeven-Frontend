'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { FormContainer } from './styles';
import { FormHeading } from '../../components/Heading/FormHeading';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { updatePassword } from '@/lib/api/fetchUser';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { useAuth } from '@/context/AuthContext';

export function ChangePasswordComponent(): React.JSX.Element {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors = {
            newPassword: '',
            confirmPassword: '',
        };
        let isValid = true;

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
            isValid = false;
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await updatePassword(formData.newPassword, formData.confirmPassword);
            
            // Update user state
            if (user) {
                updateUser({ ...user });
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Password updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            router.push(paths.home);
        } catch (error: any) {
            // Handle backend validation errors
            if (error.message.includes('password') || error.message.includes('confirm_password')) {
                setErrors(prev => ({
                    ...prev,
                    newPassword: error.message.includes('password') ? error.message : '',
                    confirmPassword: error.message.includes('confirm_password') ? error.message : ''
                }));
            } else {
                await Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to update password',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Your changes will not be saved',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, discard changes',
            cancelButtonText: 'No, keep editing'
        }).then((result) => {
            if (result.isConfirmed) {
                router.push(paths.home);
            }
        });
    };

    return (
        <FormContainer>
            <Box className="wrapper change-password">
                <FormHeading title="Change Password"/>

                <form onSubmit={handleSubmit}>
                    <Box className="row">
                        <Box className="form-group">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <TextField
                                variant="outlined"
                                size="small"
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                id="newPassword"
                                fullWidth
                                className="form-control"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('new')}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPasswords.new ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                    <Box className="row">
                        <Box className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <TextField
                                variant="outlined"
                                size="small"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                id="confirmPassword"
                                fullWidth
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPasswords.confirm ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                    <Box className="row">
                        <Button
                            variant="outlined"
                            className="btn cancel"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            className="btn update"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </FormContainer>
    );
}