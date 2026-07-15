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

export interface WarehouseItemsStockResponse {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  uomName: string;
  onHandQty: number;
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

  getWarehouseItemsStockReport(filters: any): Observable<Result<PaginatedList<WarehouseItemsStockResponse>>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        // If it's an array (like warehouseIds), we can append multiple times or rely on default serialization
        if (Array.isArray(filters[key])) {
          filters[key].forEach((val: any) => {
            params = params.append(key, val);
          });
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get<Result<PaginatedList<WarehouseItemsStockResponse>>>(`${this.baseUrl}/warehouse-items-stock`, { params });
  }

  exportWarehouseItemsStockExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((val: any) => {
            params = params.append(key, val);
          });
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get(`${this.baseUrl}/warehouse-items-stock/export-excel`, { params, responseType: 'blob' });
  }

  exportWarehouseItemsStockPdf(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach((val: any) => {
            params = params.append(key, val);
          });
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get(`${this.baseUrl}/warehouse-items-stock/export-pdf`, { params, responseType: 'blob' });
  }

  exportStatementExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/business-partners/statement/export-excel`, { params, responseType: 'blob' });
  }

  exportStatementPdf(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/business-partners/statement/export-pdf`, { params, responseType: 'blob' });
  }
}
