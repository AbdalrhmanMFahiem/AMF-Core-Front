import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedList, RequestFilters } from '../models/pagination.model';
import { UnitOfMeasure, UnitOfMeasureRequest, UomType, UnitOfMeasureFilters } from '../models/uom.model';
import { NextCodeResponse } from '../models/lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitOfMeasureService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/inventory/unit-of-measures`;

  getUnitOfMeasures(filter: UnitOfMeasureFilters, includeDisabled: boolean = false): Observable<PaginatedList<UnitOfMeasure>> {
    let params = new HttpParams();
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    if (filter.sortColumn) params = params.set('sortColumn', filter.sortColumn);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    if (filter.searchValue) params = params.set('searchValue', filter.searchValue);
    if (filter.type) params = params.set('type', filter.type);
    params = params.set('includeDisabled', includeDisabled.toString());

    return this.http.get<PaginatedList<UnitOfMeasure>>(this.apiUrl, { params });
  }

  getUnitOfMeasureById(id: number): Observable<UnitOfMeasure> {
    return this.http.get<UnitOfMeasure>(`${this.apiUrl}/${id}`);
  }

  getNextCode(): Observable<NextCodeResponse> {
    return this.http.get<NextCodeResponse>(`${this.apiUrl}/next-code`);
  }

  addUnitOfMeasure(request: UnitOfMeasureRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  updateUnitOfMeasure(id: number, request: UnitOfMeasureRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  toggleUnitOfMeasureStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  checkBaseUnitExistsAsync(type: UomType, excludeId?: number): Observable<boolean> {
    let params = new HttpParams();
    if (excludeId) params = params.set('excludeId', excludeId.toString());
    return this.http.get<boolean>(`${this.apiUrl}/check-base-unit/${type}`, { params });
  }

  getBaseUnit(type: UomType, excludeId?: number): Observable<UnitOfMeasure | null> {
    let params = new HttpParams();
    if (excludeId) params = params.set('excludeId', excludeId.toString());
    return this.http.get<UnitOfMeasure | null>(`${this.apiUrl}/base-unit/${type}`, { params });
  }
}
