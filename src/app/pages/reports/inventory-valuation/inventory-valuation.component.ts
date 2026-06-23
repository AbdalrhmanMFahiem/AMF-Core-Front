import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportService, InventoryValuationResponse } from '../../../core/services/report.service';

@Component({
  selector: 'app-inventory-valuation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          {{ 'dashboard.inventoryValuation' | translate }}
        </h3>
        
        <div class="flex items-center gap-3">
          <input type="text" [(ngModel)]="filters.searchValue" class="form-input" placeholder="Search item...">
          <button (click)="loadReport()" class="btn-primary px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600">
            {{ 'common.filter' | translate }}
          </button>
        </div>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full text-left">
          <thead class="border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'item.code' | translate }}</th>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'item.name' | translate }}</th>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'warehouse.name' | translate }}</th>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'item.onHandQty' | translate }}</th>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'item.unitCost' | translate }}</th>
              <th class="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ 'item.totalValue' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            @for (row of data; track row.itemId + '-' + row.warehouseId) {
            <tr>
              <td class="py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">{{ row.itemCode }}</td>
              <td class="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{{ row.itemName }}</td>
              <td class="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{{ row.warehouseName }}</td>
              <td class="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{{ row.onHandQty | number:'1.2-2' }}</td>
              <td class="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{{ row.unitCost | number:'1.2-2' }}</td>
              <td class="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{{ row.totalValue | number:'1.2-2' }}</td>
            </tr>
            }
            @if (data.length === 0 && !loading) {
            <tr>
              <td colspan="6" class="py-6 text-center text-gray-500 dark:text-gray-400">
                {{ 'common.noData' | translate }}
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      
      <div class="mt-4 flex justify-between items-center" *ngIf="totalPages > 1">
        <button [disabled]="!hasPreviousPage" (click)="changePage(filters.pageNumber - 1)" class="btn-outline px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">Previous</button>
        <span class="text-sm text-gray-500">Page {{filters.pageNumber}} of {{totalPages}}</span>
        <button [disabled]="!hasNextPage" (click)="changePage(filters.pageNumber + 1)" class="btn-outline px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">Next</button>
      </div>
    </div>
  `
})
export class InventoryValuationComponent implements OnInit {
  private reportService = inject(ReportService);
  
  data: InventoryValuationResponse[] = [];
  loading = false;
  
  filters: any = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: ''
  };
  
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.reportService.getInventoryValuationReport(this.filters).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.data = res.data.items;
          this.totalPages = res.data.totalPages;
          this.hasPreviousPage = res.data.hasPreviousPage;
          this.hasNextPage = res.data.hasNextPage;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  changePage(page: number) {
    this.filters.pageNumber = page;
    this.loadReport();
  }
}
