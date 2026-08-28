export interface TenantSummaryResponse {
  tenantId: string;
  name: string;
  companyCode?: string;
  isActive: boolean;
  maxUsers: number;
  totalUsers: number;
  activeUsers: number;
  branchesCount: number;
  warehousesCount: number;
  supportExpiryDate?: string;
  lastActivityOn?: string;
  createdOn: string;
  licenseStatus: 'Valid' | 'ExpiringSoon' | 'Expired';
  daysUntilExpiry?: number;
}

export interface TenantStatsSummaryResponse {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsersAcrossTenants: number;
  activeUsersAcrossTenants: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalBranches: number;
}

export interface TenantUserDetailResponse {
  id: string;
  code: string;
  name: string;
  email: string;
  isActive: boolean;
  lockAccess: boolean;
  lastLoginOn?: string;
  lastLoginIp?: string;
  profilePhoto?: string;
  tenantId?: string;
  tenantName?: string;
  roles: string[];
  branches: string[];
}

export interface TenantActivityLogResponse {
  userId: string;
  userCode: string;
  userName: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  lastLoginOn?: string;
  lastLoginIp?: string;
  isActive: boolean;
  roles: string[];
  defaultBranchName?: string;
}

export interface UpdateTenantRequest {
  name: string;
  maxUsers: number;
  supportExpiryDate?: string;
  isActive: boolean;
}

export interface TenantActivityFilterRequest {
  tenantId?: string;
  searchValue?: string;
  onlyActive?: boolean;
  fromDate?: string;
  toDate?: string;
}
