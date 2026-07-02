export interface UserBasicResponse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  changePassword: boolean;
  lockAccess: boolean;
  notes?: string;
  email: string;
  isDisabled: boolean;
  roles: string[];
}

export interface UserResponse {
  id: string;
  code: string;
  firstPrimaryName: string;
  lastPrimaryName: string;
  firstForeignName?: string;
  lastForeignName?: string;
  isActive: boolean;
  changePassword: boolean;
  lockAccess: boolean;
  photoPath?: string;
  notes?: string;
  email: string;
  isDisabled: boolean;
  roles: string[];
  userEmploymentInfo?: UserEmploymentInfoResponse;
}

export interface UserEmploymentInfoResponse {
  userId: string;
  managerId?: string;
  managerName?: string;
  jobTitleId?: number;
  jobTitleName?: string;
  hardAnnualLeave: number;
  balanceDueDate?: string; // Date string
  haveBalance: boolean;
  birthDate: string; // Date string
  gender: number; // Enum: Male=1, Female=2
  nationalityId: number;
  nationalityName: string;
  nationalId: string;
  passportNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  governorate?: string;
  postalCode?: string;
  country?: string;
  bankId?: number;
  bankAccount?: string;
  socialInsurance?: string;
  medicalInsurance?: string;
  sectorId?: number;
  sectorName?: string;
  departmentId?: number;
  departmentName?: string;
  sectionId?: number;
  sectionName?: string;
  locationId?: number;
  locationName?: string;
  isDeployed: boolean;
  additionalInfo?: string;
}

export interface CreateUserRequest {
  code: string;
  firstPrimaryName: string;
  lastPrimaryName: string;
  firstForeignName: string;
  lastForeignName: string;
  isActive: boolean;
  changePassword: boolean;
  lockAccess: boolean;
  photo?: File;
  deletedPhoto?: string;
  notes?: string;
  email: string;
  password?: string;
  roles: string[];
  userEmploymentInfo: UserEmploymentInfoRequest;
}

export interface UpdateUserRequest {
  code: string;
  firstPrimaryName: string;
  lastPrimaryName: string;
  firstForeignName: string;
  lastForeignName: string;
  isActive: boolean;
  changePassword: boolean;
  lockAccess: boolean;
  photo?: File;
  deletedPhoto?: string;
  notes?: string;
  email: string;
  password?: string;
  roles: string[];
  userEmploymentInfo: UserEmploymentInfoRequest;
}

export interface UserEmploymentInfoRequest {
  userId: string;
  managerId?: string;
  jobTitleId?: number;
  hardAnnualLeave: number;
  balanceDueDate?: string;
  haveBalance: boolean;
  birthDate: string;
  gender: number;
  nationalityId: number;
  nationalId: string;
  passportNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  governorate?: string;
  postalCode?: string;
  country?: string;
  bankId?: number;
  bankAccount?: string;
  socialInsurance?: string;
  medicalInsurance?: string;
  sectorId?: number;
  departmentId?: number;
  sectionId?: number;
  locationId?: number;
  isDeployed: boolean;
  additionalInfo?: string;
}
