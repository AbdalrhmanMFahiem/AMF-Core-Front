import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DistrictRequest, DistrictResponse, DistrictBasicResponse, DistrictFilters } from '../models/district.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { IdNameResponse, NextCodeResponse } from '../models/lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/administration/District`;

  getAll(filters: DistrictFilters, includeDisabled: boolean = false): Observable<PaginatedList<DistrictBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    if (filters.cityId) params = params.set('cityId', filters.cityId.toString());

    return this.http.get<PaginatedList<DistrictBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<DistrictResponse> {
    return this.http.get<DistrictResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: DistrictRequest): Observable<DistrictResponse> {
    return this.http.post<DistrictResponse>(this.apiUrl, data);
  }

  update(id: number, data: DistrictRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }
}
