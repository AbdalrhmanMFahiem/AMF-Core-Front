import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import { ItemPropertyResponse, ItemPropertyRequest } from '../models/item-property.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class ItemPropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/ItemProperties`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<ItemPropertyResponse>> {
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

    return this.http.get<PaginatedList<ItemPropertyResponse>>(this.baseUrl, { params });
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`);
  }

  get(id: number): Observable<ItemPropertyResponse> {
    return this.http.get<ItemPropertyResponse>(`${this.baseUrl}/${id}`);
  }

  add(request: ItemPropertyRequest): Observable<ItemPropertyResponse> {
    return this.http.post<ItemPropertyResponse>(this.baseUrl, request);
  }

  update(id: number, request: ItemPropertyRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggleStatus`, {});
  }
}
