import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InvoiceCostElementResponse,
  InvoiceCostElementBasicResponse,
  InvoiceCostElementRequest,
  InvoiceCostElementDropdownResponse,
  InvoiceCostElementType
} from '../models/invoice-cost-element.model';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { NextCodeResponse, LookupsFilters } from '../models/lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceCostElementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/md/invoice-cost-elements`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<InvoiceCostElementBasicResponse>> {
    const params: any = { ...filters, includeDisabled };
    return this.http.get<PaginatedList<InvoiceCostElementBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<InvoiceCostElementResponse> {
    return this.http.get<InvoiceCostElementResponse>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  create(data: InvoiceCostElementRequest): Observable<InvoiceCostElementResponse> {
    return this.http.post<InvoiceCostElementResponse>(this.apiUrl, data);
  }

  update(id: number, data: InvoiceCostElementRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getDropdown(type: InvoiceCostElementType, filters?: LookupsFilters): Observable<InvoiceCostElementDropdownResponse[]> {
    if (!type) {
      throw new Error('InvoiceCostElementType must be provided');
    }
    const params: any = { ...filters, type };
    return this.http.get<InvoiceCostElementDropdownResponse[]>(`${this.apiUrl}/dropdown`, { params });
  }
}
