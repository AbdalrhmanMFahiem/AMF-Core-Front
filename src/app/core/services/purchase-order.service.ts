import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
import { 
  PurchaseOrderBasicResponse, 
  PurchaseOrderResponse, 
  PurchaseOrderRequest, 
  PurchaseOrderFilters 
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/purchaseOrders`;

  private getOptions(filters?: PurchaseOrderFilters) {
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

  getAll(filters: PurchaseOrderFilters): Observable<PaginatedList<PurchaseOrderBasicResponse>> {
    return this.http.get<PaginatedList<PurchaseOrderBasicResponse>>(this.apiUrl, this.getOptions(filters));
  }

  get(id: number): Observable<PurchaseOrderResponse> {
    return this.http.get<PurchaseOrderResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  add(request: PurchaseOrderRequest): Observable<PurchaseOrderResponse> {
    return this.http.post<PurchaseOrderResponse>(this.apiUrl, request);
  }

  update(id: number, request: PurchaseOrderRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  export(filters: PurchaseOrderFilters): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      ...this.getOptions(filters),
      responseType: 'blob'
    });
  }

  // Placeholder for Approve API if backend implements it.
  approve(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  // Placeholder for Cancel API if backend implements it.
  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
