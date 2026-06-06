export interface BusinessPartnerResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string;
  isCustomer: boolean;
  isVendor: boolean;
  phone?: string;
  email?: string;
  address?: string;
  name?: string;
  bpType?: string;
}

export interface BusinessPartnerBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  bpType?: string;
}

export interface BusinessPartnerRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  notes?: string;
  isActive: boolean;
  isCustomer: boolean;
  isVendor: boolean;
  phone?: string;
  email?: string;
  address?: string;
}
