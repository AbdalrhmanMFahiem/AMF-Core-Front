import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemBomResponse, ItemBomBasicResponse, ItemBomRequest, ItemBomFilters, BomComponentLookupResponse } from '../models/item-bom.model';
import { IdNameResponse, LookupsFilters, IntIdCodeNameResponse, ItemLookupResponse, ItemLookupsFilters } from '../models/lookup.model';
import { PaginatedList } from '../models/pagination.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ItemBomService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/ItemBoms`; }

  getAll(filters: ItemBomFilters, includeDisabled: boolean = false): Observable<PaginatedList<ItemBomBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', (filters.pageNumber || 1).toString())
      .set('pageSize', (filters.pageSize || 10).toString())
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

    return this.http.get<PaginatedList<ItemBomBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<ItemBomResponse> {
    return this.http.get<ItemBomResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: ItemBomRequest): Observable<ItemBomResponse> {
    return this.http.post<ItemBomResponse>(this.apiUrl, data);
  }

  update(id: number, data: ItemBomRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getDDL(filters: LookupsFilters & { excludedId?: number, includeDisabled?: boolean }): Observable<IdNameResponse[]> {
    let params = new HttpParams();
    if (filters.excludedId !== undefined && filters.excludedId !== null) {
      params = params.set('excludedId', filters.excludedId.toString());
    }
    if (filters.includeDisabled !== undefined && filters.includeDisabled !== null) {
      params = params.set('includeDisabled', filters.includeDisabled.toString());
    }
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/ddl`, { params });
  }

  getComponentsLookup(headerItemId: number, lineType: string | number): Observable<BomComponentLookupResponse[]> {
    let params = new HttpParams()
      .set('headerItemId', headerItemId.toString())
      .set('lineType', lineType.toString());
    
    return this.http.get<BomComponentLookupResponse[]>(`${this.apiUrl}/components-lookup`, { params });
  }

  getHeaderItemsLookup(filters: ItemLookupsFilters, excludeItemId?: number): Observable<PaginatedList<ItemLookupResponse>> {
    let params = new HttpParams()
      .set('pageNumber', (filters.pageNumber || 1).toString())
      .set('pageSize', (filters.pageSize || 10).toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue);
    }
    if (excludeItemId) {
      params = params.set('excludeItemId', excludeItemId.toString());
    }

    return this.http.get<PaginatedList<ItemLookupResponse>>(`${this.apiUrl}/header-items-lookup`, { params });
  }
}

