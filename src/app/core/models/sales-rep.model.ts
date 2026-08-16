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
