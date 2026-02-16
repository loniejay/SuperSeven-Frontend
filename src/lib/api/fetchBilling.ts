import { Billing, FetchBillingsParams } from '@/types/billing';
import { ensureCsrfToken } from '@/utils/crfToken';

export const fetchBillings = async ({ 
  start_year, 
  end_year,
  category,
  page = 1,
  perPage  = 10
}: FetchBillingsParams): Promise<{ 
  data: Billing[], 
  total: number,
  extra?: {
    total_bill: string;
    total_balance: string;
  } 
}> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    // Get user from localStorage to determine role
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    const params = new URLSearchParams({
      'search[value]': '',
      start_year: start_year.toString(),
      end_year: end_year.toString(),
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (category && category !== '') {
      params.append('category', category);
    }

    const fetchBillingsUrl = isClient
      ? `/api/customer/billings?${params.toString()}`
      : `/api/billings?${params.toString()}`;

    const response = await fetch(fetchBillingsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status && result.data) {
      return {
        data: result.data.data,
        total: result.data.meta.total,
        extra: result.data.extra
      };
    }
    throw new Error(result.message || 'Failed to fetch billing data');
  } catch (error) {
    console.error('Error fetching billing data:', error);
    throw error;
  }
};

export const fetchBillingDetails = async (id: string): Promise<Billing> => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('No access token found');

        const fetchBillingDetailsUrl = `/api/billings/${id}`;

        const response = await fetch(fetchBillingDetailsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status && result.data) {
            return result.data;
        }
        throw new Error(result.message || 'Failed to fetch billing details');
    } catch (error) {
        console.error('Error fetching billing details:', error);
        throw error;
    }
};

export async function addPayment(
    billingId: string,
    amount: string,
    paymentMethod: string,
    remarks: string
): Promise<void> {
  
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod);
    formData.append('remarks', remarks);

    const response = await fetch(`/api/billings/${billingId}/add-payment`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'X-XSRF-TOKEN': csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
    }

    return response.json();
}

