export interface BranchRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string;
  parentBranchId?: number;
  isDefault: boolean;
  notes?: string;
}

export interface BranchResponse {
  id: number;
  code: string;
  aName: string;
  eName: string;
  isActive: boolean;
  isDefault: boolean;
  parentBranchId?: number;
  parentBranchName?: string;
  notes?: string;
}

export interface BranchBasicResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  parentBranchId?: number;
  parentBranchName?: string;
  notes?: string;
}
