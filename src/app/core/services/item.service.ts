import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemResponse, ItemBasicResponse, ItemRequest } from '../models/item.model';
import { NextCodeResponse } from '../models/lookup.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Items`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<ItemResponse>> {
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

    return this.http.get<PaginatedList<ItemResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<ItemBasicResponse> {
    return this.http.get<ItemBasicResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  create(data: ItemRequest): Observable<ItemResponse> {
    return this.http.post<ItemResponse>(this.apiUrl, data);
  }

  update(id: number, data: ItemRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }
}
