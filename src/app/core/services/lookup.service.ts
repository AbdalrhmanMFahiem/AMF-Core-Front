import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LookupsFilters, IdNameResponse, IntIdCodeNameResponse, InvoiceCostElementDropdown, ItemLookupResponse, ItemLookupsFilters, StringIdNameResponse, StringIdCodeNameResponse } from '../models/lookup.model';
import { UnitOfMeasureBasicResponse, UomType } from '../models/uom.model';
import { PaginatedList } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/lookups`;
  private invCostElementsApiUrl = `${environment.apiUrl}/api/md/invoice-cost-elements`;

  private getOptions(filters?: LookupsFilters | ItemLookupsFilters) {
    let params = new HttpParams();
    if (filters) {
      if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());

      // Additional properties from ItemLookupsFilters
      const itemFilters = filters as ItemLookupsFilters;
      if (itemFilters.warehouseId) params = params.set('warehouseId', itemFilters.warehouseId.toString());
      if (itemFilters.usageType !== undefined) params = params.set('usageType', itemFilters.usageType.toString());
      if (itemFilters.checkWarehouseExistence !== undefined) params = params.set('checkWarehouseExistence', itemFilters.checkWarehouseExistence.toString());
    }
    return { params };
  }

  getUnitOfMeasures(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/unit-of-measures`, this.getOptions(filters));
  }

  getUnitOfMeasureByType(uomType: UomType | string): Observable<UnitOfMeasureBasicResponse[]> {
    let params = new HttpParams();
    if (uomType) params = params.set('uomType', uomType.toString());
    return this.http.get<UnitOfMeasureBasicResponse[]>(`${this.apiUrl}/unit-of-measure-by-type`, { params });
  }

  getWarehouses(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/warehouses`, this.getOptions(filters));
  }

  getWarehousesByBranches(branchIds: number[]): Observable<IdNameResponse[]> {
    if (!branchIds || branchIds.length === 0) return of([]);
    let params = new HttpParams();
    branchIds.forEach(id => {
      params = params.append('branchIds', id.toString());
    });
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/warehouses-by-branches`, { params });
  }

  getVendors(filters?: LookupsFilters): Observable<IntIdCodeNameResponse[]> {
    return this.http.get<IntIdCodeNameResponse[]>(`${this.apiUrl}/business-partner-vendors`, this.getOptions(filters));
  }

  getCustomers(filters?: LookupsFilters): Observable<IntIdCodeNameResponse[]> {
    return this.http.get<IntIdCodeNameResponse[]>(`${this.apiUrl}/business-partner-customers`, this.getOptions(filters));
  }

  getBranches(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/branches`, this.getOptions(filters));
  }

  getCurrencies(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/currencies`, this.getOptions(filters));
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

  getInvoiceCostElementsDropdown(type: string, filters?: LookupsFilters): Observable<InvoiceCostElementDropdown[]> {
    if (!type) {
      throw new Error("InvoiceCostElementType must be provided");
    }
    const options = this.getOptions(filters);
    options.params = options.params.set('type', type);
    return this.http.get<InvoiceCostElementDropdown[]>(`${this.invCostElementsApiUrl}/dropdown`, options);
  }

  getSalesInvoicesLookup(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    // Note: The controller defines this under api/invoices/sales/lookup
    return this.http.get<IdNameResponse[]>(`${environment.apiUrl}/api/invoices/sales/lookup`, this.getOptions(filters));
  }

  getItemsLookup(filters?: ItemLookupsFilters): Observable<PaginatedList<ItemLookupResponse>> {
    return this.http.get<PaginatedList<ItemLookupResponse>>(`${environment.apiUrl}/api/inventory/lookups/items`, this.getOptions(filters));
  }

  getRoles(filters?: LookupsFilters): Observable<StringIdCodeNameResponse[]> {
    return this.http.get<StringIdCodeNameResponse[]>(`${environment.apiUrl}/api/roles/lookups/role`, this.getOptions(filters));
  }

  getUsers(filters?: LookupsFilters): Observable<StringIdNameResponse[]> {
    return this.http.get<StringIdNameResponse[]>(`${environment.apiUrl}/api/users/lookups/users`, this.getOptions(filters));
  }

  getCountries(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/country`, this.getOptions(filters));
  }

  getBanks(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/banks`, this.getOptions(filters));
  }

  getSectors(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/sectors`, this.getOptions(filters));
  }

  getDepartments(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/departments`, this.getOptions(filters));
  }

  getSections(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/sections`, this.getOptions(filters));
  }

  getJobTitles(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/jobtitles`, this.getOptions(filters));
  }

  getLocations(filters?: LookupsFilters): Observable<IdNameResponse[]> {
    return this.http.get<IdNameResponse[]>(`${this.apiUrl}/locations`, this.getOptions(filters));
  }
}
