import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleResponse, RoleWithPermissionsResponse, RoleRequest, AllPermissionsResponse } from '../models/role.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Roles`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<RoleResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue);
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<PaginatedList<RoleResponse>>(this.apiUrl, { params });
  }

  get(id: string): Observable<RoleWithPermissionsResponse> {
    return this.http.get<RoleWithPermissionsResponse>(`${this.apiUrl}/${id}`);
  }

  getAllPermissions(): Observable<AllPermissionsResponse> {
    return this.http.get<AllPermissionsResponse>(`${this.apiUrl}/permissions`);
  }

  create(data: RoleRequest): Observable<RoleWithPermissionsResponse> {
    return this.http.post<RoleWithPermissionsResponse>(this.apiUrl, data);
  }

  update(id: string, data: RoleRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
