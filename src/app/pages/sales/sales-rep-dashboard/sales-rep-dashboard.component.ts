import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesRepService } from '../../../core/services/sales-rep.service';

@Component({
  selector: 'app-sales-rep-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sales-rep-dashboard.component.html',
  styleUrls: ['./sales-rep-dashboard.component.css']
})
export class SalesRepDashboardComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  public translate = inject(TranslateService);

  loading: boolean = true;
  dashboard: any = {
    todayInvoicesCount: 0,
    todayRevenue: 0,
    todayAverageInvoiceValue: 0,
    weekInvoicesCount: 0,
    weekRevenue: 0,
    totalCustomers: 0,
    customersServedThisWeek: 0,
    overdueInvoicesCount: 0,
    overdueAmount: 0,
    recentInvoices: [],
    last7DaysSales: []
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.salesRepService.getMyDashboard().subscribe({
      next: (res: any) => {
        this.dashboard = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getMaxDailyRevenue(): number {
    if (!this.dashboard.last7DaysSales || this.dashboard.last7DaysSales.length === 0) return 1;
    const max = Math.max(...this.dashboard.last7DaysSales.map((d: any) => d.revenue));
    return max > 0 ? max : 1;
  }
}
