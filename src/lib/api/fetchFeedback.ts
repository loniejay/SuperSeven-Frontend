import Swal from 'sweetalert2';
import { paths } from '@/paths';
import { 
    MappedFeedbackItem, 
    FeedbackApiItem,
    FeedbackDetailResponse,
    PostedFeedback,
    FeedbackApiResponse
} from '@/types/feedback';
import { ensureCsrfToken } from '@/utils/crfToken';

export async function fetchFeedbacks(
  searchTerm: string = '',
  filterValue: string = '0',
  page: number = 1,
  perPage: number = 10,
): Promise<{ data: MappedFeedbackItem[]; total: number }> {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Unauthenticated');
        }

        const headers = new Headers({
            'Accept': 'application/json'
        });
        headers.append('Authorization', `Bearer ${accessToken}`);

        const params = new URLSearchParams({
            'search[value]': searchTerm || '',
            'page': page.toString(),
            'perPage': perPage.toString()
        });

        if (filterValue === '1') params.set('filters[posted]', 'true');
        else if (filterValue === '2') params.set('filters[unposted]', 'true');
        else if (filterValue === '3') params.set('filters[pending]', 'true');

        const response = await fetch(`/api/feedbacks?${params.toString()}`, {
            headers,
            credentials: 'include'
        });

        if (response.status === 401) {
            throw new Error('Unauthenticated');
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to fetch feedbacks');
        }

        if (!responseData.data?.data) {
            throw new Error('Invalid data format');
        }

        return {
            data: responseData.data.data.map((item: FeedbackApiItem) => ({
                id: item.id.toString(),
                event_name: item.event_name,
                customer_name: item.customer_name?.trim() || 'Unknown Client',
                booking_date: item.booking_date,
                feedback_date: item.feedback_date,
                feedback_status: item.feedback_status,
                feedback_detail: item.feedback_detail
            })),
            total: responseData.data.meta?.total || 0
        };

    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        
        if (error instanceof Error && error.message === 'Unauthenticated') {
            // Use window.location instead of router to ensure complete reload
            window.location.href = `${paths.login}?redirect=${encodeURIComponent(window.location.pathname)}`;
            return { data: [], total: 0 };
        }

        await Swal.fire({
            title: 'Error!',
            text: error instanceof Error ? error.message : 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK'
        });

        return { data: [], total: 0 };
    }
}

export async function submitFeedback(
  bookingId: number, 
  feedback_details: string
): Promise<void> {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const formData = new FormData();
    formData.append("feedback_details", feedback_details);

    const url = `/api/customer/bookings/${bookingId}/feedback/add`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create feedback');
    }

    return response.json();
}

export async function viewFeedback(bookingId: number): Promise<FeedbackDetailResponse> {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');
  
    const endpoint = isClient
        ? `/api/customer/bookings/${bookingId}/feedback/view`
        : `/api/feedbacks/${bookingId}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        // Handle 404 specifically for "feedback not found"
        if (response.status === 404) {
            throw new Error('Feedback not found');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch feedback');
    }

    return response.json();
}

export async function markAsPosted(feedbackId: number): Promise<void> {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const method = 'POST';
    const url = `/api/feedbacks/${feedbackId}/mark-as-posted`;

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to post feedback`);
    }

    return response.json();
}

export async function markAsUnposted(feedbackId: number): Promise<void> {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const method = 'POST';
    const url = `/api/feedbacks/${feedbackId}/mark-as-unposted`;

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unpost feedback');
    }

    return response.json();
}

export async function fetchPostedFeedbacks(
    isLoggingOut: boolean
): Promise<PostedFeedback[]> {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Unauthenticated');
        }

        const headers = new Headers({
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        });

        const response = await fetch('/api/dashboard/feedbacks', {
            method: 'GET',
            headers,
            credentials: 'include'
        });

        if (response.status === 401) {
            throw new Error('Unauthenticated');
        }

        const responseData = await response.json();

        if (!response.ok) {
            if(!isLoggingOut) {
                throw new Error(`Failed to fetch add-ons: ${response.status} ${response.statusText}`);
            }
        }

        if (!Array.isArray(responseData.data)) {
            throw new Error('Invalid data format');
        }

        return responseData.data.map((item: any) => ({
            id: item.id,
            event_name: item.event_name,
            customer_name: item.customer_name,
            booking_date: item.booking_date,
            ceremony_time: item.ceremony_time,
            package_name: item.package_name,
            add_ons: item.add_ons || [],
            feedback_date: item.feedback_date,
            feedback_status: item.feedback_status,
            feedback_detail: item.feedback_detail
        }));

    } catch (error) {
        console.error('Error fetching posted feedbacks:', error);
        
        if (error instanceof Error && error.message === 'Unauthenticated') {
            window.location.href = `${paths.login}?redirect=${encodeURIComponent(window.location.pathname)}`;
            return [];
        }

        await Swal.fire({
            title: 'Error!',
            text: error instanceof Error ? error.message : 'An error occurred',
            icon: 'error',
            confirmButtonText: 'OK'
        });

        return [];
    }
}