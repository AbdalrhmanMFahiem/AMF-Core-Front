import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedList } from '../models/pagination.model';
import { RequestFilters } from '../models/pagination.model';
import { IdNameResponse } from '../models/lookup.model';
import { LocationRequest, LocationResponse, LocationBasicResponse } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Locations`;

  getAll(filters: RequestFilters, includeDisabled: boolean = false): Observable<PaginatedList<LocationBasicResponse>> {
    let params: any = { ...filters, includeDisabled };
    return this.http.get<PaginatedList<LocationBasicResponse>>(this.apiUrl, { params });
  }

  get(id: number): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.apiUrl}/${id}`);
  }

  add(data: LocationRequest): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(this.apiUrl, data);
  }

  update(id: number, data: LocationRequest): Observable<void> {
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
