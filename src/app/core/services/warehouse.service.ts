import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { RequestFilters } from '../models/pagination.model';
import { IdNameResponse } from '../models/lookup.model';
import { WarehouseRequest, WarehouseResponse, WarehouseBasicResponse } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Warehouses`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<WarehouseBasicResponse>> {
    let params: any = { ...filters, includeDisabled };
    return this.http.get<PaginatedList<WarehouseBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<WarehouseResponse> {
    return this.http.get<WarehouseResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: WarehouseRequest): Observable<WarehouseResponse> {
    return this.http.post<WarehouseResponse>(this.apiUrl, data);
  }

  update(id: number, data: WarehouseRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggleStatus`, {});
  }

  getNextCode(): Observable<{ nextCode: string }> {
    return this.http.get<{ nextCode: string }>(`${this.apiUrl}/next-code`);
  }

  getDropdown(includeDisabled: boolean = false): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/dropdown`, { params: { includeDisabled } });
  }
}
