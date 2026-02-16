'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Typography
} from '@mui/material';
import { ReportData } from '@/types/reports';

interface ReportsTableProps {
    data: any[];
    loading: boolean;
    error: string | null;
    type?: 'booking' | 'billing';
}

export function ReportsTable({ data, loading, error, type = 'booking' }: ReportsTableProps) {

    const bookingHeader = [
        'Booking Date',
        'Event Name',
        'Client Name',
        'Package',
        'Category'
    ];

    const billingHeader = [
        'Booking Date',
        'Event Name',
        'Status',
        'Total Amount',
        'Balance'
    ];

    const tableHeader = type === 'billing' ? billingHeader : bookingHeader;

    if (error) {
        return (
            <TableContainer component={Paper} style={{ border: '0.3px solid #D5D5D5', boxShadow: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
            </TableContainer>
        );
    }

    if (loading) {
        return (
            <TableContainer component={Paper} style={{ border: '0.3px solid #D5D5D5', boxShadow: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <Table sx={{ minWidth: 650 }} aria-label="workload table">
                    <TableHead>
                        <TableRow>
                            {tableHeader.map((header, index) => (
                                <TableCell key={index} align="left"><b>{header}</b></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...Array(3)].map((_, index) => (
                            <TableRow key={index}>
                                {tableHeader.map((_, cellIndex) => (
                                    <TableCell key={cellIndex} align="left">
                                        <Skeleton variant="text" width="100%" height={10} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <TableContainer
            component={Paper}
            style={{
                border: '0.3px solid #D5D5D5',
                boxShadow: 'none',
                marginTop: '30px',
                borderLeft: 'none',
                borderRight: 'none'
            }}
            className="account-table"
        >
            <Table sx={{ minWidth: 650 }} aria-label="workload table">
                <TableHead>
                    <TableRow>
                        {tableHeader.map((header, index) => (
                            <TableCell key={index} align="left"><b>{header}</b></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row) => (
                            <TableRow key={row.id}>
                                {type === 'billing' ? (
                                    <>
                                        <TableCell>{row.booking_date}</TableCell>
                                        <TableCell>{row.event_name}</TableCell>
                                        <TableCell>{row.billing_status}</TableCell>
                                        <TableCell>₱ {row.total_amount}</TableCell>
                                        <TableCell>₱ {row.balance_due}</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{row.booking_date}</TableCell>
                                        <TableCell>{row.event_name}</TableCell>
                                        <TableCell>{row.customer_name}</TableCell>
                                        <TableCell>{row.package}</TableCell>
                                        <TableCell>{row.category}</TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableHeader.length}>
                                No data available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}