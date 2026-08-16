import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessPartnerResponse, BusinessPartnerBasicResponse, BusinessPartnerRequest, QuickCustomerRequest, QuickVendorRequest, BusinessPartnerQuickViewResponse } from '../models/business-partner.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
import { BusinessPartnerLedgerResponse, LedgerFilters, BalanceSummaryResponse, AddOpeningBalanceRequest } from '../models/business-partner.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessPartnerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/md/business-partner`;
  // private reportUrl = `${environment.apiUrl}/api/Reports`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<BusinessPartnerBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
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

    return this.http.get<PaginatedList<BusinessPartnerBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<BusinessPartnerResponse> {
    return this.http.get<BusinessPartnerResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(isCustomer?: boolean, isVendor?: boolean): Observable<NextCodeResponse> {
    let params = new HttpParams();
    if (isCustomer !== undefined && isCustomer !== null) {
      params = params.set('isCustomer', isCustomer.toString());
    }
    if (isVendor !== undefined && isVendor !== null) {
      params = params.set('isVendor', isVendor.toString());
    }
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`, { params });
  }

  create(data: BusinessPartnerRequest): Observable<BusinessPartnerResponse> {
    return this.http.post<BusinessPartnerResponse>(this.apiUrl, data);
  }

  quickCreateCustomer(data: QuickCustomerRequest): Observable<BusinessPartnerResponse> {
    return this.http.post<BusinessPartnerResponse>(`${this.apiUrl}/quick-customer`, data);
  }

  quickCreateVendor(data: QuickVendorRequest): Observable<BusinessPartnerResponse> {
    return this.http.post<BusinessPartnerResponse>(`${this.apiUrl}/quick-vendor`, data);
  }

  update(id: number, data: BusinessPartnerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  addOpeningBalance(id: number, data: AddOpeningBalanceRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/opening-balance`, data);
  }

  getBalanceSummary(id: number): Observable<BalanceSummaryResponse> {
    return this.http.get<BalanceSummaryResponse>(`${this.apiUrl}/${id}/balance-summary`);
  }

  getLedger(id: number, filters: LedgerFilters): Observable<PaginatedList<BusinessPartnerLedgerResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.from) {
      params = params.set('from', filters.from);
    }
    if (filters.to) {
      params = params.set('to', filters.to);
    }
    if (filters.entryType !== undefined && filters.entryType !== null) {
      params = params.set('entryType', filters.entryType.toString());
    }

    return this.http.get<PaginatedList<BusinessPartnerLedgerResponse>>(`${this.apiUrl}/${id}/ledger`, { params });
  }

  getSalesReps(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/sales-reps`);
  }

  assignSalesRep(id: number, data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/sales-reps`, data);
  }

  removeSalesRep(id: number, repId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/sales-reps/${repId}`);
  }

  getQuickView(id: number): Observable<BusinessPartnerQuickViewResponse> {
    return this.http.get<BusinessPartnerQuickViewResponse>(`${this.apiUrl}/${id}/quick-view`);
  }
}
