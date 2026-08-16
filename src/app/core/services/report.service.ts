import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { PaginatedList } from '../models/pagination.model';

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

  getSalesReport(filters: any): Observable<PaginatedList<InvoiceReportResponse>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<InvoiceReportResponse>>(`${this.baseUrl}/sales`, { params });
  }

  getPurchasesReport(filters: any): Observable<PaginatedList<InvoiceReportResponse>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<InvoiceReportResponse>>(`${this.baseUrl}/purchases`, { params });
  }

  getInventoryValuationReport(filters: any): Observable<PaginatedList<InventoryValuationResponse>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<InventoryValuationResponse>>(`${this.baseUrl}/inventory-valuation`, { params });
  }

  getWarehouseItemsStockReport(filters: any): Observable<PaginatedList<WarehouseItemsStockResponse>> {
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

    return this.http.get<PaginatedList<WarehouseItemsStockResponse>>(`${this.baseUrl}/warehouse-items-stock`, { params });
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

  getProfitabilityReport(filters: any): Observable<PaginatedList<any>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<any>>(`${this.baseUrl}/profitability`, { params });
  }

  exportProfitabilityExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/profitability/export-excel`, { params, responseType: 'blob' });
  }

  getItemProfitabilitySummaryReport(filters: any): Observable<PaginatedList<any>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<any>>(`${this.baseUrl}/item-profitability-summary`, { params });
  }

  exportItemProfitabilitySummaryExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/item-profitability-summary/export-excel`, { params, responseType: 'blob' });
  }

  getUnpricedItemsReport(filters: any): Observable<PaginatedList<any>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<PaginatedList<any>>(`${this.baseUrl}/unpriced-items`, { params });
  }

  exportUnpricedItemsExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/unpriced-items/export-excel`, { params, responseType: 'blob' });
  }

  updateItemInitialCost(data: { itemId: number; initialPrice: number }): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${this.baseUrl}/unpriced-items/update-initial-cost`, data);
  }

  getSalesRepReport(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.baseUrl}/sales-rep`, { params });
  }

  exportSalesRepReportExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/sales-rep/export-excel`, { params, responseType: 'blob' });
  }
}
