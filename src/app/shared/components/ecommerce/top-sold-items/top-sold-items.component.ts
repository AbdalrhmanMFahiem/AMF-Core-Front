import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopSoldItemResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-top-sold-items',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              {{ 'dashboard.topSoldItems' | translate }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ 'dashboard.topSoldItemsSub' | translate }}
            </p>
          </div>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
          {{ 'dashboard.quantitiesOnly' | translate }}
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
        {{ 'dashboard.noSalesData' | translate }}
      </div>

      <!-- Items List -->
      <div *ngIf="!loading && items.length > 0" class="space-y-3.5">
        <div *ngFor="let item of items; let i = index" class="p-3 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 dark:border-blue-500/20">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center bg-blue-500 text-white shadow-sm shadow-blue-500/30">
                #{{ i + 1 }}
              </span>
              <div>
                <span class="font-bold text-gray-900 dark:text-white text-sm block">{{ item.itemName }}</span>
                <span class="text-xs text-gray-400 font-mono">{{ item.itemCode }}</span>
              </div>
            </div>

            <!-- Volume Quantity Only (NO Price) -->
            <div class="text-left">
              <span class="text-base font-black text-blue-600 dark:text-blue-400">
                {{ item.soldQuantity | number:'1.0-2' }}
              </span>
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                {{ item.unitName }}
              </span>
            </div>
          </div>

          <!-- Volume Ratio Progress -->
          <div class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
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
