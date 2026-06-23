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
  InvoicePaymentRequest,
  PaymentStatus,
  ReturnableItemResponse,
  InvoiceReturnRequest
} from '../models/invoice.model';
import { NextCodeResponse } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private getApiUrl(type: 'sales' | 'purchases'): string {
    return `${environment.apiUrl}/api/${type}/invoices`;
  }

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

  getAll(filters: InvoiceFilters, type: 'sales' | 'purchases' = 'sales'): Observable<PaginatedList<InvoiceBasicResponse>> {
    return this.http.get<PaginatedList<InvoiceBasicResponse>>(this.getApiUrl(type), this.getOptions(filters));
  }

  getStats(filters: InvoiceFilters, type: 'sales' | 'purchases' = 'sales'): Observable<InvoiceStatsResponse> {
    return this.http.get<InvoiceStatsResponse>(`${this.getApiUrl(type)}/stats`, this.getOptions(filters));
  }

  get(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.getApiUrl(type)}/${id}`);
  }

  getNextCode(type: 'sales' | 'purchases' = 'sales'): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.getApiUrl(type)}/next-code`);
  }

  add(request: InvoiceRequest, type: 'sales' | 'purchases' = 'sales'): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(this.getApiUrl(type), request);
  }

  update(id: number, request: InvoiceRequest, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/${id}`, request);
  }

  confirm(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/${id}/confirm`, {});
  }

  cancel(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/${id}/cancel`, {});
  }

  addPayment(id: number, request: InvoicePaymentRequest, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.post<void>(`${this.getApiUrl(type)}/${id}/payments`, request);
  }

  deletePayment(id: number, paymentId: number, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl(type)}/${id}/payments/${paymentId}`);
  }

  updatePaymentStatus(id: number, paymentId: number, status: PaymentStatus, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/${id}/payments/${paymentId}/status`, status);
  }

  // --- Returns ---
  getReturns(filters: InvoiceFilters, type: 'sales' | 'purchases' = 'sales'): Observable<PaginatedList<InvoiceBasicResponse>> {
    return this.http.get<PaginatedList<InvoiceBasicResponse>>(`${this.getApiUrl(type)}/returns`, this.getOptions(filters));
  }

  getReturnStats(filters: InvoiceFilters, type: 'sales' | 'purchases' = 'sales'): Observable<InvoiceStatsResponse> {
    return this.http.get<InvoiceStatsResponse>(`${this.getApiUrl(type)}/returns/stats`, this.getOptions(filters));
  }

  getReturnNextCode(type: 'sales' | 'purchases' = 'sales'): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.getApiUrl(type)}/returns/next-code`);
  }

  addReturn(request: InvoiceReturnRequest, type: 'sales' | 'purchases' = 'sales'): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.getApiUrl(type)}/returns`, request);
  }

  confirmReturn(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/returns/${id}/confirm`, {});
  }

  cancelReturn(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<void> {
    return this.http.put<void>(`${this.getApiUrl(type)}/returns/${id}/cancel`, {});
  }

  getReturnableItems(id: number, type: 'sales' | 'purchases' = 'sales'): Observable<ReturnableItemResponse[]> {
    return this.http.get<ReturnableItemResponse[]>(`${this.getApiUrl(type)}/${id}/returnable-items`);
  }

  // --- Lookups ---
  getSalesInvoicesLookup(): Observable<any[]> {
    return this.http.get<any[]>(`${this.getApiUrl('sales')}/lookup`);
  }

  getPurchaseInvoicesLookup(): Observable<any[]> {
    return this.http.get<any[]>(`${this.getApiUrl('purchases')}/lookup`);
  }
}
