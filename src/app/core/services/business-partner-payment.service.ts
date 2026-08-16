import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
import {
  BusinessPartnerPaymentRequest,
  BusinessPartnerPaymentResponse,
  BusinessPartnerPaymentBasicResponse,
  PaymentFilters,
  AllocationRequest,
  SuggestedAllocationDto,
  VerifyPaymentRequest,
  BalanceSummaryResponse
} from '../models/business-partner-payment.model';

@Injectable({ providedIn: 'root' })
export class BusinessPartnerPaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/business-partner-payments`;

  getAll(filters: PaymentFilters): Observable<PaginatedList<BusinessPartnerPaymentBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    if (filters.businessPartnerId) params = params.set('businessPartnerId', filters.businessPartnerId.toString());
    if (filters.direction) params = params.set('direction', filters.direction);
    if (filters.status !== undefined && filters.status !== null) params = params.set('status', filters.status.toString());
    if (filters.method !== undefined && filters.method !== null) params = params.set('method', filters.method.toString());
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<PaginatedList<BusinessPartnerPaymentBasicResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<BusinessPartnerPaymentResponse> {
    return this.http.get<BusinessPartnerPaymentResponse>(`${this.baseUrl}/${id}`);
  }

  getNextCode(direction: string): Observable<NextCodeResponse> {
    const params = new HttpParams().set('direction', direction);
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`, { params });
  }

  add(request: BusinessPartnerPaymentRequest): Observable<BusinessPartnerPaymentResponse> {
    return this.http.post<BusinessPartnerPaymentResponse>(this.baseUrl, request, {
      headers: new HttpHeaders({ 'X-Skip-Toast': 'true' })
    });
  }

  uploadReceipt(paymentId: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<void>(`${this.baseUrl}/${paymentId}/upload-receipt`, formData);
  }

  verify(paymentId: number, request: VerifyPaymentRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${paymentId}/verify`, request);
  }

  suggestAllocation(businessPartnerId: number, amount: number, filterType?: number): Observable<SuggestedAllocationDto[]> {
    let params = new HttpParams()
      .set('businessPartnerId', businessPartnerId.toString())
      .set('amount', amount.toString());
    if (filterType !== undefined && filterType !== null) {
      params = params.set('filterType', filterType.toString());
    }
    return this.http.get<SuggestedAllocationDto[]>(`${this.baseUrl}/suggest-fifo`, { params });
  }

  allocate(paymentId: number, allocations: AllocationRequest[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${paymentId}/allocate`, allocations);
  }

  deallocate(paymentId: number, allocationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${paymentId}/deallocate/${allocationId}`);
  }

  getPartnerBalanceSummary(businessPartnerId: number): Observable<BalanceSummaryResponse> {
    return this.http.get<BalanceSummaryResponse>(`${environment.apiUrl}/api/md/business-partner/${businessPartnerId}/balance-summary`);
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
