import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessPartnerResponse, BusinessPartnerBasicResponse, BusinessPartnerRequest } from '../models/business-partner.model';
import { BusinessPartnerStatementResponse, StatementFilter } from '../models/report.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { NextCodeResponse } from '../models/lookup.model';
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

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  create(data: BusinessPartnerRequest): Observable<BusinessPartnerResponse> {
    return this.http.post<BusinessPartnerResponse>(this.apiUrl, data);
  }

  update(id: number, data: BusinessPartnerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getStatement(filters: StatementFilter): Observable<BusinessPartnerStatementResponse> {
    let params = new HttpParams();
    if (filters.businessPartnerId) {
      params = params.set('businessPartnerId', filters.businessPartnerId.toString());
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }

    return this.http.get<BusinessPartnerStatementResponse>(`${this.apiUrl}/statement`, { params });
  }
}
