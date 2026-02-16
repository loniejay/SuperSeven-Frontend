export interface FetchReportParams {
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
    page?: number;
    perPage?: number;
}

export interface ReportData {
    id: number;
    booking_date: string;
    event_name: string;
    customer_name: string;
    package: string;
    category: string;
    total_amount: string;
}

export interface ReportResponse {
    data: ReportData[];
    links: {
        previous: string;
        next: string;
    };
    meta: {
        current_page: number;
        per_page: number;
        last_page: number;
        count: number;
        total: number;
    };
}

export interface BillingData {
    id: number;
    booking_date: string;
    event_name: string;
    billing_status: string;
    total_amount: string;
    balance_due: string;
}

export interface BillingResponse {
    data: BillingData[];
    links: {
        previous: string;
        next: string;
    };
    meta: {
        current_page: number;
        per_page: number;
        last_page: number;
        has_pages: boolean;
        has_more_pages: boolean;
        count: number;
        total: number;
    };
}