import { ensureCsrfToken } from "@/utils/crfToken";
import { Package, ApiResponse } from "@/types/package";

export const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    
    try {
        const data = contentType?.includes('application/json')
            ? await response.json()
            : await response.text();
        
        return {
            ok: response.ok,
            data: response.ok ? data : null,
            error: !response.ok ? (typeof data === 'object' ? data : { message: data }) : null
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: { message: 'Failed to parse response' }
        };
    }
};

export const fetchPackages = async (
    searchTerm: string = '', 
    page: number = 1,
    perPage: number = 10,
    isLoggingOut: boolean = false
): Promise<any> => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');
    
    // Get user from localStorage to determine role
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    let url = isClient 
        ? `/api/customer/packages`
        : `/api/packages?search[value]=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        if(!isLoggingOut) {
            throw new Error(`Failed to fetch packages: ${response.status} ${response.statusText}`);
        }
    }
    
    return response.json();
};

export const fetchAddons = async (
    searchTerm: string = '', 
    page: number = 1,
    perPage: number = 10,
    isLoggingOut: boolean = false
): Promise<any> => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');
    
    // Get user from localStorage to determine role
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    let url = isClient 
        ? `/api/customer/addons`
        : `/api/addons?search[value]=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        if(!isLoggingOut) {
            throw new Error(`Failed to fetch add-ons: ${response.status} ${response.statusText}`);
        }
    }
    
    return response.json();
};

export const createPackage = async (data: { 
    name: string; 
    price: string; 
    details: string;
    image?: File | null;
}) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const formData = new FormData();
    formData.append('package_name', data.name);
    formData.append('package_price', data.price);
    formData.append('package_details', data.details);
    if (data.image) formData.append('image', data.image);

    const response = await fetch('/api/packages/add', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken,
        },
        body: formData,
    });

    const { ok, data: responseData, error } = await handleApiResponse(response);
    
    if (!ok) {
        let errorMessage = error?.message || 'Failed to create package';
        
        if (errorMessage.includes('Invalid image')) {
            errorMessage = 'Only JPEG, PNG, GIF, or WebP images are allowed.';
        }
        
        throw new Error(errorMessage);
    }

    return responseData;
};

export const updatePackage = async (id: number, data: { 
    name: string; 
    price: string; 
    details: string;
    image?: File | null;
    removeImage?: boolean;
}) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const formData = new FormData();
    formData.append('package_name', data.name);
    formData.append('package_price', data.price);
    formData.append('package_details', data.details);
    
    if (data.image) formData.append('image', data.image);
    if (data.removeImage) formData.append('remove_image', '1');

    const response = await fetch(`/api/packages/${id}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken,
        },
        body: formData,
    });

    const { ok, data: responseData, error } = await handleApiResponse(response);
    
    if (!ok) {
        let errorMessage = error?.message || 'Failed to create package';
        
        if (errorMessage.includes('Invalid image')) {
            errorMessage = 'Only JPEG, PNG, GIF, or WebP images are allowed.';
        }
        
        throw new Error(errorMessage);
    }

    return responseData;
};

export const createAddon = async (data: { name: string; price: string; details: string }) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const response = await fetch('/api/addons/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            add_on_name: data.name,
            add_on_price: data.price,
            add_on_details: data.details
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create add-on');
    }

    return response.json();
};

export const updateAddon = async (id: number, data: { name: string; price: string; details: string }) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const formData = new FormData();
    formData.append("add_on_name", data.name);
    formData.append("add_on_price", data.price);
    formData.append("add_on_details", data.details);

    const response = await fetch(`/api/addons/${id}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update add-on');
    }

    return response.json();
};

// Delete functions
export const deletePackage = async (id: number) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const response = await fetch(`/api/packages/${id}/inactive`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
    }

    return response.json();
};

export const deleteAddon = async (id: number) => {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const response = await fetch(`/api/addons/${id}/inactive`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-XSRF-TOKEN': csrfToken
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete add-on');
    }

    return response.json();
};

export async function fetchDashboardPackages(isLoggingOut: boolean): Promise<Package[]> {

    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) throw new Error('Authentication required');

        const headers = new Headers({
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        });

        const url = '/api/dashboard/packages'
        const response = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        const data: ApiResponse = await response.json();
        
        if (!response.ok || !data.status) {
            if(!isLoggingOut) {
                throw new Error(`Failed to fetch add-ons: ${response.status} ${response.statusText}`);
            }
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching packages:', error);
        throw error;
    }
};