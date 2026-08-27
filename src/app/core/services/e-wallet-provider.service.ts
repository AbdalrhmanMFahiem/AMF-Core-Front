import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { RequestFilters, PaginatedList } from '../models/pagination.model';
import { NextCodeResponse, IntIdCodeNameResponse } from '../models/lookup.model';
import {
  EWalletProviderRequest,
  EWalletProviderResponse,
  EWalletProviderBasicResponse
} from '../models/e-wallet-provider.model';

@Injectable({ providedIn: 'root' })
export class EWalletProviderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private get baseUrl() { return `${this.config.apiUrl}/api/ewallet-providers`; }

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<EWalletProviderBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return this.http.get<PaginatedList<EWalletProviderBasicResponse>>(this.baseUrl, { params });
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.baseUrl}/next-code`);
  }

  get(id: number): Observable<EWalletProviderResponse> {
    return this.http.get<EWalletProviderResponse>(`${this.baseUrl}/${id}`);
  }

  add(request: EWalletProviderRequest): Observable<EWalletProviderResponse> {
    return this.http.post<EWalletProviderResponse>(this.baseUrl, request);
  }

  update(id: number, request: EWalletProviderRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggleStatus`, {});
  }
}
