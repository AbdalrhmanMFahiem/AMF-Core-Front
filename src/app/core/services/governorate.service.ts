import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GovernorateRequest, GovernorateResponse, GovernorateBasicResponse } from '../models/governorate.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { IdNameResponse, NextCodeResponse } from '../models/lookup.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class GovernorateService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/administration/Governorate`; }

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<GovernorateBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return this.http.get<PaginatedList<GovernorateBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<GovernorateResponse> {
    return this.http.get<GovernorateResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: GovernorateRequest): Observable<GovernorateResponse> {
    return this.http.post<GovernorateResponse>(this.apiUrl, data);
  }

  update(id: number, data: GovernorateRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }
}
