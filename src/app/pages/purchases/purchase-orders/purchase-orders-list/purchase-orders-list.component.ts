import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PurchaseOrderService } from '../../../../core/services/purchase-order.service';
import { PurchaseOrderBasicResponse, PurchaseOrderFilters } from '../../../../core/models/purchase-order.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CrudListComponent, PageBreadcrumbComponent, SearchableSelectComponent, DatePickerComponent],
  template: `
    <app-page-breadcrumb [pageTitle]="'purchaseOrders.title'" />
    <div class="space-y-6">
      <app-crud-list
        [pageTitle]="'purchaseOrders.list'"
        [columns]="columns"
        [data]="data"
        [isLoading]="loading"
        [searchPlaceholder]="'common.searchPlaceholder'"
        addBtnText="purchaseOrders.add"
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
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.vendor' | translate }}</label>
            <app-searchable-select [options]="vendorsOptions" placeholder="common.all"
              [(ngModel)]="filters.businessPartnerId" (selectionChange)="loadData()"></app-searchable-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'common.status' | translate }}</label>
            <app-searchable-select [options]="statusOptions" placeholder="common.all"
              [(ngModel)]="filters.status" (selectionChange)="loadData()"></app-searchable-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{{ 'purchaseOrders.approvalStatus' | translate }}</label>
            <app-searchable-select [options]="approvalStatusOptions" placeholder="common.all"
              [(ngModel)]="filters.approvalStatus" (selectionChange)="loadData()"></app-searchable-select>
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
  `
})
export class PurchaseOrdersListComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  vendorsOptions: SearchableOption[] = [];
  statusOptions: SearchableOption[] = [];
  approvalStatusOptions: SearchableOption[] = [];

  loading = false;
  data: any = null;

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.businessPartnerId ||
      this.filters.status ||
      this.filters.approvalStatus ||
      this.filters.documentDateFrom ||
      this.filters.documentDateTo ||
      this.filters.dueDateFrom ||
      this.filters.dueDateTo
    );
  }

  customActions = [
    {
      id: 'approve',
      label: 'purchaseOrders.approveTitle',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      colorClass: 'text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-500/10',
      visible: (item: any) => item.status === 'Draft' && item.approvalStatus === 'Pending'
    },
    {
      id: 'cancel',
      label: 'purchaseOrders.cancelTitle',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      colorClass: 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10',
      visible: (item: any) => item.status !== 'Cancelled' && item.status !== 'Closed'
    },
    {
      id: 'convert',
      label: 'purchaseOrders.convertToInvoice',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>',
      colorClass: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10',
      visible: (item: any) => item.approvalStatus === 'Approved' && item.status !== 'Cancelled'
    }
  ];

  isActionHidden = (item: any) => true;

  filters: PurchaseOrderFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: ''
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'businessPartnerName', header: 'common.vendor', type: 'text' },
    { field: 'documentDate', header: 'common.date', type: 'date' },
    { field: 'totalAmountDisplay', header: 'salesInvoices.fields.totalAmount', type: 'text' },
    { field: 'statusDisplay', header: 'common.status', type: 'dynamic-badge' },
    { field: 'approvalStatusDisplay', header: 'purchaseOrders.approvalStatus', type: 'dynamic-badge' }
  ];

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.lookupService.getVendors().subscribe(res => {
      this.vendorsOptions = (res || []).map(c => ({ value: c.id, label: c.name }));
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
      { value: 'Pending', label: this.translate.instant('purchaseOrders.status.Pending') },
      { value: 'Approved', label: this.translate.instant('purchaseOrders.status.Approved') },
      { value: 'Rejected', label: this.translate.instant('purchaseOrders.status.Rejected') }
    ];
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      businessPartnerId: undefined,
      status: undefined,
      approvalStatus: undefined,
      documentDateFrom: undefined,
      documentDateTo: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined
    };
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.purchaseOrderService.getAll(this.filters).subscribe({
      next: (res) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'Draft': return 'warning';
            case 'Open': return 'success';
            case 'Closed': return 'gray';
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
        const mappedItems = itemsList.map((item: PurchaseOrderBasicResponse) => ({
          ...item,
          statusDisplay: this.translate.instant('common.documentStatus.' + item.status),
          statusDisplayColor: getStatusColor(item.status),
          approvalStatusDisplay: item.approvalStatus ? this.translate.instant('purchaseOrders.status.' + item.approvalStatus) : '-',
          approvalStatusDisplayColor: getApprovalStatusColor(item.approvalStatus),
          totalAmountDisplay: item.totalAmount ? item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
        }));
        this.data = { ...res, items: mappedItems };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading purchase orders', err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/purchases/purchase-orders/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/purchases/purchase-orders/view', id]);
  }

  onToggleStatus(item: PurchaseOrderBasicResponse): void {
    // No operation
  }

  onCustomAction(event: { actionId: string, item: any }) {
    if (event.actionId === 'approve') {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: this.translate.instant('purchaseOrders.approveTitle'),
          text: this.translate.instant('purchaseOrders.approveText'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('stockAdjustments.confirm'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.purchaseOrderService.approve(event.item.id).subscribe({
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
          title: this.translate.instant('purchaseOrders.cancelTitle'),
          text: this.translate.instant('purchaseOrders.cancelText'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('stockAdjustments.cancelDocument'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.purchaseOrderService.cancel(event.item.id).subscribe({
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
          title: this.translate.instant('purchaseOrders.convertTitle'),
          text: this.translate.instant('purchaseOrders.convertText'),
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('purchaseOrders.convertToInvoice'),
          cancelButtonText: this.translate.instant('common.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            // Placeholder: Navigate to purchase invoice form with pre-filled details or call API
            console.log('Convert to invoice functionality placeholder');
          }
        });
      });
    }
  }
}
