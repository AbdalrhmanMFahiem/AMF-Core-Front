import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { IdNameResponse } from '../models/lookup.model';
import { BranchRequest, BranchResponse, BranchBasicResponse } from '../models/branch.model';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private http = inject(HttpClient);
  private apiUrl = `/api/Branches`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<BranchBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber)
      .set('pageSize', filters.pageSize)
      .set('includeDisabled', includeDisabled);

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return this.http.get<PaginatedList<BranchBasicResponse>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`/`);
  }

  add(request: BranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(this.apiUrl, request);
  }

  update(id: number, request: BranchRequest): Observable<void> {
    return this.http.put<void>(`/`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`//toggleStatus`, {});
  }

  getDropdown(includeDisabled: boolean = false): Observable<IdNameResponse[]> {
    let params = new HttpParams().set('includeDisabled', includeDisabled);
    return this.http.get<IdNameResponse[]>(`/dropdown`, { params });
  }
  
  getNextCode(): Observable<{ nextCode: string }> {
    return this.http.get<{ nextCode: string }>(`/next-code`);
  }

  checkDefaultExists(currentId: number = 0): Observable<boolean> {
    let params = new HttpParams().set('currentId', currentId);
    return this.http.get<boolean>(`/check-default`, { params });
  }
}
