import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemResponse, ItemBasicResponse, ItemRequest, ItemFilters, ItemUnitOfMeasureResponse, ItemPurchasingDetailsResponse, ItemSalesDetailsResponse, ItemWarehouseStockResponse } from '../models/item.model';
import { ItemBomLineResponse } from '../models/item-bom.model';
import { NextCodeResponse } from '../models/lookup.model';
import { PaginatedList } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Items`;

  getAll(filters: ItemFilters, includeDisabled: boolean = false): Observable<PaginatedList<ItemBasicResponse>> {
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
    if (filters.itemGroupId) {
      params = params.set('itemGroupId', filters.itemGroupId.toString());
    }
    if (filters.itemPropertyId) {
      params = params.set('itemPropertyId', filters.itemPropertyId.toString());
    }
    if (filters.warehouseId) {
      params = params.set('warehouseId', filters.warehouseId.toString());
    }
    if (filters.baseUomType) {
      params = params.set('baseUomType', filters.baseUomType);
    }
    if (filters.usageType) {
      params = params.set('usageType', filters.usageType);
    }

    return this.http.get<PaginatedList<ItemBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<ItemBasicResponse> {
    return this.http.get<ItemBasicResponse>(`${this.apiUrl}/${id}`);
  }

  getPurchasingDetails(id: number): Observable<ItemPurchasingDetailsResponse> {
    return this.http.get<ItemPurchasingDetailsResponse>(`${this.apiUrl}/${id}/purchasing-details`);
  }

  getSalesDetails(id: number): Observable<ItemSalesDetailsResponse> {
    return this.http.get<ItemSalesDetailsResponse>(`${this.apiUrl}/${id}/sales-details`);
  }

  getUnitsOfMeasure(id: number): Observable<ItemUnitOfMeasureResponse[]> {
    return this.http.get<ItemUnitOfMeasureResponse[]>(`${this.apiUrl}/${id}/units-of-measure`);
  }

  getWarehouseStock(id: number): Observable<ItemWarehouseStockResponse> {
    return this.http.get<ItemWarehouseStockResponse>(`${this.apiUrl}/${id}/warehouse-stock`);
  }

  getBomComponents(id: number): Observable<ItemBomLineResponse[]> {
    return this.http.get<ItemBomLineResponse[]>(`${this.apiUrl}/${id}/bom-components`);
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
