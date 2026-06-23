import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { RecentTransactionResponse } from '../../../../core/services/dashboard.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [
    CommonModule,
    BadgeComponent,
    TranslateModule
  ],
  templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {
  @Input() transactions: RecentTransactionResponse[] = [];

  getBadgeColor(status: string): 'success' | 'warning' | 'error' | 'light' {
    const s = status.toLowerCase();
    if (s.includes('paid')) return 'success';
    if (s.includes('confirmed')) return 'success';
    if (s.includes('draft') || s.includes('pending')) return 'warning';
    if (s.includes('cancelled')) return 'error';
    return 'light';
  }

  getInvoiceTypeTranslation(type: string): string {
    return `invoice.type.${type}`;
  }

  getStatusTranslation(status: string): string {
    return `invoice.status.${status}`;
  }
}