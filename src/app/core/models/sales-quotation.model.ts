import { InvoiceCostLineRequest, InvoiceCostLineResponse } from './invoice.model';
import { RequestFilters } from './pagination.model';
import { DocumentStatus, ApprovalStatus } from './document-status.model';
export { DocumentStatus, ApprovalStatus };

export interface SalesQuotationBasicResponse {
  id: number;
  code: string;
  documentNumber: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  businessPartnerName: string;
  documentDate: string;
  dueDate: string;
  totalAmount: number;
  remarks?: string;
}

export interface SalesQuotationLineResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  lineNumber: number;
  description: string;
  quantity: number;
  openQuantity: number;
  unitOfMeasureId?: number;
  unitOfMeasureName?: string;
  uomName?: string;
  uomConversionFactor: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotalBeforeDiscount: number;
  lineTotalBeforeTax: number;
  lineTotal: number;
  lineDueDate?: string;
  lineStatus: DocumentStatus;
  notes?: string;
  baseUomType?: string;
}

export interface OpenSalesQuotationLineResponse {
  salesQuotationLineId: number;
  salesQuotationId: number;
  salesQuotationCode: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  openQuantity: number;
  importQuantity?: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  warehouseId: number;
  warehouseName: string;
  unitOfMeasureId?: number;
  unitOfMeasureName?: string;
  baseQuantity: number;
  baseUnitPrice: number;
  notes?: string;
  [key: string]: any;
}

export interface SalesQuotationResponse {
  id: number;
  code: string;
  notes?: string;
  documentNumber: string;
  businessPartnerId: number;
  businessPartnerName: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  branchId?: number;
  branchName?: string;
  warehouseId?: number;
  warehouseName?: string;
  postingDate: string;
  documentDate: string;
  dueDate: string;
  requiredDate?: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvedOn?: string;
  currencyId?: number;
  currencyName?: string;
  exchangeRate: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  totalBeforeDiscount: number;
  totalBeforeTax: number;
  totalAmount: number;
  paymentTerms?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  freightAmount: number;
  shipToAddress?: string;
  incoterms?: string;
  referenceNumber: string;
  remarks?: string;
  buyerId?: string;
  buyerName?: string;
  internalNotes?: string;
  printedNotes?: string;
  lines: SalesQuotationLineResponse[];
  costLines?: InvoiceCostLineResponse[];
}

export interface SalesQuotationLineRequest {
  itemId: number;
  warehouseId: number;
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasureId?: number;
  uomConversionFactor: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotalBeforeDiscount: number;
  lineTotalBeforeTax: number;
  lineTotal: number;
  lineDueDate?: string;
  lineStatus: DocumentStatus;
  notes?: string;
  // UI properties
  _itemName?: string;
  _itemCode?: string;
  _baseUomType?: string;
  _discountFixedMode?: 'percentage' | 'amount';
  _taxFixedMode?: 'percentage' | 'amount';
  [key: string]: any;
}

export interface SalesQuotationRequest {
  id: number;
  code: string;
  notes?: string;
  documentNumber: string;
  businessPartnerId: number;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  branchId?: number;
  warehouseId?: number;
  postingDate: string;
  documentDate: string;
  dueDate: string;
  requiredDate?: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  currencyId?: number;
  exchangeRate: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  totalBeforeDiscount: number;
  totalBeforeTax: number;
  totalAmount: number;
  paymentTerms?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  freightAmount: number;
  shipToAddress?: string;
  incoterms?: string;
  referenceNumber: string;
  buyerId?: string;
  internalNotes?: string;
  printedNotes?: string;
  lines: SalesQuotationLineRequest[];
  costLines?: InvoiceCostLineRequest[];
}

export interface SalesQuotationFilters extends RequestFilters {
  status?: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  businessPartnerId?: number;
  documentDateFrom?: string;
  documentDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
