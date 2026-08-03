import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      <a routerLink="/invoices/sales/add" class="group p-4 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 rounded-2xl hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
            {{ 'dashboard.quickActions.salesInvoice' | translate }}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ 'dashboard.quickActions.newSalesInvoice' | translate }}
          </p>
        </div>
      </a>

      <a routerLink="/purchases/invoices/add" class="group p-4 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            {{ 'dashboard.quickActions.purchaseInvoice' | translate }}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ 'dashboard.quickActions.newPurchaseInvoice' | translate }}
          </p>
        </div>
      </a>

      <a routerLink="/inventory/items/add" class="group p-4 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 rounded-2xl hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 flex flex-col items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
            {{ 'dashboard.quickActions.addItem' | translate }}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ 'dashboard.quickActions.newItem' | translate }}
          </p>
        </div>
      </a>

      <a routerLink="/inventory/stock-transfers/add" class="group p-4 bg-linear-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 dark:border-purple-500/30 rounded-2xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 flex flex-col items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
            {{ 'dashboard.quickActions.stockTransfer' | translate }}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ 'dashboard.quickActions.newStockTransfer' | translate }}
          </p>
        </div>
      </a>
    </div>
  `
})
export class QuickActionsComponent {}
