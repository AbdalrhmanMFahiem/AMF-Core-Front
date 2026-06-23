import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { StockTransferRequest, StockTransferResponse } from '../models/inventory.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/stock-transfers`;

  getAll(pageNumber?: number, pageSize?: number, searchValue?: string): Observable<PaginatedList<StockTransferResponse>> {
    let params = new HttpParams();
    if (pageNumber) params = params.set('pageNumber', pageNumber.toString());
    if (pageSize) params = params.set('pageSize', pageSize.toString());
    if (searchValue) params = params.set('searchValue', searchValue);

    return this.http.get<PaginatedList<StockTransferResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<StockTransferResponse> {
    return this.http.get<StockTransferResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  create(request: StockTransferRequest): Observable<StockTransferResponse> {
    return this.http.post<StockTransferResponse>(this.apiUrl, request);
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
