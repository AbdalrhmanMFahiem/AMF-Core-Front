import { RequestFilters } from './pagination.model';
import { DocumentStatus, ApprovalStatus } from './document-status.model';
export { DocumentStatus, ApprovalStatus };

export enum StockTransferStatus {
  Draft = 0,
  Confirmed = 1,
  Cancelled = 2
}

export enum StockAdjustmentType {
  Inventory = 1,
  Adjustment = 2
}

// DocumentStatus replaces DocumentStatus

export enum StockTransactionType {
  SalesOut = 1,
  SalesReturnIn = 2,
  PurchaseIn = 3,
  PurchaseReturnOut = 4,
  TransferOut = 5,
  TransferIn = 6,
  AdjustmentIn = 7,
  AdjustmentOut = 8,
  OpeningBalance = 9
}

export interface StockTransferRequest {
  fromWarehouseId: number;
  toWarehouseId: number;
  transferDate: string;
  lines: StockTransferLineRequest[];
}

export interface StockTransferLineRequest {
  itemId: number;
  quantity: number;
  uomId?: number;
  fromBinLocationId?: number;
  toBinLocationId?: number;
  lineOrder: number;
  _itemCode?: string;
  _itemName?: string;
}

export interface StockTransferResponse {
  id: number;
  code: string;
  status: StockTransferStatus;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toWarehouseId: number;
  toWarehouseName: string;
  transferDate: string;
  lines: StockTransferLineResponse[];
}

export interface StockTransferLineResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  uomId?: number;
  uomName?: string;
  fromBinLocationId?: number;
  fromBinLocationName?: string;
  toBinLocationId?: number;
  toBinLocationName?: string;
  lineOrder: number;
}

export interface StockAdjustmentRequest {
  adjustmentType: StockAdjustmentType;
  warehouseId: number;
  adjustmentDate: string;
  reason?: string;
  lines: StockAdjustmentLineRequest[];
}

export interface StockAdjustmentLineRequest {
  itemId: number;
  binLocationId?: number;
  uomId?: number;
  systemQuantity: number;
  countedQuantity: number;
  lineOrder: number;
  _itemCode?: string;
  _itemName?: string;
  _difference?: number;
}

export interface StockAdjustmentResponse {
  id: number;
  code: string;
  adjustmentType: StockAdjustmentType;
  status: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  warehouseId: number;
  warehouseName: string;
  adjustmentDate: string;
  reason?: string;
  lines: StockAdjustmentLineResponse[];
}

export interface StockAdjustmentLineResponse {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  binLocationId?: number;
  binLocationName?: string;
  uomId?: number;
  uomName?: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  lineOrder: number;
}

export interface StockTransactionResponse {
  id: number;
  transactionType: StockTransactionType;
  itemId: number;
  itemCode: string;
  itemName: string;
  warehouseId: number;
  warehouseName: string;
  binLocationId?: number;
  binLocationName?: string;
  quantity: number;
  uomId?: number;
  uomName?: string;
  runningBalance: number;
  invoiceId?: number;
  invoiceCode?: string;
  stockTransferId?: number;
  stockTransferCode?: string;
  stockAdjustmentId?: number;
  stockAdjustmentCode?: string;
  transactionDate: string;
  referenceCode?: string;
}

export interface StockTransactionFilters extends RequestFilters {
  itemId?: number;
  warehouseId?: number;
  transactionType?: StockTransactionType;
  dateFrom?: string;
  dateTo?: string;
}
