export interface LookupsFilters {
  searchValue?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IdNameResponse {
  id: number;
  name: string;
}

export interface CodeNameResponse {
  code: string;
  name: string;
}

export interface IntIdCodeNameResponse {
  id: number;
  code: string;
  name: string;
}

export interface StringIdCodeNameResponse {
  id: string;
  code: string;
  name: string;
}

export interface IntIdCodeNameGroupedResponse extends IntIdCodeNameResponse {
  groupedItems: IntIdCodeNameResponse[];
}

export interface StringIdCodeNameGroupedResponse extends StringIdCodeNameResponse {
  groupedItems: StringIdCodeNameResponse[];
}

export interface SimpleCrudResponse {
  id: number;
  code: string;
  name: string;
  notes?: string;
  isActive: boolean;
}

export interface NextCodeResponse {
  nextCode: string;
}
