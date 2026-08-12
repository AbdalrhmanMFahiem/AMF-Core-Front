export interface CompanySettingResponse {
  id: number;
  companyAName: string;
  companyCode?: string;
  companyEName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  address?: string;
  defaultCountryId?: number | null;
  defaultCountryName?: string | null;
  defaultGovernorateId?: number | null;
  defaultGovernorateName?: string | null;
  defaultCityId?: number | null;
  defaultCityName?: string | null;
  defaultDistrictId?: number | null;
  defaultDistrictName?: string | null;
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
  defaultCountryId?: number | null;
  defaultGovernorateId?: number | null;
  defaultCityId?: number | null;
  defaultDistrictId?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  logoPath?: string | null;
  logoBinary?: File | null;
  iconBinary?: File | null;
}
