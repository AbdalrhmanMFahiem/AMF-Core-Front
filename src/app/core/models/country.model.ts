export interface CountryRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  countryGroupId?: number | null;
  isoCode?: string;
  notes?: string;
}

export interface CountryResponse extends CountryRequest {
  isActive: boolean;
}

export interface CountryBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  countryGroupId?: number | null;
  countryGroupName?: string;
  notes?: string;
}
