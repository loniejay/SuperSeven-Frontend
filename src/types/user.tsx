export type UserRole = 'Owner' | 'Secretary' | 'Editor' | 'Photographer' | 'Client' | 'Coordinator';

export interface AuthResponse {
  status: boolean;
  message: string;
  data: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  remember?: boolean;
  user?: User;
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  mid_name?: string;
  full_name: string;
  email: string;
  contact_no: string;
  address: string;
  user_type?: string;
  user_role?: string;
  status: 'active' | 'disabled' | string;
  email_verified_at?: string;
}

export interface FormDataProps {
  firstName: string; 
  middleName: string; 
  lastName: string; 
  email: string; 
  contactNumber?: string; 
  address: string; 
  userType: string; 
  status: string ;
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    data: User[];
    links: {
      previous: string;
      next: string;
    };
    meta: {
      current_page: number;
      per_page: number;
      last_page: number;
      total: number;
    };
  };
}

export interface AuthPayload {
  email: string;
  password: string;
  remember?: boolean;
  first_name?: string;
  last_name?: string;
  confirm_password?: string;
  contact_no?: string;
  customer_type?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  contact_no: string;
  customer_type: number;
}

export interface UserProfileFormData {
  first_name: string;
  mid_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  address: string;
}

