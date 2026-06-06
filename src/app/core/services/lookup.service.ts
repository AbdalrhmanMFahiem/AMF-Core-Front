import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LookupsFilters, IdNameResponse, IntIdCodeNameResponse } from '../models/lookup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/lookups`;

  private getOptions(filters?: LookupsFilters) {
    let params = new HttpParams();
    if (filters) {
      if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }
    return { params };
  }

  getUnitOfMeasures(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/unit-of-measures`, this.getOptions(filters));
  }

  getWarehouses(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/warehouses`, this.getOptions(filters));
  }

  getVendors(filters?: LookupsFilters): Observable<IntIdCodeNameResponse[]> {
    return this.http.get<IntIdCodeNameResponse[]>(`${this.apiUrl}/business-partner-vendors`, this.getOptions(filters));
  }

  getItemGroups(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/item-groups`, this.getOptions(filters));
  }

  getItemProperties(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/item-properties`, this.getOptions(filters));
  }

  getPageSizes(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/page-sizes`);
  }
}
