export interface LookupsFilters {
  searchValue?: string;
  pageNumber?: number;
  pageSize?: number;
}

export enum ItemUsageType {
  All = 0,
  Sales = 1,
  Purchases = 2
}

export interface ItemLookupsFilters extends LookupsFilters {
  warehouseId?: number;
  usageType?: ItemUsageType;
  checkWarehouseExistence?: boolean;
}

export interface IdNameResponse {
  id: number;
  name: string;
}

export interface CodeNameResponse {
  code: string;
  name: string;
}

export interface IntIdCodeNameResponse {
  id: number;
  code: string;
  name: string;
}

export interface StringIdCodeNameResponse {
  id: string;
  code: string;
  name: string;
}

export interface IntIdCodeNameGroupedResponse extends IntIdCodeNameResponse {
  groupedItems: IntIdCodeNameResponse[];
}

export interface StringIdCodeNameGroupedResponse extends StringIdCodeNameResponse {
  groupedItems: StringIdCodeNameResponse[];
}

export interface SimpleCrudResponse {
  id: number;
  code: string;
  name: string;
  notes?: string;
  isActive: boolean;
}

export interface ItemLookupResponse {
  id: number;
  code: string;
  name: string;
  stock?: number;
  salesPrice?: number;
}

export interface NextCodeResponse {
  nextCode: string;
}

export interface InvoiceCostElementDropdown {
  id: number;
  code: string;
  name: string;
  type: string;
  operationType: string;
  defaultPercentage?: number;
}
