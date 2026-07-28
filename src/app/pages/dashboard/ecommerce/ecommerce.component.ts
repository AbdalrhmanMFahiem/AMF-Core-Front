import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { SectionHeaderComponent } from '../../../shared/components/ecommerce/section-header/section-header.component';
import { QuickActionsComponent } from '../../../shared/components/ecommerce/quick-actions/quick-actions.component';
import { TopStockItemsComponent } from '../../../shared/components/ecommerce/top-stock-items/top-stock-items.component';
import { TopPurchasedItemsComponent } from '../../../shared/components/ecommerce/top-purchased-items/top-purchased-items.component';
import { TopSoldItemsComponent } from '../../../shared/components/ecommerce/top-sold-items/top-sold-items.component';
import { TopPartnersComponent } from '../../../shared/components/ecommerce/top-partners/top-partners.component';
import {
  DashboardService,
  DashboardMetricsResponse,
  SalesPurchasesChartResponse,
  RecentTransactionResponse,
  TopStockItemResponse,
  TopPurchasedItemResponse,
  TopSoldItemResponse,
  TopPartnerResponse
} from '../../../core/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';

export type DashboardSection = 'all' | 'sales' | 'purchases' | 'inventory';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    RecentOrdersComponent,
    SectionHeaderComponent,
    QuickActionsComponent,
    TopStockItemsComponent,
    TopPurchasedItemsComponent,
    TopSoldItemsComponent,
    TopPartnersComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();

  // Active section filter
  activeSection: DashboardSection = 'all';

  // Data Holders
  metrics: DashboardMetricsResponse | null = null;
  chartData: SalesPurchasesChartResponse | null = null;
  recentTransactions: RecentTransactionResponse[] = [];
  topStockItems: TopStockItemResponse[] = [];
  topPurchasedItems: TopPurchasedItemResponse[] = [];
  topSoldItems: TopSoldItemResponse[] = [];
  topCustomers: TopPartnerResponse[] = [];
  topSuppliers: TopPartnerResponse[] = [];

  // Loading States
  loadingMetrics = true;
  loadingChart = true;
  loadingTransactions = true;
  loadingStock = true;
  loadingPurchased = true;
  loadingSold = true;
  loadingPartners = true;

  ngOnInit() {
    this.loadMetrics();
    this.loadChartData();
    this.loadRecentTransactions();
    this.loadTopStockItems();
    this.loadTopPurchasedItems();
    this.loadTopSoldItems();
    this.loadTopPartners();
  }

  setSection(section: DashboardSection) {
    this.activeSection = section;
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
    this.dashboardService.getRecentTransactions(6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.recentTransactions = data;
          this.loadingTransactions = false;
        },
        error: () => this.loadingTransactions = false
      });
  }

  loadTopStockItems() {
    this.dashboardService.getTopStockItems(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topStockItems = data;
          this.loadingStock = false;
        },
        error: () => this.loadingStock = false
      });
  }

  loadTopPurchasedItems() {
    this.dashboardService.getTopPurchasedItems(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topPurchasedItems = data;
          this.loadingPurchased = false;
        },
        error: () => this.loadingPurchased = false
      });
  }

  loadTopSoldItems() {
    this.dashboardService.getTopSoldItems(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topSoldItems = data;
          this.loadingSold = false;
        },
        error: () => this.loadingSold = false
      });
  }

  loadTopPartners() {
    this.dashboardService.getTopCustomers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topCustomers = data;
          this.checkPartnersLoading();
        },
        error: () => this.checkPartnersLoading()
      });

    this.dashboardService.getTopSuppliers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topSuppliers = data;
          this.checkPartnersLoading();
        },
        error: () => this.checkPartnersLoading()
      });
  }

  private checkPartnersLoading() {
    this.loadingPartners = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
