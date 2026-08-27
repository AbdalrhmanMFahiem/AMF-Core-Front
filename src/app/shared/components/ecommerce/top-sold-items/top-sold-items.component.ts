import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopSoldItemResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-top-sold-items',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
      <div class="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
              {{ 'dashboard.topSoldItems' | translate }}
            </h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ 'dashboard.topSoldItemsSub' | translate }}
            </p>
          </div>
        </div>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
          {{ 'dashboard.quantitiesOnly' | translate }}
        </span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let item of [1,2,3,4]" class="animate-pulse flex items-center justify-between">
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
        {{ 'dashboard.noSalesData' | translate }}
      </div>

      <!-- Items List -->
      <div *ngIf="!loading && items.length > 0" class="space-y-2">
        <div *ngFor="let item of items; let i = index" class="p-2.5 rounded-lg bg-linear-to-r from-blue-500/5 to-transparent border border-blue-500/10 dark:border-blue-500/20">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center bg-blue-500 text-white shadow-xs">
                #{{ i + 1 }}
              </span>
              <div>
                <span class="font-bold text-gray-900 dark:text-white text-xs block">{{ item.itemName }}</span>
                <span class="text-[11px] text-gray-400 font-mono">{{ item.itemCode }}</span>
              </div>
            </div>

            <!-- Volume Quantity Only (NO Price) -->
            <div class="text-left">
              <span class="text-sm font-black text-blue-600 dark:text-blue-400">
                {{ item.soldQuantity | number:'1.0-2' }}
              </span>
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">
                {{ item.unitName }}
              </span>
            </div>
          </div>

          <!-- Volume Ratio Progress -->
          <div class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div class="bg-blue-500 h-full rounded-full transition-all duration-500"
                 [style.width.%]="getSoldPercentage(item.soldQuantity)">
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopSoldItemsComponent {
  @Input() items: TopSoldItemResponse[] = [];
  @Input() loading: boolean = false;

  getSoldPercentage(qty: number): number {
    if (!this.items || this.items.length === 0) return 0;
    const max = Math.max(...this.items.map(i => i.soldQuantity));
    if (max === 0) return 0;
    return Math.min(100, Math.max(10, (qty / max) * 100));
  }
}
