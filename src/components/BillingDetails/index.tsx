'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { BillingCard, DetailsContent, Details, Assessment, AssessmentDetails } from './styles';
import { FormHeading } from '@/components/Heading/FormHeading';
import { Billing } from '@/types/billing';
import { formatAmount, getAddonNames } from '@/utils/billing';
import { useAuth } from '@/context/AuthContext';

// DetailItem component for rendering key-value pairs
const DetailItem = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
  <Box className="detail">
    <Box className="label">
      <Typography component="p">{label}</Typography>
    </Box>
    <Box className="data">
      <Typography component="p">{value || 'N/A'}</Typography>
    </Box>
  </Box>
);

// Component for Billing Details section
export function DetailsSection({ billing }: { billing: Billing }) {
  return (
    <DetailsContent>
      <FormHeading title="Billing Details :" />
      <Details className="details">
        <DetailItem label="Event Name" value={billing.event_name} />
        <DetailItem label="Package" value={billing.package} />
        <DetailItem label="Client" value={billing.customer_name} />
        <DetailItem label="Add-on" value={getAddonNames(billing.add_ons) || 'None'} />
        <DetailItem label="Status" value={billing.status} />
        <DetailItem label="Booking ID" value={billing.booking_id} />
      </Details>
    </DetailsContent>
  );
}

// Component for Assessment section with conditional rendering
export function AssessmentSection({ billing, isPartial }: { billing: Billing; isPartial: boolean }) {
  const { user } = useAuth();
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

  return (
    <Assessment className={`assessments ${isClient ? 'client' : ''}`}>
      <FormHeading title="Assessment :" />
      
      {isPartial ? (
        <AssessmentDetails>
          <DetailItem label="Package Price" value={formatAmount(billing.total_amount)} />
          <DetailItem label="Amount Paid" value={formatAmount(billing.total_amount_paid)} />
          <DetailItem label="Total Balance" value={formatAmount(billing.balance)} />
        </AssessmentDetails>
      ) : (
        <AssessmentDetails>
          <DetailItem label="Package Amount" value={formatAmount(billing.package_amount)} />
          <DetailItem label="Add-on Amount" value={formatAmount(billing.add_on_amount)} />
          <DetailItem label="Discount (LESS)" value={formatAmount(billing.discounted_amount)} />
          <DetailItem label="Total Amount" value={formatAmount(billing.total_amount)} />
        </AssessmentDetails>
      )}
    </Assessment>
  );
}

// Main component that uses the separated sections
export function BillingDetailsComponent({ billing }: { billing: Billing }): React.JSX.Element {
  const isPartial = billing.status.toLowerCase() === 'partial';
  const { user } = useAuth();
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');
  
  return (
    <BillingCard>
      <DetailsSection billing={billing} />
      {!isClient ? (
        <AssessmentSection billing={billing} isPartial={isPartial} />
      ) : null}
    </BillingCard>
  );
}