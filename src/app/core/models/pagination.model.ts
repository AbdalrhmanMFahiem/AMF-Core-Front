export interface RequestFilters {
  pageNumber: number;
  pageSize: number;
  searchValue?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
