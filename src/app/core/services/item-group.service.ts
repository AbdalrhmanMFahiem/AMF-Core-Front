import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import { ItemGroupResponse, ItemGroupRequest } from '../models/item-group.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class ItemGroupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/ItemGroups`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<ItemGroupResponse>> {
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

    return this.http.get<PaginatedList<ItemGroupResponse>>(this.baseUrl, { params });
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`);
  }

  get(id: number): Observable<ItemGroupResponse> {
    return this.http.get<ItemGroupResponse>(`${this.baseUrl}/${id}`);
  }

  add(request: ItemGroupRequest): Observable<ItemGroupResponse> {
    return this.http.post<ItemGroupResponse>(this.baseUrl, request);
  }

  update(id: number, request: ItemGroupRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggleStatus`, {});
  }
}
