import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopPartnerResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-top-partners',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
      <!-- Card Header & Tab Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
              {{ 'dashboard.topPartners' | translate }}
            </h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ 'dashboard.topPartnersSub' | translate }}
            </p>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg self-start sm:self-auto">
          <button (click)="activeTab = 'customers'"
                  [class]="activeTab === 'customers' ? 'bg-white dark:bg-gray-700 text-brand-500 shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                  class="px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200">
            {{ 'dashboard.activeCustomers' | translate }}
          </button>
          <button (click)="activeTab = 'suppliers'"
                  [class]="activeTab === 'suppliers' ? 'bg-white dark:bg-gray-700 text-brand-500 shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                  class="px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200">
            {{ 'dashboard.activeSuppliers' | translate }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let item of [1,2,3,4]" class="animate-pulse flex items-center justify-between">
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div class="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Customers Tab -->
      <div *ngIf="!loading && activeTab === 'customers'">
        <div *ngIf="customers.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
          {{ 'dashboard.noCustomerData' | translate }}
        </div>

        <div *ngIf="customers.length > 0" class="space-y-2">
          <div *ngFor="let customer of customers; let i = index" class="p-2.5 rounded-lg bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-extrabold flex items-center justify-center text-xs">
                {{ getInitials(customer.partnerName) }}
              </div>
              <div>
                <span class="font-bold text-gray-900 dark:text-white text-xs block">{{ customer.partnerName }}</span>
                <span class="text-[11px] text-gray-400 font-mono">#{{ customer.partnerCode }} • {{ customer.phone || ('dashboard.noPhone' | translate) }}</span>
              </div>
            </div>

            <div class="text-left">
              <span class="text-xs font-black text-gray-900 dark:text-white block">
                {{ customer.totalAmount | number:'1.0-2' }} EGP
              </span>
              <span class="text-[11px] font-semibold text-blue-500">
                {{ customer.totalInvoices }} {{ 'dashboard.salesInvoicesCount' | translate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Suppliers Tab -->
      <div *ngIf="!loading && activeTab === 'suppliers'">
        <div *ngIf="suppliers.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">
          {{ 'dashboard.noSupplierData' | translate }}
        </div>

        <div *ngIf="suppliers.length > 0" class="space-y-2">
          <div *ngFor="let supplier of suppliers; let i = index" class="p-2.5 rounded-lg bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                {{ getInitials(supplier.partnerName) }}
              </div>
              <div>
                <span class="font-bold text-gray-900 dark:text-white text-xs block">{{ supplier.partnerName }}</span>
                <span class="text-[11px] text-gray-400 font-mono">#{{ supplier.partnerCode }} • {{ supplier.phone || ('dashboard.noPhone' | translate) }}</span>
              </div>
            </div>

            <div class="text-left">
              <span class="text-xs font-black text-gray-900 dark:text-white block">
                {{ supplier.totalAmount | number:'1.0-2' }} EGP
              </span>
              <span class="text-[11px] font-semibold text-emerald-500">
                {{ supplier.totalInvoices }} {{ 'dashboard.purchaseOrdersCount' | translate }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopPartnersComponent {
  @Input() customers: TopPartnerResponse[] = [];
  @Input() suppliers: TopPartnerResponse[] = [];
  @Input() loading: boolean = false;

  activeTab: 'customers' | 'suppliers' = 'customers';

  getInitials(name: string): string {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
