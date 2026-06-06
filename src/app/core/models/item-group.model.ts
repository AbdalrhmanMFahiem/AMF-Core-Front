export interface ItemGroupResponse {
  id: number;
  code: string;
  name: string;
  aName: string;
  eName: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface NextCodeResponse {
  nextCode: string;
}

export interface ItemGroupRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string | null;
  notes?: string | null;
}
