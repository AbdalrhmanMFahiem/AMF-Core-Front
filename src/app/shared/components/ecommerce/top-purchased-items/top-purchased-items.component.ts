import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopPurchasedItemResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-top-purchased-items',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              {{ 'dashboard.topPurchasedItems' | translate }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ 'dashboard.topPurchasedItemsSub' | translate }}
            </p>
          </div>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
          {{ 'dashboard.purchases' | translate }}
        </span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="space-y-4">
        <div *ngFor="let item of [1,2,3,4]" class="animate-pulse flex items-center justify-between">
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        {{ 'dashboard.noPurchaseData' | translate }}
      </div>

      <!-- Items List -->
      <div *ngIf="!loading && items.length > 0" class="space-y-3.5">
        <div *ngFor="let item of items; let i = index" class="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              #{{ i + 1 }}
            </span>
            <div>
              <span class="font-bold text-gray-900 dark:text-white text-sm block">{{ item.itemName }}</span>
              <span class="text-xs text-gray-400 font-mono">{{ item.itemCode }}</span>
            </div>
          </div>

          <div class="text-left">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {{ item.purchasedQuantity | number:'1.0-2' }} {{ item.unitName }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              {{ item.totalPurchaseAmount | number:'1.0-2' }} EGP
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopPurchasedItemsComponent {
  @Input() items: TopPurchasedItemResponse[] = [];
  @Input() loading: boolean = false;
}
