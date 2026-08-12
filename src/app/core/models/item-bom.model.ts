import { RequestFilters } from './pagination.model';

export interface ItemBomFilters extends RequestFilters {
  // Add any specific filters for Item BOMs here
}

export interface ItemBomRequest {
  itemId: number;
  quantity: number;
  warehouseId?: number | null;
  priceListId?: number | null;
  treeType: number;
  notes?: string | null;
  minSpeed: number;
  maxSpeed: number;
  dfltSpeed: number;
  dfltSpeedUomType?: number | null;
  dfltWeight: number;
  lines: ItemBomLineRequest[];
}

export enum BomLineType {
  Item = 'Item',
  Resource = 'Resource'
}

export interface ItemBomLineRequest {
  id: number;
  itemBomId: number;
  lineType: BomLineType | string;
  componentId?: number | null;
  childNum: number;
  visOrder: number;
  quantity: number;
  warehouseId?: number | null;
  itemPriceListId?: number | null;
  uomId?: number | null;
  issueMethod: number; // e.g. 1 for Backflush, 2 for Manual
  addedQuantity: number;
  scrapPercentage: number;
  lineText?: string | null;
  notes?: string | null;
  uomOptions?: { value: any; label: string }[];
}

export interface ItemBomResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  itemId: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  warehouseId?: number | null;
  warehouseName?: string | null;
  priceListId?: number | null;
  priceListName?: string | null;
  treeType: number;
  notes?: string | null;
  minSpeed: number;
  maxSpeed: number;
  dfltSpeed: number;
  dfltSpeedUomType?: number | null;
  dfltWeight: number;
  lines: ItemBomLineResponse[];
}

export interface ItemBomLineResponse {
  id: number;
  itemBomId: number;
  lineType: BomLineType | string;
  componentId?: number | null;
  componentCode?: string | null;
  componentName?: string | null;
  childNum: number;
  visOrder: number;
  quantity: number;
  warehouseId?: number | null;
  itemPriceListId?: number | null;
  uomId?: number | null;
  uomCode?: string | null;
  uomName?: string | null;
  issueMethod: number;
  addedQuantity: number;
  scrapPercentage: number;
  lineText?: string | null;
  notes?: string | null;
}

export interface ItemBomBasicResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  itemName: string;
  quantity: number;
  isActive: boolean;
}

export interface BomComponentLookupResponse {
  id: number;
  code: string;
  name: string;
  unitOfMeasureId?: number;
  unitOfMeasureName?: string;
}
