export enum InvoiceCostElementType {
  Sales = 'Sales',
  Purchases = 'Purchases',
  Both = 'Both'
}

export enum InvoiceCostOperation {
  Addition = 'Addition',
  Discount = 'Discount'
}

export interface InvoiceCostElementResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  type: InvoiceCostElementType;
  operationType: InvoiceCostOperation;
  defaultPercentage?: number;
  notes?: string;
  isActive: boolean;
  name?: string;
}

export interface InvoiceCostElementBasicResponse {
  id: number;
  code: string;
  name: string;
  type: InvoiceCostElementType;
  operationType: InvoiceCostOperation;
  defaultPercentage?: number;
  isActive: boolean;
}

export interface InvoiceCostElementRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  type: InvoiceCostElementType;
  operationType: InvoiceCostOperation;
  defaultPercentage?: number;
  notes?: string;
  isActive: boolean;
}

export interface InvoiceCostElementDropdownResponse {
  id: number;
  code: string;
  name: string;
  type: InvoiceCostElementType;
  operationType: InvoiceCostOperation;
  defaultPercentage?: number;
}
