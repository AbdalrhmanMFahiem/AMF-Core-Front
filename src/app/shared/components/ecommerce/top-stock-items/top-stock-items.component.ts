import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopStockItemResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-top-stock-items',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
      <div class="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-lg bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
              {{ 'dashboard.topStockItems' | translate }}
            </h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ 'dashboard.topStockItemsSub' | translate }}
            </p>
          </div>
        </div>
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
          {{ 'dashboard.stockImpact' | translate }}
        </span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let item of [1,2,3,4,5]" class="animate-pulse flex items-center justify-between">
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
        {{ 'dashboard.noStockData' | translate }}
      </div>

      <!-- Items List -->
      <div *ngIf="!loading && items.length > 0" class="space-y-2">
        <div *ngFor="let item of items; let i = index" class="group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
          <div class="flex items-center justify-between text-xs mb-1">
            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                {{ i + 1 }}
              </span>
              <div>
                <span class="font-semibold text-gray-900 dark:text-white block">{{ item.itemName }}</span>
                <span class="text-[11px] text-gray-400 font-mono">#{{ item.itemCode }}</span>
              </div>
            </div>

            <div class="text-left">
              <span class="text-xs font-bold text-purple-600 dark:text-purple-400">
                {{ item.totalStockQuantity | number:'1.0-2' }} {{ item.unitName }}
              </span>
              <span class="text-[11px] text-gray-400 block">
                {{ 'dashboard.inWarehouses' | translate:{ count: item.warehousesCount } }}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div class="bg-linear-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                 [style.width.%]="getMaxPercentage(item.totalStockQuantity)">
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopStockItemsComponent {
  @Input() items: TopStockItemResponse[] = [];
  @Input() loading: boolean = false;

  getMaxPercentage(qty: number): number {
    if (!this.items || this.items.length === 0) return 0;
    const max = Math.max(...this.items.map(i => i.totalStockQuantity));
    if (max === 0) return 0;
    return Math.min(100, Math.max(8, (qty / max) * 100));
  }
}
