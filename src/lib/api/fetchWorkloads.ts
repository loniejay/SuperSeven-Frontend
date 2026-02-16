import Swal from 'sweetalert2';
import { paths } from '@/paths';
import { icons } from '@/icons';
import { 
  ApiWorkloadResponse, 
  MappedWorkloadItem, 
  WorkloadApiItem, 
  statusMap,
  WorkloadAvatar,
  Employee,
  ApiResponse,
  DeliverableStatus
} from '@/types/workload';
import { ensureCsrfToken } from '@/utils/crfToken';

async function handleApiResponse(response: Response): Promise<{ success: boolean; message?: string }> {
  let data = {};
  const contentType = response.headers.get('content-type');
  
  if (response.status !== 204 && contentType?.includes('application/json')) {
      data = await response.json();
  }

  if (!response.ok) {
      const message = (data as any)?.message || 'Operation failed';
      throw new Error(message);
  }

  return { success: true };
}

function mapApiItem(item: WorkloadApiItem): MappedWorkloadItem {
  const avatars: WorkloadAvatar[] = (item.assigned_employees || []).map(emp => ({
    id: emp.id,
    name: emp.full_name,
    avatar: emp.avatar || icons.profileIcon
  }));

  return {
    id: item.id.toString(),
    eventName: item.event_name,
    client: item.customer_name?.trim() || 'Unknown Client',
    bookingDate: item.booking_date,
    assigned: avatars,
    releaseDate: item.completion_date,
    ceremony_time: item.ceremony_time,
    package_name: item.package_name,
    status: statusMap[item.deliverable_status || 0],
    deliverableStatus: item.deliverable_status || 0,
    booking_workload_status: item.booking_workload_status,
    booking_address: item.booking_address,
    link: item.link || ''
  };
}


export async function fetchWorkloads(
  searchTerm: string = '',
  filterValue: string = 'all',
  router: any,
  page: number = 1,
  perPage: number = 10,
  isLoggingOut: boolean = false
): Promise<{ 
  data: MappedWorkloadItem[]; 
  total: number;
  lastPage: number;
}> {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const params = new URLSearchParams({
      'search[value]': searchTerm || '',
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (filterValue !== 'all') {
      params.set('filters[deliverable_status]', filterValue);
    } else {
      params.set('filters[deliverable_status]', 'false');
    }

    const response = await fetch(`/api/workload?${params.toString()}`, {
      headers,
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch workloads');
    }

    const result: ApiWorkloadResponse = responseData;
    
    if (!result.data || !Array.isArray(result.data.data)) {
      throw new Error('Invalid data format received from API');
    }

    return {
      data: result.data.data.map(mapApiItem),
      total: result.data.meta.total,
      lastPage: result.data.meta.last_page
    };

  } catch (error) {
    if (!isLoggingOut) {
      await Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }

    if (!isLoggingOut && error instanceof Error && (error.message === 'No access token found' || error.message.includes('401'))) {
      router.push(paths.login);
    }

    return {
      data: [],
      total: 0,
      lastPage: 1
    };
  }
}

export const fetchAvailableEmployees = async (workloadId: string): Promise<Employee[]> => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`/api/workload/${workloadId}/employees`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) throw new Error('Failed to fetch available employees');

    const data: ApiResponse<Employee[]> = await response.json();
    if (!data.status) throw new Error(data.message);

    return data.data;
};

export const fetchWorkloadDetailsById = async (workloadId: string): Promise<WorkloadApiItem> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token found');

  const response = await fetch(`/api/workload/${workloadId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
  });

  if (!response.ok) throw new Error('Failed to fetch booking details');

  const data: ApiResponse<WorkloadApiItem> = await response.json();
  if (!data.status) throw new Error(data.message);

  return data.data;
};

export async function fetchEmployeeWorkloads(
  searchTerm: string = '',
  filterValue: string = 'all',
  router: any,
  page: number = 1,
  perPage: number = 10,
  isLoggingOut: boolean = false
): Promise<{ 
  data: MappedWorkloadItem[]; 
  total: number;
  lastPage: number;
}> {
  try {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-XSRF-TOKEN': csrfToken,
    };

    const params = new URLSearchParams({
      'search[value]': searchTerm || '',
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (filterValue !== 'all') {
      params.set('filters[deliverable_status]', filterValue);
    }

    const response = await fetch(`/api/employee/workloads?${params.toString()}`, {
      headers,
      credentials: 'include'
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch employee workloads');
    }

    const apiData = responseData.data?.data;
    const meta = responseData.data?.meta;
    
    if (!Array.isArray(apiData)) {
      console.error('Invalid employee workload data format:', responseData);
      throw new Error('Invalid data format received from employee workload API');
    }

    return {
      data: apiData.map(mapApiItem),
      total: meta?.total || 0,
      lastPage: meta?.last_page || 1
    };

  } catch (error) {
    console.error('Error fetching employee workloads:', error);

    if (!isLoggingOut) {
      await Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }

    if (!isLoggingOut && error instanceof Error && (
      error.message === 'No access token found' || error.message.includes('401'))
    ) {
      router.push(paths.login);
    }

    return {
      data: [],
      total: 0,
      lastPage: 1
    };
  }
}

export const updateWorkloadAssignment = async (
  workloadId: string,
  payload: {
    completion_date: string | null;
    deliverable_status: DeliverableStatus;
    link: string;
    user_id: number[];
  }
): Promise<{ success: boolean; message?: string }> => {
  try {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('No access token found');

    const headers = {
      'Accept': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
      'Authorization': `Bearer ${accessToken}`
    };

    const form = new FormData();
    if (payload.completion_date) {
      form.append('completion_date', payload.completion_date);
    }
    form.append('deliverable_status', payload.deliverable_status.toString());
    form.append('link', payload.link || '');
    
    payload.user_id.forEach((id, index) => {
      form.append(`user_id[${index}]`, id.toString());
    });

    const response = await fetch(`/api/workload/${workloadId}/assign`, {
      method: 'POST',
      headers,
      body: form,
      credentials: 'include'
    });

    const responseData = await response.json();

    // return handleApiResponse(response);
    return responseData
  } catch (error) {
    console.error('Error updating workload assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add employee' 
    };
  }
};

export const updateEmployeeWorkloadStatus = async (
  workloadId: string,
  payload: {
    workload_status: DeliverableStatus;
  }
): Promise<void> => {
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token found');
  
  const form = new FormData();
  form.append('workload_status', payload.workload_status.toString());

  const response = await fetch(`/api/employee/workloads/${workloadId}/update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-XSRF-TOKEN': csrfToken
    },
    body: form
  });

  const responseData = await response.json();

  if (!response.ok || responseData.status !== true) {
    throw new Error(responseData.message || 'Failed to update employee workload status');
  }
};

export const validateAssignment = (
  status: DeliverableStatus,
  employees: number[]
): string | null => {
  if (status === 0 && employees.length > 0) {
    return 'Cannot assign employees when status is Unassigned';
  }
  
  if (status !== 0 && employees.length === 0) {
    return 'Please assign at least one employee for this status';
  }
  
  return null;
};

export const showConfirmationDialog = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to update this workload item.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2BB673',
    cancelButtonColor: '#AAAAAA',
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel'
  });
  
  return result.isConfirmed;
};

export const showValidationError = async (message: string): Promise<void> => {
  await Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonColor: '#2BB673',
  });
};