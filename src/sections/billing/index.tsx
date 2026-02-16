'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeContainer } from '@/sections/adminHome/styles';
import { YearSelector } from './styles';
import { HeadingComponent } from '@/components/Heading';
import BillingTable from './BillingTable';
import { SearchBox } from '@/components/Search';
import { 
  Box, 
  FormControl,
  MenuItem,
  Select, 
  SelectChangeEvent, 
  Alert
} from '@mui/material';
import { Billing } from '@/types/billing';
import { icons } from '@/icons';
import Image from 'next/image';
import { fetchBillings } from '@/lib/api/fetchBilling';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomTablePagination } from '@/components/TablePagination';
import { useLoading } from '@/context/LoadingContext';
import { categoryFilterOptions } from '@/utils/filterOptions';
import { FilterBy } from '@/components/Filter';

// Calendar icon for year selector
const CalendarIcon = (props: any) => (
  <Image
    width={20}
    height={20} 
    src={icons.caledarIcon} 
    alt="calendar" 
    {...props}
    style={{ 
      width: 20, 
      height: 20, 
      marginRight: 8,
      pointerEvents: 'none'
    }} 
  />
);

// Type for year ranges
type YearPair = {
  start: number;
  end: number;
};

// Map filter values to actual category names
const categoryMap: Record<string, string> = {
  '0': 'Others',
  '1': 'Birthday',
  '2': 'Prenup',
  '3': 'Debut',
  '4': 'Wedding'
};

export default function BillingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoading();
  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  };

  // State
  const [selectedYearPair, setSelectedYearPair] = useState<YearPair>({
      start: new Date().getFullYear(),
      end: new Date().getFullYear() + 1
  });
  const [billingData, setBillingData] = useState<Billing[]>([]);
  const [filteredData, setFilteredData] = useState<Billing[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');  
  const [cache, setCache] = useState<Record<string, { data: Billing[], total: number }>>({});
  
    const [totalBilling, setTotalBilling] = useState<number>(0);
    const [totalBalance, setTotalBalance] = useState<number>(0);

  // Prepare year range options
  const yearPairs = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const pairs: YearPair[] = [];
      const startYear = currentYear - 2;

      for (let i = 0; i < 10; i++) {
          const start = startYear + (i * 2);
          pairs.push({ start, end: start + 1 });
      }

      return pairs;
  }, []);

  // Initialize filter and page from URL query
  useEffect(() => {
      const urlFilter = searchParams.get('filter');
      const urlPage = searchParams.get('page');

      if (urlFilter && categoryFilterOptions.some(opt => opt.value === urlFilter)) {
          setFilterValue(urlFilter);
      }

      if (urlPage) {
          setPage(parseInt(urlPage, 10));
      }
  }, [searchParams]);

  // Handle year change
  const handleYearChange = (event: SelectChangeEvent<string>) => {
      const [start, end] = event.target.value.split('-').map(Number);
      setSelectedYearPair({ start, end });
      setPage(0);
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
      setFilterValue(value);
      setPage(0);
      setCache({}); // clear cache for new filter
  };    

    const loadBillingData = useCallback(async () => {
    try {
        setLoading(true);

        const firstPageResponse = await fetchBillings({
            page: 1,
            perPage: rowsPerPage,
            start_year: selectedYearPair.start,
            end_year: selectedYearPair.end,
        });

        const totalRecords = firstPageResponse.total;

        // Calculate how many pages exist in backend
        const totalPages = Math.ceil(totalRecords / rowsPerPage);

        // Store all records here
        let allData = [...firstPageResponse.data];

        if (totalPages > 1) {
            for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
                const response = await fetchBillings({
                    page: currentPage,
                    perPage: rowsPerPage,
                    start_year: selectedYearPair.start,
                    end_year: selectedYearPair.end,
                });

                // Merge results into one array
                allData = [...allData, ...response.data];
            }
        }

        const categoryFiltered = filterValue && filterValue !== ''
        ? allData.filter(item => item.category === categoryMap[filterValue])
        : allData;

        const searchFiltered = searchTerm && searchTerm.trim() !== ''
        ? categoryFiltered.filter(item =>
                item.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.package?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.status?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        : categoryFiltered;

        const computedTotalBilling = searchFiltered.reduce(
            (sum, item) => sum + Number(item.total_amount || 0),
            0
        );

        const computedTotalBalance = searchFiltered.reduce(
            (sum, item) => sum + Number(item.balance || 0),
            0
        );

        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        const paginatedData = searchFiltered.slice(startIndex, endIndex);
        
        setTotalBilling(computedTotalBilling);
        setTotalBalance(computedTotalBalance);
        setBillingData(paginatedData);
        setTotalCount(searchFiltered.length);

    } catch (error) {
        console.error('Error loading billing data:', error);
    } finally {
        setLoading(false);
    }
    }, [
        page,
        rowsPerPage,
        selectedYearPair,
        filterValue,
        searchTerm
    ]);


  // Debounced fetch
  useEffect(() => {
      const timer = setTimeout(() => {
          loadBillingData();
      }, 300);

      return () => clearTimeout(timer);
  }, [loadBillingData]);

  // Local search filter
  const filterData = useCallback(() => {
      if (!searchTerm.trim()) return billingData;

      const term = searchTerm.toLowerCase();
      return billingData.filter(item => 
          (item.event_name?.toLowerCase().includes(term)) ||
          (item.customer_name?.toLowerCase().includes(term)) ||
          (item.status?.toLowerCase().includes(term)) ||
          (item.package?.toLowerCase().includes(term))
      );
  }, [billingData, searchTerm]);

  // Update filteredData whenever billingData or searchTerm changes
  useEffect(() => {
      setFilteredData(filterData());
  }, [billingData, searchTerm, filterData]);

  // Navigate to billing details
  const handleViewBilling = (billingId: string) => {
      router.push(`/billing/${billingId}`);
  };

  // Pagination handlers
  const handlePageChange = (
      event: React.MouseEvent<HTMLButtonElement> | null, 
      newPage: number
  ) => {
      setPage(newPage);
  };

  const handleRowsPerPageChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      setPage(0);
  };

  return (
      <HomeContainer>
          <HeadingComponent
                totalBilling={totalBilling}
                totalBalance={totalBalance}
          />

          {/* Year & Category Filter */}
          <YearSelector>
              <FormControl 
                  size="small"
                  sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}
              >
                  <Select
                      value={`${selectedYearPair.start}-${selectedYearPair.end}`}
                      onChange={handleYearChange}
                      IconComponent={CalendarIcon}
                      inputProps={{ 'aria-label': 'Select billing year range' }}
                      sx={{ 
                          width: "100%", 
                          minWidth: "300px", 
                          height: "50px", 
                          borderRadius: "4px", 
                          backgroundColor: "#FFFFFF",
                          '.MuiSelect-select': { 
                              paddingRight: '40px !important',
                              display: 'flex',
                              alignItems: 'center'
                          }
                      }}
                  >
                      {yearPairs.map((pair, index) => (
                          <MenuItem key={index} value={`${pair.start}-${pair.end}`}>
                              {`${pair.start} - ${pair.end}`}
                          </MenuItem>
                      ))}
                  </Select>

                  {/* Category Filter */}
                  <FilterBy
                      options={categoryFilterOptions}
                      selectedValue={filterValue}
                      onFilterChange={handleFilterChange}
                      label="Filter By:"
                  />
              </FormControl>

              {/* Search box */}
              <SearchBox 
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="Search billings..."
              />
          </YearSelector>

          {/* Error message */}
          {error && (
              <Box sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
              </Box>
          )}

          {/* Billing table */}
          <Box sx={{ marginBottom: '150px', maxWidth: '1640px' }}>
              <BillingTable 
                  billingData={filteredData}
                  onView={handleViewBilling}
                  isLoading={isTableLoading}
              />

              <CustomTablePagination
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
              />
          </Box>
      </HomeContainer>
  );
}
