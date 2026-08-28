import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import {
  TenantSummaryResponse,
  TenantStatsSummaryResponse,
  TenantUserDetailResponse,
  TenantActivityLogResponse,
  UpdateTenantRequest,
  TenantActivityFilterRequest
} from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/Tenants`; }

  getAll(filters: RequestFilters, includeInactive: boolean = false): Observable<PaginatedList<TenantSummaryResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeInactive', includeInactive.toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue);
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<PaginatedList<TenantSummaryResponse>>(this.apiUrl, { params });
  }

  getStats(): Observable<TenantStatsSummaryResponse> {
    return this.http.get<TenantStatsSummaryResponse>(`${this.apiUrl}/stats`);
  }

  getById(id: string): Observable<TenantSummaryResponse> {
    return this.http.get<TenantSummaryResponse>(`${this.apiUrl}/${id}`);
  }

  getTenantUsers(id: string): Observable<TenantUserDetailResponse[]> {
    return this.http.get<TenantUserDetailResponse[]>(`${this.apiUrl}/${id}/users`);
  }

  getActivityLogs(filters: RequestFilters, activityFilters?: TenantActivityFilterRequest): Observable<PaginatedList<TenantActivityLogResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue);
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    if (activityFilters?.tenantId) {
      params = params.set('tenantId', activityFilters.tenantId);
    }
    if (activityFilters?.onlyActive !== undefined && activityFilters.onlyActive !== null) {
      params = params.set('onlyActive', activityFilters.onlyActive.toString());
    }
    if (activityFilters?.fromDate) {
      params = params.set('fromDate', activityFilters.fromDate);
    }
    if (activityFilters?.toDate) {
      params = params.set('toDate', activityFilters.toDate);
    }

    return this.http.get<PaginatedList<TenantActivityLogResponse>>(`${this.apiUrl}/activity`, { params });
  }

  update(id: string, request: UpdateTenantRequest): Observable<TenantSummaryResponse> {
    return this.http.put<TenantSummaryResponse>(`${this.apiUrl}/${id}`, request);
  }

  toggleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
