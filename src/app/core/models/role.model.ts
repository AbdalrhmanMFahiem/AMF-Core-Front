export interface RoleResponse {
  id: string;
  name: string;
  aName: string;
  eName?: string;
  isActive: boolean;
  notes?: string;
  isDeleted: boolean;
}

export interface RoleWithPermissionsResponse {
  id: string;
  name: string;
  aName: string;
  eName?: string;
  isActive: boolean;
  notes?: string;
  isDeleted: boolean;
  tree: PermissionNodeResponse[];
}

export interface PermissionNodeResponse {
  key: string;
  displayName: string;
  collapsed: boolean;
  module?: string;
  permissions?: PermissionActionResponse[];
  children?: PermissionNodeResponse[];
}

export interface PermissionActionResponse {
  key: string;
  displayName: string;
  isAssigned: boolean;
}

export interface AllPermissionsResponse {
  tree: PermissionNodeResponse[];
}

export interface RoleRequest {
  aName: string;
  eName?: string;
  notes?: string;
  permissions: string[];
}
