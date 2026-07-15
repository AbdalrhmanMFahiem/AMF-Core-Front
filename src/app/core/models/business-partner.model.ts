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
}

export interface BusinessPartnerLedgerResponse {
  id: number;
  entryDate: string;
  invoiceId?: number;
  invoiceCode?: string;
  entryType: number;
  amount: number;
  runningBalance: number;
  notes?: string;
  entryTypeName?: string;
  badgeColor?: string;
}

export interface LedgerFilters {
  pageNumber: number;
  pageSize: number;
  from?: string;
  to?: string;
  entryType?: number;
}

export enum LedgerEntryType {
  Invoice = 1,
  Return = 2,
  Payment = 3,
  Adjustment = 4
}

export interface BalanceSummaryResponse {
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
}

