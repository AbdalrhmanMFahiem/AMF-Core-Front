import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/dashboard`;

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
}
