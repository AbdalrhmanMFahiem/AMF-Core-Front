import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesOrderService } from '../../../../core/services/sales-order.service';
import { SalesOrderBasicResponse, SalesOrderFilters } from '../../../../core/models/sales-order.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { PrintPreviewModalComponent } from '../../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CrudListComponent, PageBreadcrumbComponent, SearchableSelectComponent, DatePickerComponent, PrintPreviewModalComponent],
  template: `
    <app-page-breadcrumb [pageTitle]="'salesOrders.title'" />
    <div class="space-y-6">
      <app-crud-list
        [pageTitle]="'salesOrders.list'"
        [columns]="columns"
        [data]="data"
        [isLoading]="loading"
        [searchPlaceholder]="'common.searchPlaceholder'"
        addBtnText="salesOrders.add"
        [filters]="filters"
        [showIncludeDisabledToggle]="false"
        [hideBuiltInSearch]="true"
        [hasAdvancedFilters]="true"
        [hasActiveAdvancedFilters]="hasActiveAdvancedFilters"
        [hideEdit]="true"
        [hideToggleStatus]="isActionHidden"
        [customActions]="customActions"
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
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.date' | translate }} ({{ 'common.from' | translate }})</label>
            <app-date-picker id="documentDateFrom" name="documentDateFrom" [(ngModel)]="filters.documentDateFrom" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.date' | translate }} ({{ 'common.to' | translate }})</label>
            <app-date-picker id="documentDateTo" name="documentDateTo" [(ngModel)]="filters.documentDateTo" (ngModelChange)="loadData()" [placeholder]="'common.selectDate' | translate"></app-date-picker>
          </div>
          <div class="flex items-end">
            <button (click)="resetFilters()" class="w-full px-4 py-2 text-sm text-error-600 bg-error-50 hover:bg-error-100 rounded-lg transition-colors font-medium dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20">
              {{ 'common.reset' | translate }}
            </button>
          </div>
        </div>

      </app-crud-list>
    </div>

    <!-- Print Preview Modal -->
    <app-print-preview-modal 
      *ngIf="isPrintModalOpen"
      [isOpen]="isPrintModalOpen" 
      [pdfBlobUrl]="pdfBlobUrl" 
      [loading]="pdfLoading"
      [title]="('salesOrders.printOrder' | translate) + ' ' + (selectedItemForPrint?.code || '')"
      (close)="closePrintModal()">
    </app-print-preview-modal>
  `
})
export class SalesOrdersListComponent implements OnInit {
  private salesOrderService = inject(SalesOrderService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  customersOptions: SearchableOption[] = [];
  statusOptions: SearchableOption[] = [];
  approvalStatusOptions: SearchableOption[] = [];

  loading = false;
  data: any = null;

  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;
  selectedItemForPrint: any = null;

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.businessPartnerId ||
      this.filters.status ||
      this.filters.documentDateFrom ||
      this.filters.documentDateTo ||
      this.filters.dueDateFrom ||
      this.filters.dueDateTo
    );
  }

  customActions = [
    {
      id: 'confirm',
      label: 'salesOrders.confirmTitle',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      colorClass: 'text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-500/10',
      visible: (item: any) => item.status === 'Draft'
    },
    {
      id: 'cancel',
      label: 'salesOrders.cancelTitle',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      colorClass: 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10',
      visible: (item: any) => item.status !== 'Cancelled' && item.status !== 'Closed' && item.status !== 'Open'
    },
    {
      id: 'close',
      label: 'salesOrders.closeDocument',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      colorClass: 'text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-500/10',
      visible: (item: any) => item.status === 'Open'
    },
    {
      id: 'convert',
      label: 'salesOrders.convertToInvoice',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>',
      colorClass: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10',
      visible: (item: any) => item.status !== 'Cancelled'
    },
    {
      id: 'print',
      label: 'salesOrders.printOrder',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>',
      colorClass: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-500/10',
      visible: () => true
    }
  ];

  isActionHidden = (item: any) => true;

  filters: SalesOrderFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: ''
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'businessPartnerName', header: 'common.customer', type: 'text' },
    { field: 'documentDate', header: 'common.date', type: 'date' },
    { field: 'totalAmountDisplay', header: 'salesOrders.fields.totalAmount', type: 'text' },
    { field: 'statusDisplay', header: 'common.status', type: 'dynamic-badge' }
  ];

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.lookupService.getCustomers().subscribe((res: any) => {
      this.customersOptions = (res || []).map((c: any) => ({ value: c.id, label: c.name }));
    });

    this.translate.onLangChange.subscribe(() => this.updateStatusOptions());
    this.updateStatusOptions();
  }

  updateStatusOptions(): void {
    this.statusOptions = [
      { value: 'Draft', label: this.translate.instant('common.documentStatus.Draft') },
      { value: 'Open', label: this.translate.instant('common.documentStatus.Open') },
      { value: 'Closed', label: this.translate.instant('common.documentStatus.Closed') },
      { value: 'Cancelled', label: this.translate.instant('common.documentStatus.Cancelled') }
    ];
    this.approvalStatusOptions = [
      { value: 'Pending', label: this.translate.instant('salesOrders.status.Pending') },
      { value: 'Approved', label: this.translate.instant('salesOrders.status.Approved') },
      { value: 'Rejected', label: this.translate.instant('salesOrders.status.Rejected') }
    ];
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      businessPartnerId: undefined,
      status: undefined,
      documentDateFrom: undefined,
      documentDateTo: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined
    };
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.salesOrderService.getAll(this.filters).subscribe({
      next: (res: any) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'Draft': return 'warning';
            case 'Open': return 'success';
            case 'Closed': return 'dark';
            case 'Cancelled': return 'error';
            default: return 'primary';
          }
        };

        const getApprovalStatusColor = (status?: string) => {
          switch (status) {
            case 'Pending': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            default: return 'light';
          }
        };

        const itemsList = res.items || (res as any).Items || [];
        const mappedItems = itemsList.map((item: SalesOrderBasicResponse) => ({
          ...item,
          statusDisplay: this.translate.instant('common.documentStatus.' + item.status),
          statusDisplayColor: getStatusColor(item.status),
          approvalStatusDisplay: item.approvalStatus ? this.translate.instant('salesOrders.status.' + item.approvalStatus) : '-',
          approvalStatusDisplayColor: getApprovalStatusColor(item.approvalStatus),
          totalAmountDisplay: item.totalAmount ? item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
        }));
        this.data = { ...res, items: mappedItems };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading sales orders', err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/sales/sales-orders/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/sales/sales-orders/view', id]);
  }

  onToggleStatus(item: SalesOrderBasicResponse): void {
    // No operation
  }

  onCustomAction(event: { actionId: string, item: any }) {
    if (event.actionId === 'confirm') {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: this.translate.instant('salesOrders.confirmTitle'),
          text: this.translate.instant('salesOrders.confirmText'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('common.confirm'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.salesOrderService.confirm(event.item.id).subscribe({
              next: () => {
                this.loadData();
              }
            });
          }
        });
      });
    } else if (event.actionId === 'cancel') {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: this.translate.instant('salesOrders.cancelTitle'),
          text: this.translate.instant('salesOrders.cancelText'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('salesOrders.cancelDocument'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.salesOrderService.cancel(event.item.id).subscribe({
              next: () => {
                this.loadData();
              }
            });
          }
        });
      });
    } else if (event.actionId === 'close') {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: this.translate.instant('salesOrders.closeTitle'),
          text: this.translate.instant('salesOrders.closeText'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('salesOrders.closeDocument'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.salesOrderService.close(event.item.id).subscribe({
              next: () => {
                this.loadData();
              }
            });
          }
        });
      });
    } else if (event.actionId === 'convert') {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: this.translate.instant('salesOrders.convertTitle'),
          text: this.translate.instant('salesOrders.convertText'),
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('salesOrders.convertToInvoice'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            // Placeholder: Navigate to purchase invoice form with pre-filled details or call API
            console.log('Convert to invoice functionality placeholder');
          }
        });
      });
    } else if (event.actionId === 'print') {
      this.openPrintModal(event.item);
    }
  }

  openPrintModal(item: any): void {
    this.selectedItemForPrint = item;
    this.isPrintModalOpen = true;
    this.pdfLoading = true;

    this.salesOrderService.printPdf(item.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.pdfBlobUrl = url;
        this.pdfLoading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
        this.pdfLoading = false;
        this.isPrintModalOpen = false;
      }
    });
  }

  closePrintModal(): void {
    this.isPrintModalOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }
}


