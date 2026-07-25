import { RequestFilters } from './pagination.model';
import { DocumentStatus, ApprovalStatus } from './document-status.model';
export { DocumentStatus, ApprovalStatus };

export interface SalesOrderBasicResponse {
  id: number;
  code: string;
  documentNumber: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  businessPartnerName: string;
  documentDate: string;
  dueDate: string;
  totalAmount: number;
}

export interface SalesOrderLineResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  lineNumber: number;
  description: string;
  status: DocumentStatus;
  quantity: number;
  openQuantity: number;
  closedQuantity: number;
  remainingQuantity: number;
  unitOfMeasureId?: number;
  unitOfMeasureName?: string;
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
  notes?: string;
  baseUomType?: string;
  
  baseDocumentId?: string;
  baseDocumentStatus?: string;
  baseDocumentMessage?: string;
  baseLineId?: string;
  baseLineStatus?: string;
  baseDocumentTypeId?: number;
  targetDocumentId?: string;
  targetDocumentStatus?: string;
  targetDocumentMessage?: string;
  targetDocumentTypeId?: number;
}

export interface SalesOrderResponse {
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
  buyerId?: string;
  buyerName?: string;
  internalNotes?: string;
  printedNotes?: string;
  lines: SalesOrderLineResponse[];
}

export interface SalesOrderLineRequest {
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
  status: DocumentStatus;
  notes?: string;
  
  baseDocumentId?: string;
  baseLineId?: string;
  baseDocumentTypeId?: number;
  
  // UI properties
  _itemName?: string;
  _itemCode?: string;
  _baseUomType?: string;
  _discountFixedMode?: 'percentage' | 'amount';
  _taxFixedMode?: 'percentage' | 'amount';
  [key: string]: any;
}

export interface SalesOrderRequest {
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
  lines: SalesOrderLineRequest[];
}

export interface SalesOrderFilters extends RequestFilters {
  status?: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  businessPartnerId?: number;
  documentDateFrom?: string;
  documentDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
