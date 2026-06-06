export interface StatementFilter {
  businessPartnerId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface StatementTransaction {
  date: string;
  transactionType: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  description?: string;
}

export interface BusinessPartnerStatementResponse {
  partnerId: number;
  partnerName: string;
  openingBalance: number;
  closingBalance: number;
  transactions: StatementTransaction[];
}
