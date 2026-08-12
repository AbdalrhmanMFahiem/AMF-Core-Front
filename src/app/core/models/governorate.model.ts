export interface GovernorateBasicResponse {
  id: number;
  countryId: number;
  countryName: string;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

export interface GovernorateResponse {
  id: number;
  countryId: number;
  code: string;
  aName: string;
  eName?: string;
  isActive: boolean;
}

export interface GovernorateRequest {
  id: number;
  countryId: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  isActive?: boolean;
}
