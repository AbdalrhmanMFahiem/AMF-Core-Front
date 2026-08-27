import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import { CountryGroupResponse, CountryGroupRequest, CountryGroupBasicResponse } from '../models/country-group.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class CountryGroupService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private get baseUrl() { return `${this.config.apiUrl}/api/administration/CountryGroups`; }

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<CountryGroupBasicResponse>> {
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

    return this.http.get<PaginatedList<CountryGroupBasicResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<CountryGroupResponse> {
    return this.http.get<CountryGroupResponse>(`${this.baseUrl}/${id}`);
  }

  add(request: CountryGroupRequest): Observable<CountryGroupResponse> {
    return this.http.post<CountryGroupResponse>(this.baseUrl, request);
  }

  update(id: number, request: CountryGroupRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`);
  }
}
