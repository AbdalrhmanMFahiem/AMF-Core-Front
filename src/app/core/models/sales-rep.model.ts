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

export interface QuickSaleItemResponse {
  id: number;
  code: string;
  aName?: string;
  eName?: string;
  barcode?: string;
  price: number;
  availableQuantity: number;
  salesUomId?: number;
  salesUomName?: string;
  inventoryUomId?: number;
  inventoryUomName?: string;
  itemGroupName?: string;
  isActive: boolean;
}

