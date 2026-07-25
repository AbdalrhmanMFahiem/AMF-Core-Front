import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
import { 
  SalesOrderBasicResponse, 
  SalesOrderResponse, 
  SalesOrderRequest, 
  SalesOrderFilters
} from '../models/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/salesOrders`;

  private getOptions(filters?: SalesOrderFilters) {
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

  getAll(filters: SalesOrderFilters): Observable<PaginatedList<SalesOrderBasicResponse>> {
    return this.http.get<PaginatedList<SalesOrderBasicResponse>>(this.apiUrl, this.getOptions(filters));
  }

  get(id: number): Observable<SalesOrderResponse> {
    return this.http.get<SalesOrderResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  add(request: SalesOrderRequest): Observable<SalesOrderResponse> {
    return this.http.post<SalesOrderResponse>(this.apiUrl, request);
  }

  update(id: number, request: SalesOrderRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  export(filters: SalesOrderFilters): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      ...this.getOptions(filters),
      responseType: 'blob'
    });
  }

  confirm(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
