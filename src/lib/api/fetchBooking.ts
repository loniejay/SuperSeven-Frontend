import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BookingEvent, UnavailableDate, BookingFormData, BaseResponse, AdminBookingResponse, ClientBookingResponse, BookingData } from '@/types/booking';
import { PackageProps, AddOnsProps } from '@/types/field';
import { ensureCsrfToken } from '@/utils/crfToken';
import Swal from 'sweetalert2';
import { paths } from '@/paths';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function to normalize dates to Philippine time (Asia/Manila)
export const normalizeToPHDate = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

// Fetch bookings data
export const fetchBookings = async (month: number, year: number): Promise<BookingEvent[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

  // Choose endpoint based on user role
  const endpoint = isClient 
    ? `/api/customer/bookings?month=${month}&year=${year}`
    : `/api/bookings?month=${month}&year=${year}&filters[booked]=true&filters[pending]=true&filters[approved]=true`;

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  const data: BaseResponse = await response.json();
  
  // Handle different response structures with type guards
  let bookingsData: BookingData[] = [];
  
  if (isClient) {
    const clientData = data as ClientBookingResponse;
    if (clientData.status && Array.isArray(clientData.data)) {
      bookingsData = clientData.data;
    }
  } else {
    const adminData = data as AdminBookingResponse;
    if (adminData.status && adminData.data?.data) {
      bookingsData = adminData.data.data;
    }
  }

  return bookingsData.map((booking): BookingEvent => {
    // Normalize date handling
    const dateString = typeof booking.booking_date === 'string' 
      ? booking.booking_date 
      : booking.booking_date?.iso || '';
    
    const startDate = dateString ? new Date(dateString) : new Date();
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59);
    
    // Normalize booking_date object
    const bookingDate = typeof booking.booking_date === 'string'
      ? {
          iso: dateString,
          formatted: new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: startDate.getDate(),
          month: startDate.getMonth() + 1,
          year: startDate.getFullYear(),
          time: booking.ceremony_time || ''
        }
      : {
          iso: booking.booking_date?.iso || dateString,
          formatted: booking.booking_date?.formatted || startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: booking.booking_date?.day || startDate.getDate(),
          month: booking.booking_date?.month || startDate.getMonth() + 1,
          year: booking.booking_date?.year || startDate.getFullYear(),
          time: booking.booking_date?.time || booking.ceremony_time || ''
        };

    return {
      id: booking.id,
      billing_id: booking.billing_id,
      start: startDate,
      end: endDate,
      booking_date: bookingDate,
      ceremony_time: booking.ceremony_time || '',
      event_name: booking.event_name,
      customer_id: booking.customer_id || (user?.id || 0),
      customer_name: booking.customer_name || `${user?.first_name} ${user?.last_name}` || '',
      discount: typeof booking.discount === 'string' 
        ? parseFloat(booking.discount) || 0 
        : booking.discount || 0,
      booking_address: booking.booking_address,
      booking_status: booking.booking_status.toLowerCase(),
      deliverable_status: booking.deliverable_status,
      package: booking.package,
      add_ons: (booking.add_ons || []).map(addon => ({
        id: addon.id,
        add_on_name: addon.add_on_name,
        add_on_details: addon.add_on_details,
        add_on_price: addon.add_on_price
      })),
      ...(booking.has_feedback !== undefined && { has_feedback: booking.has_feedback }),
      ...(booking.feedback && { feedback: booking.feedback }),
      ...(booking.created_at && { created_at: booking.created_at })
    };
  });
  
};

// Fetch unavailable dates
export const fetchUnavailableDateRecords = async (month: number, year: number): Promise<UnavailableDate[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };

  const response = await fetch(`/api/unavailable-dates?month=${month}&year=${year}`, { headers });

  if (!response.ok) throw new Error('Failed to fetch unavailable dates');

  const data = await response.json();
  
  return data.data?.map((d: any) => ({
    ...d,
    date: normalizeToPHDate(new Date(d.date))
  })) || [];
};

// Mark date as unavailable
export const markDateAsUnavailable = async (date: Date): Promise<UnavailableDate> => {
  const phDate = normalizeToPHDate(date);
  const isoString = dayjs(phDate).tz('Asia/Manila').format();

  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch('/api/unavailable-dates/mark', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    },
    body: JSON.stringify({
      date: isoString
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to mark date as unavailable');
  }

  if (!data.status) {
    throw new Error(data.message || 'Date could not be disabled');
  }

  return { 
    ...data.data, 
    date: normalizeToPHDate(new Date(data.data.date)) 
  };
};

// Unmark date as available
export const unmarkDateAsAvailable = async (id: number): Promise<void> => {
  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`/api/unavailable-dates/${id}/unmark`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to unmark date as available');
  }
};

// Booking actions
export const approveBooking = async (id: number): Promise<void> => {

  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`/api/bookings/${id}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to approve booking');
  }
};

export const rejectBooking = async (id: number): Promise<void> => {
  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }
    
  const endpoint = `/api/bookings/${id}/reject`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to reject booking');
  }
};

export const cancelBooking = async (id: number): Promise<void> => {
  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Get user from localStorage to determine role
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

  const endpoint = isClient 
      ? `/api/customer/bookings/${id}/delete`
      : `/api/bookings/${id}/cancel`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }
};

export const rescheduleBooking = async (
  id: number, 
  date: dayjs.Dayjs, 
  time: dayjs.Dayjs
): Promise<void> => {
  
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const phDate = date.format('YYYY-MM-DD');
  const timeString = time.format('HH:mm');
  const dateTimeString = `${phDate}T${timeString}:00`;

  const response = await fetch(`/api/bookings/${id}/reschedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken
    },
    body: JSON.stringify({
      booking_date: dateTimeString,
      ceremony_time: timeString
    })
  });

  if (!response.ok) {
    throw new Error('Failed to reschedule booking');
  }

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || 'Failed to reschedule booking');
  }
};

// Add Booking
export const fetchApprovedBookings = async (): Promise<Date[]> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const response = await fetch('/api/bookings/approved', { headers });
    if (!response.ok) throw new Error('Failed to fetch approved bookings');
    const data = await response.json();

    const approvedBookingDates = data.data.map((booking: any) => {
      const utcDate = new Date(booking.booking_date.iso);
      const phDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000));
      return phDate;
    });
    return approvedBookingDates;
  } catch (err) {
    console.error('Error fetching approved bookings:', err);
    throw err;
  }
};

export const fetchUnavailableDatesForMonth = async (month: number, year: number): Promise<Date[]> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return [];

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const response = await fetch(`/api/unavailable-dates?month=${month}&year=${year}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch unavailable dates');
    const data = await response.json();

    const newUnavailableDates = data.data.map((item: any) => new Date(item.date))
      .filter((date: Date) => !isNaN(date.getTime()));

    return newUnavailableDates;
  } catch (err) {
    console.error(`Error fetching unavailable dates for month ${month}, year ${year}:`, err);
    throw err;
  }
};

export const fetchPackagesAddOnsData = async (): Promise<{packages: PackageProps[]; addOns: AddOnsProps[]; }> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const [packagesResponse, addOnsResponse] = await Promise.all([
      fetch('/api/bookings/packages', { headers }),
      fetch('/api/addons', { headers })
    ]);

    if (!packagesResponse.ok) throw new Error('Failed to fetch packages');
    if (!addOnsResponse.ok) throw new Error('Failed to fetch add-ons');

    const packagesData = await packagesResponse.json();
    const addOnsData = await addOnsResponse.json();

    const transformedPackages = packagesData.data.map((pkg: any) => ({
      id: pkg.id,
      packageName: pkg.package_name,
      package_details: pkg.package_details,
      package_price: pkg.package_price
    }));

    const transformedAddOns = addOnsData.data.data.map((addOn: any) => ({
      id: addOn.id,
      addOnName: addOn.add_on_name,
      addOnDetails: addOn.add_on_details,
      addOnPrice: addOn.add_on_price
    }));

    return {
      packages: transformedPackages,
      addOns: transformedAddOns
    };
  } catch (err) {
    console.error('Error fetching packages and add-ons:', err);
    throw err;
  }
};

export const submitBooking = async (
  formData: BookingFormData,
  selectedPackage: string,
  selectedAddOns: number[],
  packages: PackageProps[]
): Promise<any> => {
  try {
    const csrfToken = await ensureCsrfToken();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) throw new Error('Authentication required');

    // Get user from localStorage to determine role
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    const selectedPkg = packages.find(
      pkg => pkg.id.toString() === selectedPackage
    );
    if (!selectedPkg) throw new Error('Please select a valid package');
    if (!formData.categoryType) throw new Error('Event category is required');

    const form = new FormData();

    if(!isClient) {
      form.append('first_name', formData.firstName);
      form.append('last_name', formData.lastName);
      form.append('email', formData.email);
      form.append('contact_no', formData.contactNumber);
      form.append('address', formData.address);
    }

    form.append('booking_date', formData.bookingDate?.format('YYYY-MM-DD') || '');
    form.append('formatted_booking_date', formData.formattedBookingDate || '');
    form.append('ceremony_time', formData.ceremonyTime.format('HH:mm'));
    form.append('event_name', formData.eventName);
    form.append('category', formData.categoryType);
    form.append('booking_address', formData.bookingAddress);
    form.append('package_id', String(selectedPkg.id));

    selectedAddOns.forEach((addonId, index) => {
      form.append(`addon_id[${index}]`, String(addonId));
    });

    const endpoint = isClient 
      ? '/api/customer/bookings/create'
      : '/api/bookings/add';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-XSRF-TOKEN': csrfToken

      },
      credentials: 'include',
      body: form,
    });

    return handleApiResponse(response);
  } catch (err) {
    console.error('Error submitting booking:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Failed to submit booking' };
  }
};

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

export const fetchInitialBookingData = async (): Promise<{
  approvedDates: Date[];
  packages: PackageProps[];
  addOns: AddOnsProps[];
  initialUnavailableDates: Date[];
}> => {
  try {
    const now = new Date();
    const initialMonth = now.getMonth() + 1;
    const initialYear = now.getFullYear();
    
    // Calculate previous and next months
    let prevMonth = initialMonth - 1;
    let prevYear = initialYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    
    let nextMonth = initialMonth + 1;
    let nextYear = initialYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    const [approvedDates, packagesData, initialUnavailableDates] = await Promise.all([
      fetchApprovedBookings(),
      fetchPackagesAddOnsData(),
      Promise.all([
        fetchUnavailableDatesForMonth(prevMonth, prevYear),
        fetchUnavailableDatesForMonth(initialMonth, initialYear),
        fetchUnavailableDatesForMonth(nextMonth, nextYear)
      ]).then(results => results.flat())
    ]);

    return {
      approvedDates,
      ...packagesData,
      initialUnavailableDates
    };
  } catch (err) {
    console.error('Error fetching initial booking data:', err);
    throw err;
  }
};

// Update Booking
export const fetchBookingPackages = async (): Promise<PackageProps[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('Authentication required');

  const response = await fetch('/api/bookings/packages', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error('Failed to fetch packages');

  const data = await response.json();
  return data.data?.map((pkg: any) => ({
    id: pkg.id,
    packageName: pkg.package_name || 'Unknown Package'
  })) || [];
};

export const fetchAddOns = async (): Promise<AddOnsProps[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('Authentication required');

  const response = await fetch('/api/addons', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error('Failed to fetch add-ons');

  const data = await response.json();
  return data.data?.data?.map((addOn: any) => ({
    id: addOn.id,
    addOnName: addOn.add_on_name || 'Unknown Add-on',
    addOnDetails: addOn.add_on_details || '',
    addOnPrice: addOn.add_on_price || 0
  })) || [];
};

export const fetchBookingDetails = async (bookingId: string) => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('Authentication required');

  // Get user from localStorage to determine role
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

  // For client users, verify they own the booking
  if (isClient) {
    try {
      // Fetch booking details to get the customer ID
      const bookingResponse = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!bookingResponse.ok) {
        throw new Error('Failed to fetch booking data');
      }
      
      const bookingData = await bookingResponse.json();
      const bookingCustomerId = bookingData.data.customer_id;
      
      // Compare booking's customer ID with current user's ID
      if (bookingCustomerId !== user.id) {
        // throw new Error('Forbidden: You do not have permission to access this booking');
        Swal.fire({
          icon: 'error',
          title: 'Forbidden',
          text: 'You do not have permission to access this booking',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = paths.booking;
          }
        });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      throw new Error('Failed to verify booking permissions');
    }
  }

  const endpoint = isClient 
      ? `/api/customer/bookings/${bookingId}`
      : `/api/bookings/${bookingId}`;

  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error('Failed to fetch booking data');

  return await response.json();
};

export const updateBooking = async (
  bookingId: string,
  bookingData: {
    booking_date: string;
    package_id: number;
    event_name: string;
    booking_address: string;
    addon_id: number[];
    ceremony_time: string
  }
) => {
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('Authentication required');

  // Get user from localStorage to determine role
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

  const formData = new FormData();
  formData.append("booking_date", bookingData.booking_date);
  formData.append("package_id", bookingData.package_id.toString());
  formData.append("event_name", bookingData.event_name);
  formData.append("booking_address", bookingData.booking_address);
  formData.append("ceremony_time", bookingData.ceremony_time);
  
  bookingData.addon_id.forEach((id, index) => {
    formData.append(`addon_id[${index}]`, id.toString());
  });

  const endpoint = isClient 
    ? `/api/customer/bookings/${bookingId}/update`
    : `/api/bookings/${bookingId}/update`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-XSRF-TOKEN': csrfToken
    },
    body: formData
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update booking');
  }

  return await response.json();
};