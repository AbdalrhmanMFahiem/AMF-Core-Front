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
  defaultLandingPage?: string;
  isPosOnly?: boolean;
  tenantId?: string;
  photoPath?: string;
  companyLogoPath?: string;
  permissions?: string[];
  backendUrl?: string;
  mustChangePassword?: boolean;
}


export interface SetupCompanyRequest {
  companyName: string;
  mainBranchName: string;
}

export interface SetupWarehouseRequest {
  code: string;
  aName: string;
  eName?: string;
}

export interface SetupBranchRequest {
  code: string;
  aName: string;
  eName?: string;
  warehouses: SetupWarehouseRequest[];
}

export interface SetupCompanyAdminRequest {
  adminEmail?: string;
  adminPassword?: string;
  companyCode: string;
  companyAName: string;
  companyEName?: string;
  supportExpiryDate: string;
  maxUsers: number;
  branches: SetupBranchRequest[];
}
