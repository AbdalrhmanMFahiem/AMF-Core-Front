import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import {
  InvoiceFilters,
  InvoiceBasicResponse,
  InvoiceStatsResponse,
  InvoiceResponse,
  InvoiceRequest,
  InvoicePaymentRequest
} from '../models/invoice.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/sales/invoices`;

  private getOptions(filters?: InvoiceFilters) {
    let params = new HttpParams();
    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
      if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.businessPartnerId) params = params.set('businessPartnerId', filters.businessPartnerId.toString());
      if (filters.invoiceDateFrom) params = params.set('invoiceDateFrom', filters.invoiceDateFrom);
      if (filters.invoiceDateTo) params = params.set('invoiceDateTo', filters.invoiceDateTo);
      if (filters.dueDateFrom) params = params.set('dueDateFrom', filters.dueDateFrom);
      if (filters.dueDateTo) params = params.set('dueDateTo', filters.dueDateTo);
    }
    return { params };
  }

  getAll(filters: InvoiceFilters): Observable<PaginatedList<InvoiceBasicResponse>> {
    return this.http.get<PaginatedList<InvoiceBasicResponse>>(this.apiUrl, this.getOptions(filters));
  }

  getStats(filters: InvoiceFilters): Observable<InvoiceStatsResponse> {
    return this.http.get<InvoiceStatsResponse>(`${this.apiUrl}/stats`, this.getOptions(filters));
  }

  get(id: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  add(request: InvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(this.apiUrl, request);
  }

  update(id: number, request: InvoiceRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  addPayment(id: number, request: InvoicePaymentRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/payments`, request);
  }
}
