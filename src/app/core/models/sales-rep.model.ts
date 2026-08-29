export interface SalesRepResponse {
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  assignedCustomersCount: number;
  assignedWarehousesCount: number;
}

export interface SalesRepCustomerResponse {
  id: number;
  code: string;
  name: string;
  phone?: string;
  isPrimary: boolean;
  assignmentDate: string;
}

export interface SalesRepWarehouseResponse {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

export interface QuickSaleUomOption {
  id: number;
  code: string;
  name: string;
  conversionFactor: number;
  isBaseUnit: boolean;
}

export interface QuickSaleItemResponse {
  id: number;
  code: string;
  aName?: string;
  eName?: string;
  barcode?: string;
  price: number;
  basePrice?: number;
  availableQuantity: number;
  salesUomId?: number;
  salesUomName?: string;
  salesUomConversionFactor?: number;
  inventoryUomId?: number;
  inventoryUomName?: string;
  itemGroupName?: string;
  isActive: boolean;
  availableUoms?: QuickSaleUomOption[];
}
