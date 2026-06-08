import { RequestFilters } from './pagination.model';

export enum InvoiceType {
  Sales = 'Sales',
  Purchase = 'Purchase',
  SalesReturn = 'SalesReturn',
  PurchaseReturn = 'PurchaseReturn',
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Confirmed = 'Confirmed',
  PartiallyPaid = 'PartiallyPaid',
  FullyPaid = 'FullyPaid',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  Cheque = 'Cheque',
  CreditCard = 'CreditCard'
}

export enum InvoiceCostOperation {
  Addition = 'Addition',
  Discount = 'Discount'
}

export interface InvoiceBasicResponse {
  id: number;
  code: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  businessPartnerName: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  remainingAmount: number;
}

export interface InvoiceLineResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  uomId?: number;
  uomName?: string;
  warehouseId?: number;
  warehouseName?: string;
  binLocationId?: number;
  binLocationName?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  netAmount: number;
  lineOrder: number;
  notes?: string;
}

export interface InvoiceCostLineResponse {
  id: number;
  invoiceCostElementId: number;
  invoiceCostElementName: string;
  invoiceCostOperation: InvoiceCostOperation;
  amount: number;
  percentage: number;
  notes?: string;
}

export interface InvoicePaymentResponse {
  id: number;
  method: PaymentMethod;
  bankId?: number;
  bankName?: string;
  bankBranchId?: number;
  bankBranchName?: string;
  amount: number;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface InvoiceResponse {
  id: number;
  code: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  businessPartnerId: number;
  businessPartnerName: string;
  currencyId?: number;
  currencyName?: string;
  branchId?: number;
  branchName?: string;
  warehouseId?: number;
  warehouseName?: string;
  invoiceDate: string;
  dueDate?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  originalInvoiceId?: number;
  originalInvoiceCode?: string;
  lines: InvoiceLineResponse[];
  costLines: InvoiceCostLineResponse[];
  payments: InvoicePaymentResponse[];
}

export interface InvoiceLineRequest {
  itemId: number;
  uomId?: number;
  warehouseId?: number;
  binLocationId?: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  lineOrder: number;
  notes?: string;
  // UI properties
  _itemName?: string;
  _itemCode?: string;
  _netAmount?: number;
  _discountAmount?: number;
  _taxAmount?: number;
  _discountFixedMode?: 'percentage' | 'amount';
  _taxFixedMode?: 'percentage' | 'amount';
  [key: string]: any;
}

export interface InvoiceCostLineRequest {
  invoiceCostElementId: number;
  amount: number;
  percentage: number;
  notes?: string;
  // UI properties
  _name?: string;
  _operationType?: string;
  _fixedMode?: 'percentage' | 'amount';
  [key: string]: any;
}

export interface InvoiceRequest {
  code: string;
  invoiceType: InvoiceType;
  businessPartnerId: number;
  currencyId?: number;
  branchId?: number;
  warehouseId?: number;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  lines: InvoiceLineRequest[];
  costLines: InvoiceCostLineRequest[];
}

export interface InvoiceReturnRequest extends InvoiceRequest {
  originalInvoiceId?: number;
}

export interface InvoicePaymentRequest {
  method: PaymentMethod;
  bankId?: number;
  bankBranchId?: number;
  amount: number;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface InvoiceFilters extends RequestFilters {
  status?: InvoiceStatus;
  businessPartnerId?: number;
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface InvoiceStatsResponse {
  totalInvoices: number;
  totalRevenue: number;
  outstanding: number;
  fullyPaidCount: number;
}
