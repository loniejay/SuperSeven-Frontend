import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Skeleton,
  Button
} from '@mui/material';
import { Billing } from '@/types/billing';
import { formatAmount, getAddonNames } from '@/utils/billing';
import { useAuth } from '@/context/AuthContext';
import { format, parseISO } from 'date-fns';

interface BillingTableProps {
    billingData: Billing[];
    onView: (billingId: string) => void;
    isLoading: boolean;
}

export default function BillingTable({ billingData, onView, isLoading }: BillingTableProps) {
    const { user } = useAuth();
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    const tableHeader = [
        'ID',
        'EVENT NAME',
        'CATEGORY',
        'EVENT DATE',
        ...(isClient ? [] : ['CLIENT']),
        'PACKAGE',
        'ADD-ON',
        'TOTAL AMOUNT',
        'BALANCE',
        'STATUS',
        'ACTION'
    ];
    
    return (
        <TableContainer
            component={Paper}
            style={{
                borderRadius: '14px',
                border: '0.3px solid #D5D5D5',
                boxShadow: 'none',
            }}
            className='account-table'
        >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {tableHeader.map((header, index) => (
                            <TableCell key={index} align="left"><b>{header}</b></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                <TableBody>
                    {isLoading ? (
                        Array.from(new Array(3)).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            {!isClient && <TableCell><Skeleton variant="text" /></TableCell>}
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                        </TableRow>
                        ))
                    ) : billingData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={tableHeader.length} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="textSecondary">
                                    No billing records found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        billingData.map((billing) => (
                            <TableRow key={billing.id} hover>
                                <TableCell>{billing.booking_id}</TableCell>
                                <TableCell>{billing.event_name}</TableCell>
                                <TableCell>{billing.category}</TableCell>
                                <TableCell> {format(parseISO(billing.event_date), 'MMMM dd, yyyy')}</TableCell>
                                {!isClient && <TableCell>{billing.customer_name}</TableCell>}
                                <TableCell>{billing.package}</TableCell>
                                <TableCell>{getAddonNames(billing.add_ons) || 'None'}</TableCell>
                                <TableCell>{formatAmount(billing.total_amount)}</TableCell>
                                <TableCell>{formatAmount(billing.balance)}</TableCell>
                                <TableCell className={`status ${billing.status.toLowerCase()}`}>
                                    <Typography component="span">
                                        {billing.status}
                                    </Typography>
                                </TableCell>
                                <TableCell align="left">
                                    <Button 
                                        className='billing-view-button'
                                        onClick={() => onView(billing.id.toString())}
                                    >
                                        view
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}