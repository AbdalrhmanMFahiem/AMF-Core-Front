import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LookupsFilters, IdNameResponse, IntIdCodeNameResponse, InvoiceCostElementDropdown, ItemLookupResponse } from '../models/lookup.model';
import { PaginatedList } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/lookups`;
  private invCostElementsApiUrl = `${environment.apiUrl}/api/md/invoice-cost-elements`;

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

  getCustomers(filters?: LookupsFilters): Observable<IntIdCodeNameResponse[]> {
    return this.http.get<IntIdCodeNameResponse[]>(`${this.apiUrl}/business-partner-customers`, this.getOptions(filters));
  }


  getItemGroups(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/item-groups`, this.getOptions(filters));
  }

  getItemProperties(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/item-properties`, this.getOptions(filters));
  }

  private cachedPageSizes: number[] | null = null;

  getPageSizes(): Observable<number[]> {
    if (this.cachedPageSizes) {
      return of(this.cachedPageSizes);
    }
    return this.http.get<number[]>(`${this.apiUrl}/page-sizes`).pipe(
      tap(sizes => this.cachedPageSizes = sizes)
    );
  }

  getInvoiceCostElementsSalesDropdown(filters?: LookupsFilters): Observable<InvoiceCostElementDropdown[]> {
    return this.http.get<InvoiceCostElementDropdown[]>(`${this.invCostElementsApiUrl}/sales-dropdown`, this.getOptions(filters));
  }

  getInvoiceCostElementsPurchaseDropdown(filters?: LookupsFilters): Observable<InvoiceCostElementDropdown[]> {
    return this.http.get<InvoiceCostElementDropdown[]>(`${this.invCostElementsApiUrl}/purchase-dropdown`, this.getOptions(filters));
  }

  getSalesInvoicesLookup(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    // Note: The controller defines this under api/sales/invoices/lookup
    return this.http.get<IdNameResponse[]>(`${environment.apiUrl}/api/sales/invoices/lookup`, this.getOptions(filters));
  }

  getSalesItemsLookup(filters?: LookupsFilters): Observable<PaginatedList<ItemLookupResponse>> {
    return this.http.get<PaginatedList<ItemLookupResponse>>(`${environment.apiUrl}/api/inventory/lookups/sales-items`, this.getOptions(filters));
  }
}
