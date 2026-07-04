import { RequestFilters } from './pagination.model';

export interface WarehouseRequest {
  id?: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  maxVolumeCapacity?: number;
  maxWeightCapacity?: number;
  maxPalletsCount?: number;
}

export interface WarehouseBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  notes?: string;
  maxVolumeCapacity?: number;
  maxWeightCapacity?: number;
  maxPalletsCount?: number;
}

export interface WarehouseResponse {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
  notes?: string;
  maxVolumeCapacity?: number;
  maxWeightCapacity?: number;
  maxPalletsCount?: number;
}
