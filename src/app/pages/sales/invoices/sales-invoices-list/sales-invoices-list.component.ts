import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceBasicResponse, InvoiceFilters, InvoiceStatus, InvoiceStatsResponse } from '../../../../core/models/invoice.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CrudListComponent, PageBreadcrumbComponent, PaymentModalComponent, SearchableSelectComponent, DatePickerComponent],
  template: `
    <app-page-breadcrumb [pageTitle]="'salesInvoices.title'" />
    <div class="space-y-6">
      <!-- Stats Loading Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="loadingStats">
        <div *ngFor="let i of [1,2,3,4]" class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div class="flex items-center gap-3 animate-pulse">
            <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div class="flex-1">
              <div class="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-1.5"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="!loadingStats && stats">
        <!-- Total Invoices -->
        <div class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300 group">
          <div class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-brand-500/10 blur-xl group-hover:bg-brand-500/20 transition-all duration-500"></div>
          <div class="relative flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{{ 'invoices.totalInvoices' | translate }}</p>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ stats.totalInvoices | number }}</h3>
            </div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-300 group">
          <div class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div class="relative flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{{ 'invoices.totalRevenue' | translate }}</p>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ stats.totalRevenue | number:'1.2-2' }}</h3>
            </div>
          </div>
        </div>

        <!-- Outstanding -->
        <div class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300 group">
          <div class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
          <div class="relative flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{{ 'invoices.outstanding' | translate }}</p>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ stats.outstanding | number:'1.2-2' }}</h3>
            </div>
          </div>
        </div>

        <!-- Fully Paid -->
        <div class="relative overflow-hidden p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 group">
          <div class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-blue-500/10 blur-xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div class="relative flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{{ 'invoices.fullyPaid' | translate }}</p>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ stats.fullyPaidCount | number }}</h3>
            </div>
          </div>
        </div>
      </div>

      <app-crud-list
        [pageTitle]="'salesInvoices.list'"
        [columns]="columns"
        [data]="data"
        [isLoading]="loading"
        [searchPlaceholder]="'common.searchPlaceholder'"
        addBtnText="salesInvoices.add"
        [filters]="filters"
        [showIncludeDisabledToggle]="false"
        [hideBuiltInSearch]="true"
        [hasAdvancedFilters]="true"
        [hasActiveAdvancedFilters]="hasActiveAdvancedFilters"
        [hideEdit]="true"
        [hideToggleStatus]="isActionHidden"
        [customActions]="customActions"
        (loadData)="loadData()"
        (search)="loadData()"
        (add)="onAdd()"
        (view)="onView($event)"
        (toggleStatus)="onToggleStatus($event)"
        (customAction)="onCustomAction($event)"
        (refresh)="resetFilters()">

        <div custom-filters class="flex-1 w-full flex items-center gap-2">
          <input type="text" [(ngModel)]="filters.searchValue" (keyup.enter)="loadData()" [placeholder]="'common.searchPlaceholder' | translate" [disabled]="loading"
            class="dark:bg-dark-900 h-11 w-full sm:max-w-xs rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/3 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>

        <div advanced-filters class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.customer' | translate }}</label>
            <app-searchable-select [options]="customersOptions" placeholder="common.all"
              [(ngModel)]="filters.businessPartnerId" (selectionChange)="loadData()"></app-searchable-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.status' | translate }}</label>
            <app-searchable-select [options]="statusOptions" placeholder="common.all"
              [(ngModel)]="filters.status" (selectionChange)="loadData()"></app-searchable-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.invoiceDateFrom' | translate }}</label>
            <app-date-picker id="invoiceDateFrom" name="invoiceDateFrom" [(ngModel)]="filters.invoiceDateFrom" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.invoiceDateTo' | translate }}</label>
            <app-date-picker id="invoiceDateTo" name="invoiceDateTo" [(ngModel)]="filters.invoiceDateTo" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.dueDateFrom' | translate }}</label>
            <app-date-picker id="dueDateFrom" name="dueDateFrom" [(ngModel)]="filters.dueDateFrom" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.dueDateTo' | translate }}</label>
            <app-date-picker id="dueDateTo" name="dueDateTo" [(ngModel)]="filters.dueDateTo" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div class="flex items-end">
            <button (click)="resetFilters()" class="w-full px-4 py-2 text-sm text-error-600 bg-error-50 hover:bg-error-100 rounded-lg transition-colors font-medium dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20">
              {{ 'common.reset' | translate }}
            </button>
          </div>
        </div>

      </app-crud-list>
    </div>
    
    <app-payment-modal
      [isOpen]="isPaymentModalOpen"
      [invoice]="selectedInvoiceForPayment"
      (close)="isPaymentModalOpen = false"
      (paymentAdded)="onPaymentSaved()">
    </app-payment-modal>
  `
})
export class SalesInvoicesListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  customersOptions: SearchableOption[] = [];
  statusOptions: SearchableOption[] = [];

  loading = false;
  loadingStats = false;
  data: any = null;
  stats: InvoiceStatsResponse | null = null;

  isPaymentModalOpen = false;
  selectedInvoiceForPayment: InvoiceBasicResponse | null = null;

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.businessPartnerId ||
      this.filters.status ||
      this.filters.invoiceDateFrom ||
      this.filters.invoiceDateTo ||
      this.filters.dueDateFrom ||
      this.filters.dueDateTo
    );
  }

  customActions = [
    {
      id: 'pay',
      label: 'salesInvoices.addPayment',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      colorClass: 'text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-500/10',
      visible: (item: any) => item.status !== 'FullyPaid'
    }
  ];

  isActionHidden = (item: any) => item.status === 'FullyPaid';

  filters: InvoiceFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: ''
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'businessPartnerName', header: 'salesInvoices.fields.businessPartner', type: 'text' },
    { field: 'invoiceDate', header: 'salesInvoices.fields.invoiceDate', type: 'date' },
    { field: 'totalAmountDisplay', header: 'salesInvoices.fields.totalAmount', type: 'text' },
    { field: 'remainingAmountDisplay', header: 'salesInvoices.fields.remainingAmount', type: 'text' },
    { field: 'statusDisplay', header: 'common.status', type: 'dynamic-badge' }
  ];

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.lookupService.getCustomers().subscribe(res => {
      this.customersOptions = (res || []).map(c => ({ value: c.id, label: c.name }));
    });

    this.translate.onLangChange.subscribe(() => this.updateStatusOptions());
    this.updateStatusOptions();
  }

  updateStatusOptions(): void {
    this.statusOptions = [
      { value: 'Draft', label: this.translate.instant('salesInvoices.status.Draft') },
      { value: 'Confirmed', label: this.translate.instant('salesInvoices.status.Confirmed') },
      { value: 'PartiallyPaid', label: this.translate.instant('salesInvoices.status.PartiallyPaid') },
      { value: 'FullyPaid', label: this.translate.instant('salesInvoices.status.FullyPaid') },
      { value: 'Cancelled', label: this.translate.instant('salesInvoices.status.Cancelled') }
    ];
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      businessPartnerId: undefined,
      status: undefined,
      invoiceDateFrom: undefined,
      invoiceDateTo: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined
    };
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.invoiceService.getAll(this.filters).subscribe({
      next: (res) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'Draft': return 'light';
            case 'Confirmed': return 'info';
            case 'PartiallyPaid': return 'warning';
            case 'FullyPaid': return 'success';
            case 'Cancelled': return 'error';
            default: return 'primary';
          }
        };

        // Map status enum to translated string
        const itemsList = res.items || (res as any).Items || [];
        const mappedItems = itemsList.map((item: InvoiceBasicResponse) => ({
          ...item,
          statusDisplay: this.translate.instant('salesInvoices.status.' + item.status),
          statusDisplayColor: getStatusColor(item.status),
          totalAmountDisplay: item.totalAmount ? item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
          remainingAmountDisplay: item.remainingAmount ? item.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
        }));
        this.data = { ...res, items: mappedItems };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoices', err);
        this.loading = false;
      }
    });

    this.loadingStats = true;
    this.invoiceService.getStats(this.filters).subscribe({
      next: (res) => {
        this.stats = res;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.loadingStats = false;
        this.stats = null;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/invoices/sales/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/invoices/sales/view', id]);
  }

  onToggleStatus(item: InvoiceBasicResponse): void {
    // Invoices don't have a simple active/inactive toggle, but we can wire Confirm or Cancel here if needed.
    // For now, no operation.
  }

  onCustomAction(event: { actionId: string, item: any }) {
    if (event.actionId === 'pay') {
      this.selectedInvoiceForPayment = event.item;
      this.isPaymentModalOpen = true;
    }
  }

  onPaymentSaved() {
    this.isPaymentModalOpen = false;
    this.loadData();
  }
}
