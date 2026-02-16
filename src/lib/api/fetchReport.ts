import { ReportResponse, BillingResponse, FetchReportParams } from '@/types/reports';

export const fetchBookingReport = async (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        // Format month to 2 digits (e.g., 2 -> 02)
        const formattedStartMonth = String(startMonth).padStart(2, '0');
        const formattedEndMonth = String(endMonth).padStart(2, '0');

        // Create YYYY-MM format
        const startMonthYear = `${startYear}-${formattedStartMonth}`;
        const endMonthYear = `${endYear}-${formattedEndMonth}`;

        const url = `/api/report/bookings?start_month_year=${startMonthYear}&end_month_year=${endMonthYear}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch booking data');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching booking data:', error);
        throw error;
    }
};

export const fetchPackageReport = async (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const start = `${startYear}-${String(startMonth).padStart(2, '0')}`;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}`;

        const url = `/api/report/packages?start_month_year=${start}&end_month_year=${end}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch package data');
        }

        return data.data; // contains labels, values, colors
    } catch (error) {
        console.error('Error fetching package data:', error);
        throw error;
    }
};

export const fetchAddonsReport = async (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const start = `${startYear}-${String(startMonth).padStart(2, '0')}`;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}`;

        const url = `/api/report/addons?start_month_year=${start}&end_month_year=${end}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch addons data');
        }

        return data.data; // contains labels, values, colors
    } catch (error) {
        console.error('Error fetching addons data:', error);
        throw error;
    }
};

export const fetchBookingInformation = async ({ 
    startYear,
    startMonth,
    endYear,
    endMonth,
    page = 1,
    perPage = 10
}: FetchReportParams): Promise<ReportResponse> => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const start = `${startYear}-${String(startMonth).padStart(2, '0')}`;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}`;

        const url = `/api/report/transactions?start_month_year=${start}&end_month_year=${end}&page=${page}&per_page=${perPage}`;
        const response = await fetch(url,
            {
                headers: {
                'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status && result.data) {
            return {
                data: result.data.data,
                links: result.data.links,
                meta: result.data.meta
            };
        }
        throw new Error(result.message || 'Failed to fetch report data');
    } catch (error) {
        console.error('Error fetching report data:', error);
        throw error;
    }
};

export const fetchBillingInformation = async ({
    startYear,
    startMonth,
    endYear,
    endMonth,
    page = 1,
    perPage = 10
}: FetchReportParams): Promise<BillingResponse> => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const start = `${startYear}-${String(startMonth).padStart(2, '0')}`;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}`;

        const url = `/api/report/billings?start_month_year=${start}&end_month_year=${end}&page=${page}&per_page=${perPage}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status && result.data) {
            return result.data;
        }

        throw new Error(result.message || 'Failed to fetch billing data');
    } catch (error) {
        console.error('Error fetching billing data:', error);
        throw error;
    }
};

export const fetchPDFReport = async ({
    startYear,
    startMonth,
    endYear,
    endMonth
}: {
    startYear: number;
    startMonth: number;
    endYear: number;
    endMonth: number;
}) => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const start = `${startYear}-${String(startMonth).padStart(2, '0')}`;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}`;

        const url = `/api/generate-report?start_month_year=${start}&end_month_year=${end}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        link.setAttribute(
            'download',
            `report_${start}_to_${end}.pdf`
        );

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error('Error downloading PDF report:', error);
        throw error;
    }
};
