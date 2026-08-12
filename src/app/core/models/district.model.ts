export interface DistrictBasicResponse {
  id: number;
  cityId: number;
  cityName: string;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

export interface DistrictResponse {
  id: number;
  cityId: number;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

import { RequestFilters } from './pagination.model';

export interface DistrictFilters extends RequestFilters {
  cityId?: number | null;
}

export interface DistrictRequest {
  id: number;
  cityId: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  isActive?: boolean;
}
