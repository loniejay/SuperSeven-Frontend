import { Dayjs } from 'dayjs';

export interface StatusFilters {
  pending: boolean;
  booked: boolean;
}

export interface AddonProps {
  id: number;
  add_on_name: string;
  add_on_details: string;
  add_on_price: string;
}

export interface BookingEvent {
  id: number;
  billing_id: number;
  start: Date;
  end: Date;
  booking_date: {
    iso: string;
    formatted: string;
    day: number;
    month: number;
    year: number;
    time: string;
  };
  ceremony_time: string;
  event_name: string;
  customer_id: number;
  customer_name: string;
  discount: number;
  booking_address: string;
  booking_status: string;
  deliverable_status: string;
  package: string;
  add_ons: AddonProps[];
  has_feedback?: boolean;
  feedback?: string;
  created_at?: string;
  // total_amount: string;
}

export interface UnavailableDate {
  id: number;
  date: string;
}

export interface CreateBookingData {
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  address: string;
  booking_address: string;
  event_name: string;
  booking_date: string;
  formatted_booking_date: string;
  ceremony_time: string;
  package_id: number;
  addon_id: number[];
}

export interface BaseResponse {
  status: boolean;
  message?: string;
}


export interface BookingFormData {
  bookingDate: Dayjs | null;
  formattedBookingDate: string;
  eventName: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  contactNumber: string;
  bookingAddress: string;
  ceremonyTime: Dayjs;
  categoryType: string;
}

export interface BaseResponse {
  status: boolean;
  message?: string;
}

export interface ClientBookingResponse extends BaseResponse {
  data: BookingData[];
}

export interface AdminBookingResponse extends BaseResponse {
  data: {
    data: BookingData[];
  };
}

export interface BookingData {
  id: number;
  billing_id: number;
  booking_date: string | {
    iso: string;
    formatted?: string;
    day?: number;
    month?: number;
    year?: number;
    time?: string;
  };
  ceremony_time?: string;
  event_name: string;
  customer_id?: number;
  customer_name?: string;
  discount: string | number;
  booking_address: string;
  booking_status: string;
  deliverable_status: string;
  package: string;
  add_ons?: {
    id: number;
    add_on_name: string;
    add_on_details: string;
    add_on_price: string;
  }[];
  has_feedback?: boolean;
  feedback?: string;
  created_at?: string;
}