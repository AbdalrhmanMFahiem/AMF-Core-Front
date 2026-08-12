import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { IdNameResponse } from '../models/lookup.model';
import { ResourceRequest, ResourceResponse, ResourceBasicResponse, ResourceFilters } from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Resources`;

  getAll(filters: ResourceFilters, includeDisabled: boolean = false): Observable<PaginatedList<ResourceBasicResponse>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString())
      .set('includeDisabled', includeDisabled.toString());

    if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
    if (filters.sortColumn) params = params.set('sortColumn', filters.sortColumn);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);
    if (filters.resourceType) params = params.set('resourceType', filters.resourceType.toString());
    if (filters.rateUomType) params = params.set('rateUomType', filters.rateUomType.toString());

    return this.http.get<PaginatedList<ResourceBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<ResourceResponse> {
    return this.http.get<ResourceResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: ResourceRequest): Observable<ResourceResponse> {
    return this.http.post<ResourceResponse>(this.apiUrl, data);
  }

  update(id: number, data: ResourceRequest): Observable<void> {
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
