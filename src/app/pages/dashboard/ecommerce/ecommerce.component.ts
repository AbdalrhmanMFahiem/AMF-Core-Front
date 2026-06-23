import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { StatisticsChartComponent } from '../../../shared/components/ecommerce/statics-chart/statics-chart.component';
import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { DashboardService, DashboardMetricsResponse, SalesPurchasesChartResponse, RecentTransactionResponse } from '../../../core/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    CommonModule,
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    MonthlyTargetComponent,
    StatisticsChartComponent,
    DemographicCardComponent,
    RecentOrdersComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();

  metrics: DashboardMetricsResponse | null = null;
  chartData: SalesPurchasesChartResponse | null = null;
  recentTransactions: RecentTransactionResponse[] = [];
  
  loadingMetrics = true;
  loadingChart = true;
  loadingTransactions = true;

  ngOnInit() {
    this.loadMetrics();
    this.loadChartData();
    this.loadRecentTransactions();
  }

  loadMetrics() {
    this.dashboardService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.loadingMetrics = false;
        },
        error: () => this.loadingMetrics = false
      });
  }

  loadChartData() {
    const currentYear = new Date().getFullYear();
    this.dashboardService.getSalesPurchasesChart(currentYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chartData = data;
          this.loadingChart = false;
        },
        error: () => this.loadingChart = false
      });
  }

  loadRecentTransactions() {
    this.dashboardService.getRecentTransactions(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.recentTransactions = data;
          this.loadingTransactions = false;
        },
        error: () => this.loadingTransactions = false
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
