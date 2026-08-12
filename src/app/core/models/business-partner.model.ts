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
  invoiceId?: number;
  invoiceCode?: string;
  entryType: string | number;
  amount: number;
  debit: number;
  credit: number;
  balanceBefore: number;
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
  entryType?: string | number;
}

export enum LedgerEntryType {
  Invoice = 1,
  Return = 2,
  Payment = 3,
  Adjustment = 4,
  OpeningBalance = 5
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

