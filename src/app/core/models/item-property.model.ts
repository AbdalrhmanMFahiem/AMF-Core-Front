export interface ItemPropertyResponse {
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

export interface ItemPropertyRequest {
  id: number;
  code: string;
  aName: string;
  eName?: string | null;
  notes?: string | null;
}
