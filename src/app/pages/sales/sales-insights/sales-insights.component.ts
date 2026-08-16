import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesRepService } from '../../../core/services/sales-rep.service';

@Component({
  selector: 'app-sales-insights',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sales-insights.component.html',
  styleUrls: ['./sales-insights.component.css']
})
export class SalesInsightsComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  public translate = inject(TranslateService);

  loading: boolean = true;
  insights: any = {
    inactiveToday: [],
    topPerformers: [],
    comparisons: [],
    lowStockAlerts: []
  };

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.loading = true;
    this.salesRepService.getInsights().subscribe({
      next: (res: any) => {
        this.insights = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
