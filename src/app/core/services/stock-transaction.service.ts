import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { PaginatedList } from '../models/pagination.model';
import { StockTransactionFilters, StockTransactionResponse } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class StockTransactionService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/inventory/stock-transactions`; }

  getAll(filters: StockTransactionFilters): Observable<PaginatedList<StockTransactionResponse>> {
    let params = new HttpParams();
    if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.itemId) params = params.set('itemId', filters.itemId.toString());
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId.toString());
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType.toString());
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<PaginatedList<StockTransactionResponse>>(this.apiUrl, { params });
  }

  exportToExcel(filters: StockTransactionFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.itemId) params = params.set('itemId', filters.itemId.toString());
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId.toString());
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType.toString());
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get(`${this.apiUrl}/export-excel`, { params, responseType: 'blob' });
  }

  exportToPdf(filters: StockTransactionFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.itemId) params = params.set('itemId', filters.itemId.toString());
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId.toString());
    if (filters.transactionType) params = params.set('transactionType', filters.transactionType.toString());
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get(`${this.apiUrl}/export-pdf`, { params, responseType: 'blob' });
  }

  getByItem(itemId: number): Observable<StockTransactionResponse[]> {
    return this.http.get<StockTransactionResponse[]>(`${this.apiUrl}/item/${itemId}`);
  }

  getByWarehouse(warehouseId: number): Observable<StockTransactionResponse[]> {
    return this.http.get<StockTransactionResponse[]>(`${this.apiUrl}/warehouse/${warehouseId}`);
  }
}
