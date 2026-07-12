import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { StockAdjustmentRequest, StockAdjustmentResponse } from '../models/inventory.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class StockAdjustmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/stock-adjustments`;

  getAll(pageNumber?: number, pageSize?: number, searchValue?: string): Observable<PaginatedList<StockAdjustmentResponse>> {
    let params = new HttpParams();
    if (pageNumber) params = params.set('pageNumber', pageNumber.toString());
    if (pageSize) params = params.set('pageSize', pageSize.toString());
    if (searchValue) params = params.set('searchValue', searchValue);

    return this.http.get<PaginatedList<StockAdjustmentResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<StockAdjustmentResponse> {
    return this.http.get<StockAdjustmentResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  create(request: StockAdjustmentRequest): Observable<StockAdjustmentResponse> {
    return this.http.post<StockAdjustmentResponse>(this.apiUrl, request);
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
