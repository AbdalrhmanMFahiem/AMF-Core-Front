export interface BusinessPartnerResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string;
  isCustomer: boolean;
  isVendor: boolean;
  phone?: string;
  email?: string;
  address?: string;
  countryId?: number | null;
  countryName?: string | null;
  governorateId?: number | null;
  governorateName?: string | null;
  cityId?: number | null;
  cityName?: string | null;
  districtId?: number | null;
  districtName?: string | null;
  name?: string;
  bpType?: string;
}

export interface BusinessPartnerBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  bpType?: string;
}

export interface BusinessPartnerRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  isActive: boolean;
  isCustomer: boolean;
  isVendor: boolean;
  phone?: string;
  email?: string;
  address?: string;
  countryId?: number | null;
  governorateId?: number | null;
  cityId?: number | null;
  districtId?: number | null;
  openingBalance?: number | null;
  openingBalanceDate?: Date | string | null;
}

export interface QuickCustomerRequest {
  code?: string;
  aName: string;
  eName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  country?: string;
  notes?: string;
}

export interface QuickVendorRequest {
  code?: string;
  aName: string;
  eName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  country?: string;
  notes?: string;
}

export interface BusinessPartnerLedgerResponse {
  id: number;
  entryDate: string;
  invoiceId?: number | null;
  invoiceCode?: string | null;
  paymentId?: number | null;
  sourceId?: number | null;
  sourceCode?: string | null;
  entryType: LedgerEntryType | number;
  amount: number;
  debit: number;
  credit: number;
  balanceBefore: number;
  runningBalance: number;
  notes?: string | null;
  entryTypeName?: string;
  badgeColor?: string;
}

export interface LedgerFilters {
  pageNumber: number;
  pageSize: number;
  from?: string;
  to?: string;
  entryType?: string | number;
}

export enum LedgerEntryType {
  Invoice = 1,
  Return = 2,
  Payment = 3,
  Adjustment = 4,
  OpeningBalance = 5,
  PartnerPayment = 6,
  Receipt = 7,
  ManualJournal = 8
}

export interface BalanceSummaryResponse {
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
}

export interface AddOpeningBalanceRequest {
  amount: number;
  date: Date | string;
}

export interface PartnerOpenInvoiceDto {
  invoiceId: number;
  invoiceCode: string;
  invoiceType: number;
  invoiceTypeName: string;
  invoiceDate: string;
  dueDate?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: number;
  paidStatus: number;
}

export interface PartnerSalesSummaryDto {
  salesRunningBalance: number;
  openInvoicesCount: number;
  openInvoicesTotal: number;
  totalOverdue: number;
  openInvoices: PartnerOpenInvoiceDto[];
}

export interface PartnerPurchaseSummaryDto {
  purchaseRunningBalance: number;
  openInvoicesCount: number;
  openInvoicesTotal: number;
  totalOverdue: number;
  openInvoices: PartnerOpenInvoiceDto[];
}

export interface PartnerOverallSummaryDto {
  totalOpenInvoicesCount: number;
  totalOpenInvoicesAmount: number;
  totalOverdueAmount: number;
}

export interface BusinessPartnerQuickViewResponse {
  id: number;
  code: string;
  name: string;
  aName: string;
  eName?: string | null;
  isCustomer: boolean;
  isVendor: boolean;
  partnerType: 'Customer' | 'Vendor' | 'Both';
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  netRunningBalance: number;
  salesSummary?: PartnerSalesSummaryDto | null;
  purchaseSummary?: PartnerPurchaseSummaryDto | null;
  overallSummary: PartnerOverallSummaryDto;
}

