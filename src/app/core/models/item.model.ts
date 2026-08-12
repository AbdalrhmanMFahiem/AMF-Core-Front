import { UomType, UomTypeMeta, UOM_TYPE_CONFIG_MAP, UOM_TYPE_CONFIG_LIST, getUomTypeConfig, UnitOfMeasureBasicResponse } from './uom.model';
import { RequestFilters } from './pagination.model';

export type { UomTypeMeta, UnitOfMeasureBasicResponse };
export { UomType, UOM_TYPE_CONFIG_MAP, UOM_TYPE_CONFIG_LIST, getUomTypeConfig };

export interface ItemFilters extends RequestFilters {
  itemGroupId?: number;
  itemPropertyId?: number;
  warehouseId?: number;
  baseUomType?: string;
  checkWarehouseExistence?: boolean;
  usageType?: 'Sales' | 'Purchases' | 'Inventory';
}

export interface ItemUnitOfMeasureRequest {
  id?: number;
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
  unitOfMeasureCode: string;
  unitOfMeasureName: string;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
  barcode?: string;
}

export interface ItemPurchasingDetailsResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  purchasePrice?: number;
  defaultWarehouseId?: number;
  purchaseUomId?: number;
  baseUomType?: UomType;
  availableUoms: { id: number; code: string; name: string }[];
}

export interface ItemSalesDetailsResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  salesPrice?: number;
  defaultWarehouseId?: number;
  salesUomId?: number;
  baseUomType?: UomType;
  availableUoms: { id: number; code: string; name: string }[];
}

export interface ItemRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  baseUomType?: UomType;
  itemGroupId?: number;
  itemPropertyId?: number;
  dfltWarehouseId?: number;
  dfltWeight: number;
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

  unitsOfMeasure: ItemUnitOfMeasureRequest[];
}

export interface ItemResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string;
  baseUomType?: UomType;
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
  baseUomType?: UomType;

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
  unitsOfMeasure?: ItemUnitOfMeasureResponse[];
}

export interface UomLineDraft {
  id?: number;
  unitOfMeasureId?: number;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
  barcode?: string;
}

export interface ItemWarehouseStockResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  totalOnHandQty: number;
  lines: ItemWarehouseStockLine[];
}

export interface ItemWarehouseStockLine {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  onHandQty: number;
  lastModifiedOn?: string | null;
  lastSyncDate?: string | null;
}
