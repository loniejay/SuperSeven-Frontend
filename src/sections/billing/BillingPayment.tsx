'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { BillingDetailsComponent, AssessmentSection } from '@/components/BillingDetails';
import { HeadingComponent } from '@/components/Heading';
import { BillingPaymentContainer, BillingDetails, TransactionWrapper } from './styles';
import { Billing, BillingDetailsProps } from '@/types/billing';
import { PaymentCardComponent } from '@/components/paymentCard';
import { TransactionTable } from '@/components/TransactionTable';
import { fetchBillingDetails } from '@/lib/api/fetchBilling';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';

// Create a simple cache outside the component
const billingCache = new Map<string, Billing>();

export default function BillingPayment({ billingId }: BillingDetailsProps): React.JSX.Element {
    const { showLoader, hideLoader } = useLoading();
    const [isLoading, setIsLoading] = useState(true);
    const [billing, setBilling] = useState<Billing | null>(null);
    const [error, setError] = useState('');
    const { user } = useAuth();
    
    // Memoize derived values
    const isClient = useMemo(() => user?.user_role === 'Client' || user?.user_role === 'Coordinator', [user]);
    const isPartial = useMemo(() => billing?.status.toLowerCase() === 'partial', [billing]);

    const loadBillingDetails = useCallback(async () => {
        // Check cache first
        if (billingCache.has(billingId)) {
            const cachedData = billingCache.get(billingId);
            setBilling(cachedData || null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            showLoader();
            const data = await fetchBillingDetails(billingId);
            
            // Update cache
            billingCache.set(billingId, data);
            
            setBilling(data);
            setError('');
        } catch (err) {
            setError('Failed to load billing details');
            console.error(err);
        } finally {
            setIsLoading(false);
            hideLoader();
        }
    }, [billingId, showLoader, hideLoader]);

    // Invalidate cache and refetch when needed
    const refreshBillingDetails = useCallback(async () => {
        billingCache.delete(billingId); // Clear cache entry
        await loadBillingDetails();
    }, [billingId, loadBillingDetails]);

    // Fetch data only when needed
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (isMounted) {
                await loadBillingDetails();
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [loadBillingDetails]);

    if (isLoading) {
        return (
            <BillingPaymentContainer>
                <HeadingComponent />
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                </Box>
            </BillingPaymentContainer>
        );
    }
    
    if (error) {
        return (
            <BillingPaymentContainer>
                <HeadingComponent />
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </BillingPaymentContainer>
        );
    }
    
    if (!billing) {
        return (
            <BillingPaymentContainer>
                <HeadingComponent />
                <Typography sx={{ p: 2 }}>Billing not found</Typography>
            </BillingPaymentContainer>
        );
    }
    
    return (
        <BillingPaymentContainer>
            <HeadingComponent />
            <BillingDetails>
                <BillingDetailsComponent billing={billing} />
                {!isClient && (
                    <PaymentCardComponent 
                        billing={billing} 
                        billingId={billingId} 
                        onPaymentSuccess={refreshBillingDetails} 
                    />
                )}
                {isClient && (
                    <AssessmentSection billing={billing} isPartial={isPartial} />
                )}
            </BillingDetails>
            <TransactionWrapper>
                <TransactionTable transactions={billing.transactions} />
            </TransactionWrapper>
        </BillingPaymentContainer>
    );
}