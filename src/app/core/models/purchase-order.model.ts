import { RequestFilters } from './pagination.model';
import { DocumentStatus, ApprovalStatus } from './document-status.model';
export { DocumentStatus, ApprovalStatus };

export interface PurchaseOrderBasicResponse {
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

export interface PurchaseOrderLineResponse {
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
  receivedQuantity: number;
  returnedQuantity: number;
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
  lineStatus: DocumentStatus;
  mrpRecommendationId?: number;
  vendorItemCode?: string;
  notes?: string;
}

export interface PurchaseOrderResponse {
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
  vendorReferenceNumber?: string;
  referenceNumber: string;
  salesQuotationId?: number;
  mrpRunId?: number;
  mrpRecommendationId?: number;
  buyerId?: string;
  buyerName?: string;
  internalNotes?: string;
  printedNotes?: string;
  lines: PurchaseOrderLineResponse[];
}

export interface PurchaseOrderLineRequest {
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
  mrpRecommendationId?: number;
  vendorItemCode?: string;
  notes?: string;
  // UI properties
  _itemName?: string;
  _itemCode?: string;
  _discountFixedMode?: 'percentage' | 'amount';
  _taxFixedMode?: 'percentage' | 'amount';
  [key: string]: any;
}

export interface PurchaseOrderRequest {
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
  vendorReferenceNumber?: string;
  referenceNumber: string;
  salesQuotationId?: number;
  mrpRunId?: number;
  mrpRecommendationId?: number;
  buyerId?: string;
  internalNotes?: string;
  printedNotes?: string;
  lines: PurchaseOrderLineRequest[];
}

export interface PurchaseOrderFilters extends RequestFilters {
  status?: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  businessPartnerId?: number;
  documentDateFrom?: string;
  documentDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
