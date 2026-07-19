export interface ItemResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string;
  itemGroupId?: number;
  itemGroupName?: string;
  dfltWarehouseId?: number;
  warehouseName?: string;
  dfltWeight: number;
  itemPropertyId?: number;
  itemPropertyName?: string;
  unitsOfMeasure?: ItemUnitOfMeasureResponse[];
}

export interface ItemBasicResponse {
  id: number;
  code: string;
  name: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string;

  // Group & Property
  itemGroupId?: number;
  itemGroupName?: string;
  itemPropertyId?: number;
  itemPropertyName?: string;

  // Warehouse
  dfltWarehouseId?: number;
  warehouseName?: string;
  dfltWeight: number;

  // Purchasing
  isPurchased: boolean;
  purchaseUomId?: number;
  purchaseUomName?: string;
  lastPurchasePrice: number;
  preferredVendorId?: number;
  preferredVendorName?: string;

  // Sales
  isSold: boolean;
  salesUomId?: number;
  salesUomName?: string;
  salesPrice: number;

  // Inventory
  isInventoryItem: boolean;
  inventoryUomId?: number;
  inventoryUomName?: string;
  minStockLevel: number;
  maxStockLevel: number;

  // Tax & Reference
  dfltTaxPercent: number;
  barcode?: string;
  foreignCode?: string;
  unitsOfMeasure?: any[];
}

export interface ItemRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  itemGroupId?: number;
  dfltWarehouseId?: number;
  dfltWeight: number;
  itemPropertyId?: number;
  isActive: boolean;

  // Purchasing
  isPurchased: boolean;
  purchaseUomId?: number;
  preferredVendorId?: number;

  // Sales
  isSold: boolean;
  salesUomId?: number;
  salesPrice: number;

  // Inventory
  isInventoryItem: boolean;
  inventoryUomId?: number;
  minStockLevel: number;
  maxStockLevel: number;

  // Tax & Reference
  dfltTaxPercent: number;
  barcode?: string;
  foreignCode?: string;
  unitsOfMeasure?: any[];
}

export interface NextCodeResponse {
  code: string;
}

export interface ItemUnitOfMeasureRequest {
  id: number;
  unitOfMeasureId: number;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
  barcode?: string;
}

export interface ItemUnitOfMeasureResponse {
  id: number;
  unitOfMeasureId: number;
  unitOfMeasureName: string;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
  barcode?: string;
}
