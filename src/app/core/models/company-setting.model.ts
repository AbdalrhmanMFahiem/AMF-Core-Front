export interface CompanySettingResponse {
  id: number;
  companyAName: string;
  companyCode?: string;
  companyEName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  address?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoPath?: string;
  logoBinary?: string; // or any if it's base64 or blob
  iconBinary?: string;
}

export interface CompanySettingRequest {
  id: number;
  companyAName: string;
  companyCode?: string | null;
  companyEName?: string | null;
  registrationNumber?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  logoPath?: string | null;
  logoBinary?: File | null;
  iconBinary?: File | null;
}
