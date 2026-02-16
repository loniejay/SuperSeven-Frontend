'use client';

import React from 'react';
import { Heading, TotalBilling, BillingBox } from "./styles";
import { Box, Button, Typography } from "@mui/material";
import { paths } from '@/paths';
import { usePathname } from 'next/navigation';
import Billing from '@/app/billing/page';

type HeadingProps = {
  totalBilling?: number;
  totalBalance?: number;
};

// Create a mapping between paths and their display titles
const pathTitles: Record<string, string> = {
  [paths.home]: "Dashboard",
  [paths.accounts]: "Accounts",
  [paths.booking]: "Booking",
  [paths.workload]: "Workload",
  [paths.package]: "Package",
  [paths.billing]: "Billing",
  [paths.feedback]: "Feedback",
  [paths.reports]: "Reports",
  [paths.settings]: "Settings"
};

export function HeadingComponent({
  totalBilling = 0,
  totalBalance = 0
}): React.JSX.Element {
  const pathname = usePathname();

  const formatCurrency = (value: number) =>
  value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Check if path starts with /accounts
  if (pathname.startsWith(paths.accounts)) {
    return (
      <Heading className="heading">
        <Typography component="h2" className="title">
          {pathTitles[paths.accounts]}
        </Typography>
      </Heading>
    );
  }

  // Check if path starts with /booking
  if (pathname.startsWith(paths.booking)) {
    return (
      <Heading className="heading">
        <Typography component="h2" className="title">
          {pathTitles[paths.booking]}
        </Typography>
      </Heading>
    );
  }

  //Check if path starts with /workload
  if (pathname.startsWith(paths.workload)) {
    return (
      <Heading className="heading">
        <Typography component="h2" className="title">
          {pathTitles[paths.workload]}
        </Typography>
      </Heading>
    );
  }

  //Check if path starts with /billing
  if (pathname.startsWith(paths.billing)) {
    return (
      <Heading className="heading">
        <Typography component="h2" className="title">
          {pathTitles[paths.billing]}
        </Typography>
        <TotalBilling>
          <BillingBox>
            <Typography component='h3'>Total Billing:</Typography>
            <Typography component='span'><Typography>&#8369;</Typography> {formatCurrency(totalBilling)}</Typography>
          </BillingBox>
          <BillingBox>
            <Typography component='h3'>Total Balance:</Typography>
            <Typography component='span'><Typography>&#8369;</Typography> {formatCurrency(totalBalance)}</Typography>
          </BillingBox>
        </TotalBilling>
      </Heading>
    );
  }

  // Find the matching path or use the current pathname as fallback
  const currentPath = Object.values(paths).find(path => path === pathname) || paths.home;
  const title = pathTitles[currentPath] || "Home";

  return (
    <Heading className="heading">
      <Typography component="h2" className="title">
        {title}
      </Typography>
      
      {pathname.startsWith(paths.reports) && (
        <Button>Download as PDF</Button>
      )}
    </Heading>
  );
}