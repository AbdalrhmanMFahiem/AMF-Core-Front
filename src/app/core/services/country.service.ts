import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CountryRequest, CountryResponse, CountryBasicResponse } from '../models/country.model';
import { NextCodeResponse } from '../models/lookup.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/administration/Country`; }

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<CountryBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return this.http.get<PaginatedList<CountryBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<CountryResponse> {
    return this.http.get<CountryResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: CountryRequest): Observable<CountryResponse> {
    return this.http.post<CountryResponse>(this.apiUrl, data);
  }

  update(id: number, data: CountryRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }
}
