import { RequestFilters } from './pagination.model';

export enum UomType {
  Length = 'Length',
  Area = 'Area',
  Volume = 'Volume',
  Weight = 'Weight',
  Time = 'Time',
  Timing = 'Timing',
  Quantity = 'Quantity',
  Other = 'Other'
}

export interface UnitOfMeasure {
  id: number;
  code: string;
  aName: string;
  eName: string;
  uomType: UomType;
  isBaseUnit: boolean;
  conversionFactor: number;
  notes: string;
  isActive: boolean;
  tenantId: number;
  createdById?: number;
  createdOn?: string;
  updatedById?: number;
  updatedOn?: string;
}

export interface UnitOfMeasureRequest {
  code: string;
  aName: string;
  eName: string;
  uomType: UomType;
  isBaseUnit: boolean;
  conversionFactor: number;
  notes: string;
  isActive: boolean;
}


export interface UnitOfMeasureFilters extends RequestFilters {
  type?: UomType | string;
}