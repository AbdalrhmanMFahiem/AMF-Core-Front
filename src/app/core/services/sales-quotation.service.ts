import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { PaginatedList } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
import { 
  SalesQuotationBasicResponse, 
  SalesQuotationResponse, 
  SalesQuotationRequest, 
  SalesQuotationFilters,
  OpenSalesQuotationLineResponse
} from '../models/sales-quotation.model';

@Injectable({
  providedIn: 'root'
})
export class SalesQuotationService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/salesQuotations`; }

  private getOptions(filters?: SalesQuotationFilters) {
    let params = new HttpParams();
    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
      if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.approvalStatus) params = params.set('approvalStatus', filters.approvalStatus);
      if (filters.businessPartnerId) params = params.set('businessPartnerId', filters.businessPartnerId.toString());
      if (filters.documentDateFrom) params = params.set('documentDateFrom', filters.documentDateFrom);
      if (filters.documentDateTo) params = params.set('documentDateTo', filters.documentDateTo);
      if (filters.dueDateFrom) params = params.set('dueDateFrom', filters.dueDateFrom);
      if (filters.dueDateTo) params = params.set('dueDateTo', filters.dueDateTo);
    }
    return { params };
  }

  getAll(filters: SalesQuotationFilters): Observable<PaginatedList<SalesQuotationBasicResponse>> {
    return this.http.get<PaginatedList<SalesQuotationBasicResponse>>(this.apiUrl, this.getOptions(filters));
  }

  get(id: number): Observable<SalesQuotationResponse> {
    return this.http.get<SalesQuotationResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  add(request: SalesQuotationRequest): Observable<SalesQuotationResponse> {
    return this.http.post<SalesQuotationResponse>(this.apiUrl, request);
  }

  update(id: number, request: SalesQuotationRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  export(filters: SalesQuotationFilters): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      ...this.getOptions(filters),
      responseType: 'blob'
    });
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  getOpenLines(customerId: number): Observable<OpenSalesQuotationLineResponse[]> {
    return this.http.get<OpenSalesQuotationLineResponse[]>(`${this.apiUrl}/open-lines?customerId=${customerId}`);
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  close(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/close`, {});
  }

  printPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/print-pdf`, { responseType: 'blob' });
  }
}
