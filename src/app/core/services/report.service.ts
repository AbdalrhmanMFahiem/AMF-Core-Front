import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Result<T> {
  succeeded: boolean;
  data: T;
  messages: string[];
}

export interface InvoiceReportResponse {
  id: number;
  code: string;
  businessPartnerName: string;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

export interface InventoryValuationResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  warehouseId: number;
  warehouseName: string;
  onHandQty: number;
  unitCost: number;
  totalValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/reports`;

  getSalesReport(filters: any): Observable<Result<PaginatedList<InvoiceReportResponse>>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<Result<PaginatedList<InvoiceReportResponse>>>(`${this.baseUrl}/sales`, { params });
  }

  getPurchasesReport(filters: any): Observable<Result<PaginatedList<InvoiceReportResponse>>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<Result<PaginatedList<InvoiceReportResponse>>>(`${this.baseUrl}/purchases`, { params });
  }

  getInventoryValuationReport(filters: any): Observable<Result<PaginatedList<InventoryValuationResponse>>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<Result<PaginatedList<InventoryValuationResponse>>>(`${this.baseUrl}/inventory-valuation`, { params });
  }
}
