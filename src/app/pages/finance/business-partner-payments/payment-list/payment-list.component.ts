import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn, CustomAction } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { AllocationModalComponent } from '../../../../shared/components/lookups/allocation-modal/allocation-modal.component';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';
import { BusinessPartnerPaymentService } from '../../../../core/services/business-partner-payment.service';
import { LookupService } from '../../../../core/services/lookup.service';
import {
  BusinessPartnerPaymentBasicResponse,
  PaymentFilters,
  PaymentDirection
} from '../../../../core/models/business-partner-payment.model';
import { PaginatedList } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CrudListComponent,
    PageBreadcrumbComponent,
    TranslateModule,
    SearchableSelectComponent,
    DatePickerComponent,
    AllocationModalComponent,
    ModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './payment-list.component.html'
})
export class PaymentListComponent implements OnInit {
  private service = inject(BusinessPartnerPaymentService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<BusinessPartnerPaymentBasicResponse> | null = null;
  loading = false;

  filters: PaymentFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'PaymentDate',
    sortDirection: 'DESC',
    direction: null,
    businessPartnerId: null,
    status: null,
    method: null,
    dateFrom: null,
    dateTo: null
  };

  partnerOptions: SearchableOption[] = [];
  isAllocationModalOpen = false;
  selectedPaymentId = 0;
  selectedPartnerId = 0;
  selectedUnallocatedAmount = 0;

  // Verification modal state
  isVerifyModalOpen = false;
  verifyPaymentId = 0;
  rejectionReason = '';

  // Cancel confirmation modal state
  isCancelModalOpen = false;
  cancellingPayment = false;
  itemToCancel: any = null;

  columns: CrudColumn[] = [
    { field: 'code', header: 'payments.fields.code', type: 'code' },
    { field: 'directionText', header: 'payments.fields.direction', type: 'text' },
    { field: 'businessPartnerName', header: 'payments.fields.partner', type: 'text' },
    { field: 'paymentDate', header: 'payments.fields.date', type: 'date' },
    { field: 'totalAmount', header: 'payments.fields.totalAmount', type: 'text' },
    { field: 'allocatedAmount', header: 'payments.fields.allocatedAmount', type: 'text' },
    { field: 'methodText', header: 'payments.fields.method', type: 'dynamic-badge' },
    { field: 'statusText', header: 'payments.fields.status', type: 'dynamic-badge' }
  ];

  customActions: CustomAction[] = [
    {
      id: 'allocate',
      label: 'payments.actions.allocate',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>',
      colorClass: 'text-brand-600 dark:text-brand-400',
      visible: (item: any) => {
        const sStr = item.status?.toString().toLowerCase();
        const isCompleted = sStr === '1' || sStr === 'completed' || sStr === 'posted' || sStr === 'approved';
        return isCompleted && item.allocatedAmount < item.totalAmount;
      }
    },
    {
      id: 'verify',
      label: 'payments.actions.verify',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      colorClass: 'text-success-600 dark:text-success-400',
      visible: (item: any) => {
        const vStr = item.verificationStatus?.toString().toLowerCase();
        return vStr === 'p' || vStr === 'pending';
      }
    },
    {
      id: 'cancel',
      label: 'payments.actions.cancel',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
      colorClass: 'text-error-600 dark:text-error-400',
      visible: (item: any) => {
        const sStr = item.status?.toString().toLowerCase();
        return sStr !== '2' && sStr !== 'cancelled' && sStr !== 'canceled' && sStr !== '3' && sStr !== 'bounced';
      }
    }
  ];

  ngOnInit(): void {
    this.loadData();
    this.loadPartners();

    this.translate.onLangChange.subscribe(() => {
      if (this.data && this.data.items) {
        this.data.items = this.formatItems(this.data.items);
      }
    });
  }

  getMethodInfo(method: number | string): { text: string; color: string } {
    const mStr = method?.toString().toLowerCase();
    if (mStr === '1' || mStr === 'cash') {
      return { text: this.translate.instant('payments.methods.cash'), color: 'success' };
    }
    if (mStr === '2' || mStr === 'banktransfer' || mStr === 'bank') {
      return { text: this.translate.instant('payments.methods.bankTransfer'), color: 'info' };
    }
    if (mStr === '3' || mStr === 'cheque') {
      return { text: this.translate.instant('payments.methods.cheque'), color: 'warning' };
    }
    if (mStr === '4' || mStr === 'postdatedcheque') {
      return { text: this.translate.instant('payments.methods.postDatedCheque'), color: 'warning' };
    }
    if (mStr === '5' || mStr === 'creditcard') {
      return { text: this.translate.instant('payments.methods.creditCard'), color: 'primary' };
    }
    if (mStr === '7' || mStr === 'ewallet') {
      return { text: this.translate.instant('payments.methods.eWallet'), color: 'primary' };
    }
    return { text: method?.toString() || '', color: 'primary' };
  }

  getStatusInfo(status: number | string): { text: string; color: string } {
    const sStr = status?.toString().toLowerCase();
    if (sStr === '0' || sStr === 'pending') {
      return { text: this.translate.instant('payments.statuses.pending'), color: 'warning' };
    }
    if (sStr === '1' || sStr === 'completed' || sStr === 'posted' || sStr === 'approved') {
      return { text: this.translate.instant('payments.statuses.completed'), color: 'success' };
    }
    if (sStr === '2' || sStr === 'cancelled' || sStr === 'canceled') {
      return { text: this.translate.instant('payments.statuses.cancelled'), color: 'error' };
    }
    if (sStr === '3' || sStr === 'bounced') {
      return { text: this.translate.instant('payments.statuses.bounced'), color: 'error' };
    }
    return { text: status?.toString() || '', color: 'info' };
  }

  getDirectionTranslation(direction: PaymentDirection | number | string): string {
    if (direction === 'Incoming' || direction === 1 || direction === '1') {
      return `📥 ${this.translate.instant('payments.incoming')}`;
    }
    return `📤 ${this.translate.instant('payments.outgoing')}`;
  }

  formatItems(items: any[]): any[] {
    return items.map(item => {
      const methodInfo = this.getMethodInfo(item.method);
      const statusInfo = this.getStatusInfo(item.status);
      return {
        ...item,
        directionText: this.getDirectionTranslation(item.direction),
        methodText: methodInfo.text,
        methodTextColor: methodInfo.color,
        statusText: statusInfo.text,
        statusTextColor: statusInfo.color
      };
    });
  }

  loadPartners(): void {
    this.lookupService.getCustomers().subscribe(customers => {
      const custOptions = customers.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }));
      this.lookupService.getVendors().subscribe(vendors => {
        const vendOptions = vendors.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }));
        this.partnerOptions = [...custOptions, ...vendOptions];
      });
    });
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll(this.filters).subscribe({
      next: (res) => {
        if (res && res.items) {
          res.items = this.formatItems(res.items);
        }
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  onAdd(): void {
    this.router.navigate(['/finance/business-partner-payments/add']);
  }

  onOpenSettings(): void {
    this.router.navigate(['/configuration/payment-settings']);
  }

  onView(id: number): void {
    this.router.navigate(['/finance/business-partner-payments/view', id]);
  }

  onCustomAction(event: { actionId: string, item: any }): void {
    if (event.actionId === 'allocate') {
      this.selectedPaymentId = event.item.id;
      this.selectedPartnerId = event.item.businessPartnerId || 0;
      this.selectedUnallocatedAmount = event.item.totalAmount - event.item.allocatedAmount;
      this.isAllocationModalOpen = true;
    } else if (event.actionId === 'verify') {
      this.verifyPaymentId = event.item.id;
      this.rejectionReason = '';
      this.isVerifyModalOpen = true;
    } else if (event.actionId === 'cancel') {
      this.itemToCancel = event.item;
      this.isCancelModalOpen = true;
    }
  }

  onConfirmCancel(): void {
    if (!this.itemToCancel) return;
    this.cancellingPayment = true;
    this.service.cancel(this.itemToCancel.id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('payments.cancelSuccess'));
        this.cancellingPayment = false;
        this.isCancelModalOpen = false;
        this.itemToCancel = null;
        this.loadData();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'));
        this.cancellingPayment = false;
      }
    });
  }

  onVerify(approve: boolean): void {
    this.service.verify(this.verifyPaymentId, { approve, rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant(approve ? 'payments.approveSuccess' : 'payments.rejectSuccess'));
        this.isVerifyModalOpen = false;
        this.loadData();
      },
      error: (err) => this.toastr.error(err?.error?.message || this.translate.instant('errors.generic'))
    });
  }
}
