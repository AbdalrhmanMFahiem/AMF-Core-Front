import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RecentTransactionResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {
  @Input() transactions: RecentTransactionResponse[] = [];

  getTypeBadgeClass(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('purchase')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20';
    }
    if (t.includes('sale') || t.includes('sales')) {
      return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20';
    }
    return 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20';
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('closed') || s.includes('confirmed') || s.includes('paid') || s.includes('approved')) {
      return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30';
    }
    if (s.includes('draft') || s.includes('pending') || s.includes('open')) {
      return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30';
    }
    if (s.includes('cancelled') || s.includes('rejected')) {
      return 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
  }

  getTypeTranslation(type: string): string {
    const t = (type || '').trim();
    if (t === 'Purchase') return 'invoice.type.Purchase';
    if (t === 'Sales' || t === 'Sale') return 'invoice.type.Sales';
    if (t === 'SalesReturn') return 'invoice.type.SalesReturn';
    if (t === 'PurchaseReturn') return 'invoice.type.PurchaseReturn';
    return `invoice.type.${t}`;
  }

  getStatusTranslation(status: string): string {
    const s = (status || '').trim();
    if (s === 'Closed') return 'invoice.status.Closed';
    if (s === 'Confirmed') return 'invoice.status.Confirmed';
    if (s === 'Draft') return 'invoice.status.Draft';
    if (s === 'Open') return 'invoice.status.Open';
    if (s === 'Cancelled') return 'invoice.status.Cancelled';
    return `invoice.status.${s}`;
  }
}