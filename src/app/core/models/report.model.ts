import { RequestFilters } from './pagination.model';

export interface LedgerFilters extends RequestFilters {
  from?: string;
  to?: string;
  entryType?: number;
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
}

export interface BalanceSummaryResponse {
  currentBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
}
