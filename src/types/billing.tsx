export interface FetchBillingsParams {
  category?: string;
  start_year: number;
  end_year: number;
  page?: number;
  perPage?: number;
};

export interface TransactionProps {
  id: number;
  transaction_date: string;
  amount_paid: string;
  balance: string;
  payment_method: string;
  remarks: string;
}

export interface AddonProps {
  id: number;
  add_on_name: string;
  add_on_details: string;
  add_on_price: string;
}

export interface Billing {
  id: number;
  booking_id: number;
  event_name: string;
  category: string;
  event_date: string;
  customer_name: string;
  package: string;
  add_ons: AddonProps[];
  package_amount: string;
  add_on_amount: string;
  discount: string;
  discounted_amount: string;
  total_amount: string;
  total_amount_paid: string;
  balance: string;
  status: string;
  transactions?: TransactionProps[];
};

export interface BillingDetailsProps {
  billingId: string;
}
