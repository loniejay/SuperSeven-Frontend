'use client';

import React from 'react';
import { IconButton } from '@/sections/accounts/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton
} from '@mui/material';
import { icons } from '@/icons';
import { formatCurrency } from '@/utils/billing';

interface DataTableProps {
  data: any[];
  isLoading: boolean;
  headers: string[];
  type: 'package' | 'addon';
  noDataText: string;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export default function DataTable({ 
  data, 
  isLoading, 
  headers, 
  type,
  noDataText,
  onEdit,
  onDelete
}: DataTableProps) {
  const getRowData = (row: any) => {
    if (type === 'package') {
      return {
        name: row.package_name,
        price: formatCurrency(row.package_price),
        details: row.package_details
      };
    } else {
      return {
        name: row.add_on_name,
        price: formatCurrency(row.add_on_price),
        details: row.add_on_details
      };
    }
  };

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
            {headers.map((header, index) => (
              <TableCell key={index} align="left"><b>{header}</b></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell sx={{ display: 'flex', gap: '8px' }}>
                  <Skeleton sx={{ borderRadius: '8px' }} variant="circular" width={30} height={30} />
                  <Skeleton sx={{ borderRadius: '8px' }} variant="circular" width={30} height={30} />
                </TableCell>
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((row) => {
              const rowData = getRowData(row);
              return (
                <TableRow key={row.id}>
                  <TableCell align='left'>{rowData.name}</TableCell>
                  <TableCell align="left">{rowData.price}</TableCell>
                  <TableCell align="left">
                    {rowData.details.split(',').map((part: string, i: number) => {
                      const trimmedPart = part.trim();
                      return (
                        <div key={i}>
                          {trimmedPart.length > 50 
                            ? `${trimmedPart.substring(0, 50)}...` 
                            : trimmedPart}
                        </div>
                      );
                    })}
                  </TableCell>
                  <TableCell align="left">
                    <IconButton onClick={() => onDelete(row)}>
                      <img src={icons.removeIcon} className="remove-icon" alt="remove icon" />
                    </IconButton>
                    <IconButton onClick={() => onEdit(row)}>
                      <img src={icons.editIcon} className="edit-icon" alt="edit icon" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                {noDataText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}