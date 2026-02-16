export interface FormField {
    id: string;
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    readOnly?: boolean;
    pattern?: string;
    startAdornment?: string;
    maxChar?: number;
}

export interface FormSection {
    id: string;
    columnCount: number;
    fields: FormField[];
    forgotButton?: ForgotButtonProps;
}

export interface ForgotButtonProps {
    linkUrl: string;
    linkLabel: string;
}

export interface CheckboxField {
    id: string;
    name: string;
    label: string;
    required: boolean;
}

export interface ModalSection {
    title: string;
    description?: string;
    formSections: FormSection[];
    submitButtonText: string;
    checkFields?: CheckboxField[];
}

export interface CategoryProps {
    id: string;
    category_name: string;
}

export interface PackageProps {
    id: number;
    packageName: string;
    package_details: string;
    package_price: string;
}

export interface AddOnsProps {
    id: number;
    addOnName: string;
    addOnDetails: string;
    addOnPrice: string;
}