export interface LoginRequest {
  email?: string;
  password?: string;
  tenantId?: string;
  branchId?: number;
}

export interface VerifyCredentialsRequest {
  email?: string;
  password?: string;
}

export interface AdminTenantResponse {
  tenantId: string;
  name: string;
}

export interface TenantBranchResponse {
  id: number;
  tenantId: string;
  code: string;
  aName: string;
  eName: string;
}

export interface VerifyCredentialsResponse {
  isAdmin: boolean;
  tenants: AdminTenantResponse[] | null;
  branches: TenantBranchResponse[] | null;
}

export interface AuthResponse {
  id: string;
  email?: string;
  code: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
  requiresSetup?: boolean;
  companyName?: string;
  branchName?: string;
  companyCode?: string;
  branchCode?: string;
}

export interface SetupCompanyRequest {
  companyName: string;
  mainBranchName: string;
}

export interface SetupCompanyAdminRequest {
  adminEmail?: string;
  adminPassword?: string;
  companyName: string;
  mainBranchName: string;
}
