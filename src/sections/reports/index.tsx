'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { HomeContainer } from '@/sections/adminHome/styles';
import {
  BoxWrapper,
  Heading,
  YearDropdown,
  SelectBox,
  DropdownList,
  DropdownMonth,
  YearBox,
  HeadingWrapper,
  PackageBar,
} from './styles';
import { Box, FormControl, Typography, Button, CircularProgress, Skeleton } from '@mui/material';
import Image from 'next/image';
import { icons } from '@/icons';
import { ReportsTable } from './ReportTable';
import DynamicApexChart from '@/components/chart/DynamicApexChart';
import { ApexOptions } from 'apexcharts';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ReportData, BillingData } from '@/types/reports';
import {
  fetchBookingInformation,
  fetchBookingReport,
  fetchPackageReport,
  fetchPDFReport,
  fetchAddonsReport,
  fetchBillingInformation,
} from '@/lib/api/fetchReport';
import { CustomTablePagination } from '@/components/TablePagination';
import { useLoading } from '@/context/LoadingContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const monthLabels = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Calendar icon component
const CalendarIcon = (props: any) => (
  <Image
    width={20}
    height={20}
    src={icons.caledarIcon}
    alt="calendar"
    {...props}
    style={{ width: 20, height: 20, marginRight: 8, pointerEvents: 'none' }}
  />
);

// Helper to convert month string to comparable number
const getComparableDate = (year: number, month: string) => (year * 100) + (monthLabels.indexOf(month) + 1);

export default function ReportsHome(): React.JSX.Element {
  const { showLoader, hideLoader } = useLoading();
  const currentYear = new Date().getFullYear();

  /** -------------------- STATE -------------------- **/
  // Date Range
  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState('January');
  const [endYear, setEndYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState('December');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Booking data
  const [bookingData, setBookingData] = useState<Record<string, number>>({});
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Package & Addons
  const [packageData, setPackageData] = useState({ labels: [], values: [], backgroundColors: [], borderColors: [] });
  const [addonsData, setAddonsData] = useState({ labels: [], values: [], backgroundColors: [], borderColors: [] });
  const [isPackageLoading, setIsPackageLoading] = useState(false);
  const [isAddonsLoading, setIsAddonsLoading] = useState(false);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [addonsError, setAddonsError] = useState<string | null>(null);

  // Booking Table
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Billing Table
  const [billingData, setBillingData] = useState<BillingData[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingPage, setBillingPage] = useState(0);
  const [billingRowsPerPage, setBillingRowsPerPage] = useState(10);
  const [billingTotalCount, setBillingTotalCount] = useState(0);

  // PDF download
  const [isDownloading, setIsDownloading] = useState(false);

  /** -------------------- EFFECTS -------------------- **/
  // Ensure start date is not after end date
  useEffect(() => {
    const startValue = getComparableDate(startYear, startMonth);
    const endValue = getComparableDate(endYear, endMonth);

    if (startValue > endValue) {
      setStartYear(endYear);
      setStartMonth(endMonth);
      setEndYear(startYear);
      setEndMonth(startMonth);
    }
  }, [startYear, startMonth, endYear, endMonth]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(event.target as Node)) setIsStartOpen(false);
      if (endRef.current && !endRef.current.contains(event.target as Node)) setIsEndOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** -------------------- DATA FETCHERS -------------------- **/
  const fetchBookingData = useCallback(async () => {
    try {
      setIsBookingLoading(true);
      setBookingError(null);
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      const data = await fetchBookingReport(startYear, startMonthNum, endYear, endMonthNum);
      setBookingData(data);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to load booking data');
    } finally {
      setIsBookingLoading(false);
    }
  }, [startYear, startMonth, endYear, endMonth]);

  const fetchPackageData = useCallback(async () => {
    try {
      setIsPackageLoading(true);
      setPackageError(null);
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      const data = await fetchPackageReport(startYear, startMonthNum, endYear, endMonthNum);
      setPackageData(data);
    } catch (err) {
      setPackageError(err instanceof Error ? err.message : 'Failed to load package data');
    } finally {
      setIsPackageLoading(false);
    }
  }, [startYear, startMonth, endYear, endMonth]);

  const fetchAddonsData = useCallback(async () => {
    try {
      setIsAddonsLoading(true);
      setAddonsError(null);
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      const data = await fetchAddonsReport(startYear, startMonthNum, endYear, endMonthNum);
      setAddonsData(data);
    } catch (err) {
      setAddonsError(err instanceof Error ? err.message : 'Failed to load addons data');
    } finally {
      setIsAddonsLoading(false);
    }
  }, [startYear, startMonth, endYear, endMonth]);

  const fetchBookingDataInfo = useCallback(async () => {
    try {
      setIsTableLoading(true);
      setError(null);
      showLoader();
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      const res = await fetchBookingInformation({
        startYear, startMonth: startMonthNum, endYear, endMonth: endMonthNum, page: page + 1, perPage: rowsPerPage
      });
      setReportData(res.data);
      setTotalCount(res.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsTableLoading(false);
      hideLoader();
    }
  }, [startYear, startMonth, endYear, endMonth, page, rowsPerPage, showLoader, hideLoader]);

  const fetchBilling = useCallback(async () => {
    try {
      setBillingLoading(true);
      setBillingError(null);
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      const res = await fetchBillingInformation({
        startYear, startMonth: startMonthNum, endYear, endMonth: endMonthNum,
        page: billingPage + 1, perPage: billingRowsPerPage
      });
      setBillingData(res.data);
      setBillingTotalCount(res.meta.total);
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Failed to fetch billing');
    } finally {
      setBillingLoading(false);
    }
  }, [startYear, startMonth, endYear, endMonth, billingPage, billingRowsPerPage]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      showLoader();
      const startMonthNum = monthLabels.indexOf(startMonth) + 1;
      const endMonthNum = monthLabels.indexOf(endMonth) + 1;
      await fetchPDFReport({ startYear, startMonth: startMonthNum, endYear, endMonth: endMonthNum });
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloading(false);
      hideLoader();
    }
  };

  /** -------------------- HANDLERS -------------------- **/
  const toggleStartDropdown = () => { setIsStartOpen(prev => !prev); setIsEndOpen(false); };
  const toggleEndDropdown = () => { setIsEndOpen(prev => !prev); setIsStartOpen(false); };

  const handleStartYearDecrease = () => setStartYear(prev => prev - 1);
  const handleStartYearIncrease = () => setStartYear(prev => prev + 1);
  const handleEndYearDecrease = () => setEndYear(prev => prev - 1);
  const handleEndYearIncrease = () => setEndYear(prev => prev + 1);

  const handleStartMonthSelect = (month: string) => { setStartMonth(month); setIsStartOpen(false); };
  const handleEndMonthSelect = (month: string) => {
    if (getComparableDate(endYear, month) >= getComparableDate(startYear, startMonth)) {
      setEndMonth(month); 
      setIsEndOpen(false);
    }
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /** -------------------- CHART OPTIONS -------------------- **/
  const lineOptions: ApexOptions = useMemo(() => {
    const maxValue = Math.max(10, ...Object.values(bookingData));
    return {
      chart: { height: 310, type: 'line', toolbar: { show: false }, fontFamily: 'Nunito Sans, sans-serif' },
      colors: ['#2BB673'],
      stroke: { curve: 'straight', width: [2] },
      markers: { size: 2, strokeColors: '#2BB673', strokeWidth: 2, hover: { size: 6 } },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.55, opacityTo: 0 } },
      grid: { xaxis: { lines: { show: false } }, yaxis: { padding: 100, lines: { show: true } } },
      tooltip: { enabled: true },
      xaxis: { categories: Object.keys(bookingData), labels: { style: { fontFamily: 'Nunito Sans', fontSize: '14px', colors: '#333' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { min: 0, max: maxValue + 5, labels: { style: { fontFamily: 'Nunito Sans', fontSize: '14px', colors: '#333' } }, title: { text: '', style: { fontSize: '0px' } } },
      legend: { show: false },
      dataLabels: { enabled: false }
    };
  }, [bookingData]);

  const lineSeries = useMemo(() => [{ name: 'Bookings', data: Object.values(bookingData) }], [bookingData]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutQuart' as const },
    transitions: { active: { animation: { duration: 400 } } },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, drawBorder: false } },
      y: { beginAtZero: true, grid: { display: false, drawBorder: false } }
    },
    categoryPercentage: 0.9,
    barPercentage: 0.8,
  }), []);

  const packageBarData = useMemo(() => ({
    labels: packageData.labels,
    datasets: [{ data: packageData.values, backgroundColor: packageData.backgroundColors, borderColor: packageData.borderColors, borderWidth: 1, borderRadius: 6 }]
  }), [packageData]);

  const addonsBarData = useMemo(() => ({
    labels: addonsData.labels,
    datasets: [{ data: addonsData.values, backgroundColor: addonsData.backgroundColors, borderColor: addonsData.borderColors, borderWidth: 1, borderRadius: 8 }]
  }), [addonsData]);

  /** -------------------- DATA FETCHING EFFECTS -------------------- **/
  useEffect(() => { const timer = setTimeout(fetchBookingData, 300); return () => clearTimeout(timer); }, [fetchBookingData]);
  useEffect(() => { const timer = setTimeout(fetchPackageData, 300); return () => clearTimeout(timer); }, [fetchPackageData]);
  useEffect(() => { const timer = setTimeout(fetchAddonsData, 300); return () => clearTimeout(timer); }, [fetchAddonsData]);
  useEffect(() => { setPage(0); fetchBookingDataInfo(); }, [startYear, startMonth, endYear, endMonth]);
  useEffect(() => { fetchBookingDataInfo(); }, [page, rowsPerPage]);
  useEffect(() => { setBillingPage(0); }, [startYear, startMonth, endYear, endMonth]);
  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  /** -------------------- RENDER -------------------- **/
  return (
    <HomeContainer>
      {/* Header */}
      <HeadingWrapper>
        <Typography component="h2" className='title'>Reports</Typography>
        <Button onClick={handleDownloadPDF} disabled={isDownloading} startIcon={isDownloading ? <CircularProgress size={16} /> : null}>
          {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
        </Button>
      </HeadingWrapper>

      {/* Date Range Selectors */}
      <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
        {/* START DROPDOWN */}
        <YearDropdown sx={{ minWidth: 210 }} ref={startRef}>
          <FormControl className='form' fullWidth>
            <SelectBox onClick={toggleStartDropdown}>
              {`${startYear} - ${startMonth}`}
              <Image width={20} height={20} src={icons.angleDown} alt='angle down'
                style={{ transform: isStartOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}
              />
            </SelectBox>
            {isStartOpen && (
              <DropdownList className="dropdown">
                <YearBox>
                  <Typography>{startYear}</Typography>
                  <Box>
                    <Image width={20} height={20} src={icons.angleLeft} alt='left' onClick={handleStartYearDecrease} style={{ cursor: 'pointer' }} />
                    <Image width={20} height={20} src={icons.angleRight} alt='right' onClick={handleStartYearIncrease} style={{ cursor: 'pointer' }} />
                  </Box>
                </YearBox>
                <DropdownMonth>{monthLabels.map((month) => <Typography key={month} onClick={() => handleStartMonthSelect(month)}>{month}</Typography>)}</DropdownMonth>
              </DropdownList>
            )}
          </FormControl>
        </YearDropdown>

        {/* END DROPDOWN */}
        <YearDropdown sx={{ minWidth: 210 }} ref={endRef}>
          <FormControl className='form' fullWidth>
            <SelectBox onClick={toggleEndDropdown}>
              {`${endYear} - ${endMonth}`}
              <Image width={20} height={20} src={icons.angleDown} alt='angle down'
                style={{ transform: isEndOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}
              />
            </SelectBox>
            {isEndOpen && (
              <DropdownList className="dropdown">
                <YearBox>
                  <Typography>{endYear}</Typography>
                  <Box>
                    <Image width={20} height={20} src={icons.angleLeft} alt='left' onClick={handleEndYearDecrease} style={{ cursor: 'pointer' }} />
                    <Image width={20} height={20} src={icons.angleRight} alt='right' onClick={handleEndYearIncrease} style={{ cursor: 'pointer' }} />
                  </Box>
                </YearBox>
                <DropdownMonth>{monthLabels.map((month) => <Typography key={month} onClick={() => handleEndMonthSelect(month)}>{month}</Typography>)}</DropdownMonth>
              </DropdownList>
            )}
          </FormControl>
        </YearDropdown>
      </Box>

      {/* Charts */}
      <BoxWrapper>
        <Heading><Typography component="p">Number of Bookings</Typography></Heading>
        <Box sx={{ width: '100%', height: 'auto' }}>
          {isBookingLoading ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading booking data...</Box>
          ) : bookingError ? (
            <Typography color="error">Error loading booking data: {bookingError}</Typography>
          ) : (
            <DynamicApexChart options={lineOptions} series={lineSeries} type="area" height={350} />
          )}
        </Box>
      </BoxWrapper>

      <BoxWrapper>
        <Heading sx={{ marginBottom: '20px' }}><Typography component="p">Availed Packages</Typography></Heading>
        <PackageBar sx={{ width: '100%', height: '300px' }}>
          {isPackageLoading ? (
            <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
          ) : packageError ? (
            <Typography color="error">Error loading package data: {packageError}</Typography>
          ) : packageData.labels.length > 0 ? (
            <Bar options={barOptions} data={packageBarData} />
          ) : (
            <Typography sx={{ marginTop: '50px' }}>No package data available</Typography>
          )}
        </PackageBar>
      </BoxWrapper>

      <BoxWrapper>
        <Heading sx={{ marginBottom: '20px' }}><Typography component="p">Availed Add-Ons</Typography></Heading>
        <PackageBar sx={{ width: '100%', height: '300px' }}>
          {isAddonsLoading ? (
            <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
          ) : addonsError ? (
            <Typography color="error">Error loading addons data: {addonsError}</Typography>
          ) : addonsData.labels.length > 0 ? (
            <Bar options={barOptions} data={addonsBarData} />
          ) : (
            <Typography sx={{ marginTop: '50px' }}>No addons data available</Typography>
          )}
        </PackageBar>
      </BoxWrapper>

      {/* Booking Reports Table */}
      <BoxWrapper sx={{ padding: '0px' }}>
        <Heading sx={{ padding: '30px', paddingBottom: '0px' }}><Typography component="p">Booking Information</Typography></Heading>
        <ReportsTable data={reportData} loading={isTableLoading} error={error} />
      </BoxWrapper>

      <Box sx={{ marginTop: '-40px', padding: '0px', maxWidth: '1640px' }}>
        <CustomTablePagination
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      {/* Billing Reports Table */}
      <BoxWrapper sx={{ padding: '0px' }}>
        <Heading sx={{ padding: '30px', paddingBottom: '0px' }}><Typography component="p">Billing Information</Typography></Heading>
        <ReportsTable data={billingData} loading={billingLoading} error={billingError} type="billing" />
      </BoxWrapper>

      <Box sx={{ marginBottom: '150px', marginTop: '-40px', padding: '0px', maxWidth: '1640px' }}>
        <CustomTablePagination
          count={billingTotalCount}
          rowsPerPage={billingRowsPerPage}
          page={billingPage}
          onPageChange={(e, p) => setBillingPage(p)}
          onRowsPerPageChange={(e) => { setBillingRowsPerPage(parseInt(e.target.value, 10)); setBillingPage(0); }}
        />
      </Box>
    </HomeContainer>
  );
}
