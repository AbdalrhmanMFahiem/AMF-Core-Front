export interface CountryGroupRequest {

  id: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
}

export interface CountryGroupResponse extends CountryGroupRequest {
  isActive: boolean;
}

export interface CountryGroupBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}
