export interface EWalletProviderRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string | null;
  notes?: string | null;
  fixedCommission: number;
  commissionPercent: number;
  maxCommission?: number | null;
}

export interface EWalletProviderResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  notes?: string | null;
  fixedCommission: number;
  commissionPercent: number;
  maxCommission?: number | null;
}

export interface EWalletProviderBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  fixedCommission: number;
  commissionPercent: number;
  maxCommission?: number | null;
}
