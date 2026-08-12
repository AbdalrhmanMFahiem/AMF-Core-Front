import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CityRequest, CityResponse, CityBasicResponse, CityFilters } from '../models/city.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { IdNameResponse, NextCodeResponse } from '../models/lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/administration/City`;

  getAll(filters: CityFilters, includeDisabled: boolean = false): Observable<PaginatedList<CityBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    if (filters.governorateId) params = params.set('governorateId', filters.governorateId.toString());

    return this.http.get<PaginatedList<CityBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<CityResponse> {
    return this.http.get<CityResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: CityRequest): Observable<CityResponse> {
    return this.http.post<CityResponse>(this.apiUrl, data);
  }

  update(id: number, data: CityRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }
}
