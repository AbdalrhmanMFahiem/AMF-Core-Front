import { RequestFilters } from './pagination.model';

export interface LocationRequest {
  id?: number;
  code: string;
  aName: string;
  eName?: string;
  parentLocationId?: number;
  notes?: string;
}

export interface LocationBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  notes?: string;
}

export interface LocationResponse {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  parentLocationId?: number;
  isActive: boolean;
  notes?: string;
}
