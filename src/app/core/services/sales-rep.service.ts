import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { SalesRepResponse, SalesRepCustomerResponse, SalesRepWarehouseResponse, QuickSaleItemResponse } from '../models/sales-rep.model';
import { InvoiceBasicResponse, InvoiceFilters } from '../models/invoice.model';
import { PaginatedList } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class SalesRepService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/sales-reps`; }

  private getOptions(filters?: InvoiceFilters) {
    let params = new HttpParams();
    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
      if (filters.searchValue) params = params.set('searchValue', filters.searchValue);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.businessPartnerId) params = params.set('businessPartnerId', filters.businessPartnerId.toString());
      if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId.toString());
      if (filters.salesRepUserId) params = params.set('salesRepUserId', filters.salesRepUserId);
      if (filters.invoiceDateFrom) params = params.set('invoiceDateFrom', filters.invoiceDateFrom);
      if (filters.invoiceDateTo) params = params.set('invoiceDateTo', filters.invoiceDateTo);
      if (filters.dueDateFrom) params = params.set('dueDateFrom', filters.dueDateFrom);
      if (filters.dueDateTo) params = params.set('dueDateTo', filters.dueDateTo);
    }
    return { params };
  }

  getAll(): Observable<SalesRepResponse[]> {
    return this.http.get<SalesRepResponse[]>(this.apiUrl);
  }

  getCustomersByRepId(userId: string): Observable<SalesRepCustomerResponse[]> {
    return this.http.get<SalesRepCustomerResponse[]>(`${this.apiUrl}/${userId}/customers`);
  }

  getWarehousesByRepId(userId: string): Observable<SalesRepWarehouseResponse[]> {
    return this.http.get<SalesRepWarehouseResponse[]>(`${this.apiUrl}/${userId}/warehouses`);
  }

  getMyCustomers(): Observable<SalesRepCustomerResponse[]> {
    return this.http.get<SalesRepCustomerResponse[]>(`${this.apiUrl}/me/customers`);
  }

  getMyWarehouses(): Observable<SalesRepWarehouseResponse[]> {
    return this.http.get<SalesRepWarehouseResponse[]>(`${this.apiUrl}/me/warehouses`);
  }

  getQuickSaleItemsByWarehouse(warehouseId: number): Observable<QuickSaleItemResponse[]> {
    return this.http.get<QuickSaleItemResponse[]>(`${this.apiUrl}/warehouses/${warehouseId}/items`);
  }

  quickSale(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/me/quick-sale`, data);
  }

  getMyInvoices(filters?: InvoiceFilters): Observable<PaginatedList<InvoiceBasicResponse>> {
    return this.http.get<PaginatedList<InvoiceBasicResponse>>(`${this.apiUrl}/me/invoices`, this.getOptions(filters));
  }

  getMyDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/dashboard`);
  }

  getInsights(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/insights`);
  }
}
