export type PaymentDirection = 'Incoming' | 'Outgoing';
export type PaymentVerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface BusinessPartnerPaymentRequest {
  id: number;
  code: string;
  notes?: string | null;
  direction: PaymentDirection;
  businessPartnerId: number;
  paymentDate: string;
  totalAmount: number;
  baseAmount?: number;
  totalAmountWithCommission?: number;
  defaultCommissionPercent?: number | null;
  defaultFixedCommission?: number | null;
  appliedCommissionPercent?: number | null;
  appliedFixedCommission?: number | null;
  paymentReason?: string | null;
  method: number;
  bankId?: number | null;
  bankBranchId?: number | null;
  chequeNumber?: string | null;
  chequeDueDate?: string | null;
  eWalletProviderId?: number | null;
  eWalletReferenceNumber?: string | null;
  reference?: string | null;
  initialAllocations?: AllocationRequest[];
}

export interface BusinessPartnerPaymentResponse {
  id: number;
  code: string;
  direction: PaymentDirection;
  businessPartnerId: number;
  businessPartnerName: string;
  paymentDate: string;
  totalAmount: number;
  baseAmount: number;
  totalAmountWithCommission: number;
  defaultCommissionPercent?: number | null;
  defaultFixedCommission?: number | null;
  appliedCommissionPercent?: number | null;
  appliedFixedCommission?: number | null;
  paymentReason?: string | null;
  allocatedAmount: number;
  unallocatedAmount: number;
  method: number;
  bankId?: number | null;
  bankName?: string | null;
  bankBranchId?: number | null;
  bankBranchName?: string | null;
  chequeNumber?: string | null;
  chequeDueDate?: string | null;
  eWalletProviderId?: number | null;
  eWalletProviderName?: string | null;
  eWalletReferenceNumber?: string | null;
  eWalletCommissionAmount?: number | null;
  receiptAttachmentPath?: string | null;
  verificationStatus: PaymentVerificationStatus;
  status: number;
  reference?: string | null;
  notes?: string | null;
  allocations: PaymentAllocationResponse[];
}

export interface BusinessPartnerPaymentBasicResponse {
  id: number;
  code: string;
  direction: PaymentDirection;
  businessPartnerName: string;
  paymentDate: string;
  totalAmount: number;
  allocatedAmount: number;
  method: number;
  status: number;
  verificationStatus: PaymentVerificationStatus;
}

export interface PaymentAllocationResponse {
  id: number;
  invoiceId: number;
  invoiceCode: string;
  allocatedAmount: number;
}

export interface AllocationRequest {
  invoiceId: number;
  amount: number;
}

export interface SuggestedAllocationDto {
  invoiceId: number;
  invoiceCode: string;
  invoiceRemaining: number;
  suggestedAmount: number;
}

export interface PaymentFilters {
  pageNumber: number;
  pageSize: number;
  searchValue?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
  businessPartnerId?: number | null;
  direction?: PaymentDirection | null;
  status?: number | null;
  method?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface VerifyPaymentRequest {
  approve: boolean;
  rejectionReason?: string | null;
}

export interface BalanceSummaryResponse {
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
}

export interface PartnerAccountSummary {
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
  openInvoicesCount: number;
  openInvoicesTotal: number;
}
