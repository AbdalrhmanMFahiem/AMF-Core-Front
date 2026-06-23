export interface LoginRequest {
  email?: string;
  password?: string;
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
}

export interface SetupCompanyRequest {
  companyName: string;
  mainBranchName: string;
}
