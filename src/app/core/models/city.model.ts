export interface CityBasicResponse {
  id: number;
  governorateId: number;
  governorateName: string;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

export interface CityResponse {
  id: number;
  governorateId: number;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

export interface CityRequest {
  id: number;
  governorateId: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  isActive?: boolean;
}

import { RequestFilters } from './pagination.model';

export interface CityFilters extends RequestFilters {
  governorateId?: number | null;
}
