import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

export interface DashboardMetricsResponse {
  totalSalesThisMonth: number;
  salesDifferenceFromLastMonth: number;
  totalPurchasesThisMonth: number;
  purchasesDifferenceFromLastMonth: number;
  activeReturnsCount: number;
  lowStockItemsCount: number;
}

export interface SalesPurchasesChartResponse {
  labels: string[];
  salesData: number[];
  purchasesData: number[];
}

export interface RecentTransactionResponse {
  id: number;
  code: string;
  type: string;
  totalAmount: number;
  date: string;
  status: string;
}

export interface TopStockItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  totalStockQuantity: number;
  unitName: string;
  warehousesCount: number;
}

export interface TopPurchasedItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  purchasedQuantity: number;
  totalPurchaseAmount: number;
  unitName: string;
}

export interface TopSoldItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  soldQuantity: number;
  unitName: string;
}

export interface TopPartnerResponse {
  partnerId: number;
  partnerCode: string;
  partnerName: string;
  totalInvoices: number;
  totalAmount: number;
  phone: string;
  isCustomer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private get apiUrl() { return `${this.config.apiUrl}/api/v1/dashboard`; }

  getMetrics(): Observable<DashboardMetricsResponse> {
    return this.http.get<DashboardMetricsResponse>(`${this.apiUrl}/metrics`);
  }

  getSalesPurchasesChart(year: number, month?: number): Observable<SalesPurchasesChartResponse> {
    let params = new HttpParams().set('year', year.toString());
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<SalesPurchasesChartResponse>(`${this.apiUrl}/sales-purchases-chart`, { params });
  }

  getRecentTransactions(count: number = 5): Observable<RecentTransactionResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<RecentTransactionResponse[]>(`${this.apiUrl}/recent-transactions`, { params });
  }

  getTopStockItems(count: number = 10): Observable<TopStockItemResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<TopStockItemResponse[]>(`${this.apiUrl}/top-stock-items`, { params });
  }

  getTopPurchasedItems(count: number = 5): Observable<TopPurchasedItemResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<TopPurchasedItemResponse[]>(`${this.apiUrl}/top-purchased-items`, { params });
  }

  getTopSoldItems(count: number = 5): Observable<TopSoldItemResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<TopSoldItemResponse[]>(`${this.apiUrl}/top-sold-items`, { params });
  }

  getTopCustomers(count: number = 5): Observable<TopPartnerResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<TopPartnerResponse[]>(`${this.apiUrl}/top-customers`, { params });
  }

  getTopSuppliers(count: number = 5): Observable<TopPartnerResponse[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<TopPartnerResponse[]>(`${this.apiUrl}/top-suppliers`, { params });
  }
}

