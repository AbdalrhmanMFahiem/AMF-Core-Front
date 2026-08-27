import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { BusinessPartnerPaymentService } from '../../../../core/services/business-partner-payment.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { EWalletProviderService } from '../../../../core/services/e-wallet-provider.service';
import { Observable, forkJoin } from 'rxjs';
import {
  BusinessPartnerPaymentRequest,
  BusinessPartnerPaymentResponse,
  PaymentDirection,
  PartnerAccountSummary
} from '../../../../core/models/business-partner-payment.model';
import { EWalletProviderBasicResponse } from '../../../../core/models/e-wallet-provider.model';

import { PartnerBalanceBadgeComponent } from '../../../../shared/components/common/partner-balance-badge/partner-balance-badge.component';
import { InvoiceAllocationModalComponent, SelectableInvoiceItem } from '../../../../shared/components/common/invoice-allocation-modal/invoice-allocation-modal.component';
import { AllocationRequest } from '../../../../core/models/business-partner-payment.model';

import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent,
    DatePickerComponent,
    SearchableSelectComponent,
    PartnerBalanceBadgeComponent,
    InvoiceAllocationModalComponent,
    ModalComponent
  ],
  templateUrl: './payment-form.component.html'
})
export class PaymentFormComponent implements OnInit {
  private service = inject(BusinessPartnerPaymentService);
  private lookupService = inject(LookupService);
  private ewalletService = inject(EWalletProviderService);
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configService = inject(AppConfigService);

  id: number | null = null;
  mode: 'add' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  model: BusinessPartnerPaymentRequest = {
    id: 0,
    code: '',
    direction: 'Incoming',
    businessPartnerId: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    method: 1, // Cash
    bankId: null,
    bankBranchId: null,
    chequeNumber: null,
    chequeDueDate: null,
    eWalletProviderId: null,
    eWalletReferenceNumber: null,
    reference: null,
    notes: null
  };

  viewRecord: BusinessPartnerPaymentResponse | null = null;
  partnerOptions: SearchableOption[] = [];
  bankOptions: SearchableOption[] = [];
  eWalletProviderOptions: SearchableOption[] = [];
  eWalletProvidersList: EWalletProviderBasicResponse[] = [];
  partnerSummary: PartnerAccountSummary | null = null;
  loadingPartnerSummary = false;
  receiptFile: File | null = null;

  baseAmount: number = 0;
  defaultCommissionPercent: number = 0;
  defaultFixedCommission: number = 0;
  appliedCommissionPercent: number = 0;
  appliedFixedCommission: number = 0;
  commissionAmount: number = 0;
  totalAmountWithCommission: number = 0;
  paymentReason: string = '';

  isAllocationModalOpen: boolean = false;
  initialAllocations: AllocationRequest[] = [];
  totalAllocatedFromModal: number = 0;

  methodOptions = [
    { value: 1, labelKey: 'payments.methods.cash', icon: '💵', hintKey: 'payments.methodHints.cash' },
    { value: 2, labelKey: 'payments.methods.bankTransfer', icon: '🏦', hintKey: 'payments.methodHints.bankTransfer' },
    { value: 3, labelKey: 'payments.methods.cheque', icon: '📜', hintKey: 'payments.methodHints.cheque' },
    { value: 4, labelKey: 'payments.methods.postDatedCheque', icon: '🗓️', hintKey: 'payments.methodHints.postDatedCheque' },
    { value: 5, labelKey: 'payments.methods.creditCard', icon: '💳', hintKey: 'payments.methodHints.creditCard' },
    { value: 7, labelKey: 'payments.methods.eWallet', icon: '📱', hintKey: 'payments.methodHints.eWallet' }
  ];

  get methodSearchableOptions(): SearchableOption[] {
    return this.methodOptions.map(m => ({
      value: m.value,
      label: `${m.icon} ${this.translate.instant(m.labelKey)}`
    }));
  }

  onMethodChange(methodValue: any): void {
    this.model.method = Number(methodValue);
    if (+this.model.method !== 7) {
      this.model.eWalletProviderId = null;
      this.model.eWalletReferenceNumber = null;
    }
  }

  onEWalletProviderSelect(providerId: number): void {
    this.model.eWalletProviderId = providerId;
    if (!providerId) {
      this.defaultCommissionPercent = 0;
      this.defaultFixedCommission = 0;
      this.appliedCommissionPercent = 0;
      this.appliedFixedCommission = 0;
      this.recalculateCommissionFromPercent();
      return;
    }

    const provider = this.eWalletProvidersList.find(p => p.id === +providerId);
    if (provider) {
      this.defaultCommissionPercent = provider.commissionPercent || 0;
      this.defaultFixedCommission = provider.fixedCommission || 0;

      this.appliedCommissionPercent = this.defaultCommissionPercent;
      this.appliedFixedCommission = this.defaultFixedCommission;

      this.recalculateCommissionFromPercent();
    }
  }

  onBaseAmountChange(amount: number): void {
    this.baseAmount = Number(amount) || 0;
    this.recalculateCommissionFromPercent();
  }

  onAppliedPercentChange(percent: number): void {
    this.appliedCommissionPercent = Number(percent) || 0;
    this.recalculateCommissionFromPercent();
  }

  onAppliedFixedChange(fixed: number): void {
    this.appliedFixedCommission = Number(fixed) || 0;
    this.recalculateCommissionFromPercent();
  }

  onCommissionAmountChange(amt: number): void {
    this.commissionAmount = Number(amt) || 0;
    const netBase = this.baseAmount;
    const fixed = this.appliedFixedCommission;
    if (netBase > 0) {
      this.appliedCommissionPercent = Number((((this.commissionAmount - fixed) / netBase) * 100).toFixed(4));
    } else {
      this.appliedCommissionPercent = 0;
    }
    this.totalAmountWithCommission = netBase + this.commissionAmount;
    this.syncModelCommission();
  }

  recalculateCommissionFromPercent(): void {
    const netBase = this.baseAmount;
    const pct = this.appliedCommissionPercent;
    const fixed = this.appliedFixedCommission;

    this.commissionAmount = Number((fixed + (netBase * (pct / 100))).toFixed(2));
    this.totalAmountWithCommission = Number((netBase + this.commissionAmount).toFixed(2));
    this.syncModelCommission();
  }

  syncModelCommission(): void {
    this.model.baseAmount = this.baseAmount;
    this.model.totalAmount = this.baseAmount;
    this.model.totalAmountWithCommission = this.totalAmountWithCommission;
    this.model.defaultCommissionPercent = this.defaultCommissionPercent;
    this.model.defaultFixedCommission = this.defaultFixedCommission;
    this.model.appliedCommissionPercent = this.appliedCommissionPercent;
    this.model.appliedFixedCommission = this.appliedFixedCommission;
    this.model.paymentReason = this.paymentReason;
  }

  openAllocationModal(): void {
    if (!this.model.businessPartnerId) {
      this.toastr.warning(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.partner') }));
      return;
    }
    this.isAllocationModalOpen = true;
  }

  receiptPreviewUrl: string | null = null;
  isFullImageModalOpen: boolean = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.receiptFile = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.receiptPreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.receiptPreviewUrl = null;
      }
    }
  }

  removeReceiptFile(): void {
    this.receiptFile = null;
    this.receiptPreviewUrl = null;
  }

  onConfirmAllocation(data: { allocations: AllocationRequest[], totalAllocated: number, selectedInvoices?: SelectableInvoiceItem[] }): void {
    this.initialAllocations = data.allocations;
    this.model.initialAllocations = data.allocations;
    this.totalAllocatedFromModal = data.totalAllocated;

    if (data.totalAllocated > 0) {
      this.baseAmount = data.totalAllocated;
      this.recalculateCommissionFromPercent();
    }

    // Auto-generate structured payment reason with newlines
    if (data.selectedInvoices && data.selectedInvoices.length > 0) {
      const todayDateStr = new Date().toISOString().split('T')[0];
      const header = `سداد الفواتير المحددة (بتاريخ: ${todayDateStr}):`;
      const lines = data.selectedInvoices.map(inv =>
        `• فاتورة رقم #${inv.invoiceCode} بمبلغ مسدد: ${inv.allocationAmount.toFixed(2)} ج.م`
      );
      this.paymentReason = [header, ...lines].join('\n');
      this.model.paymentReason = this.paymentReason;
    }
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadRecord(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
      this.loadPartners();
      this.loadBanks();
      this.loadEWalletProviders();
    }
  }

  getNextCode(): void {
    this.service.getNextCode(this.model.direction).subscribe(res => {
      this.model.code = res.nextCode;
    });
  }

  onDirectionChange(dir: PaymentDirection): void {
    this.model.direction = dir;
    this.model.businessPartnerId = 0;
    this.partnerSummary = null;
    this.getNextCode();
    this.loadPartners();
  }

  onPartnerChange(partnerId: number): void {
    this.model.businessPartnerId = partnerId;
    if (!partnerId) {
      this.partnerSummary = null;
      return;
    }

    this.loadingPartnerSummary = true;
    forkJoin({
      balance: this.service.getPartnerBalanceSummary(partnerId),
      openInvoices: this.service.suggestAllocation(partnerId, 99999999)
    }).subscribe({
      next: (res) => {
        const count = res.openInvoices ? res.openInvoices.length : 0;
        const totalOpen = res.openInvoices ? res.openInvoices.reduce((sum, item) => sum + item.invoiceRemaining, 0) : 0;

        this.partnerSummary = {
          currentBalance: res.balance.currentBalance,
          totalInvoiced: res.balance.totalInvoiced,
          totalPaid: res.balance.totalPaid,
          totalOverdue: res.balance.totalOverdue,
          openInvoicesCount: count,
          openInvoicesTotal: totalOpen
        };
        this.loadingPartnerSummary = false;
      },
      error: () => {
        this.loadingPartnerSummary = false;
      }
    });
  }

  loadPartners(): void {
    if (this.model.direction === 'Incoming') {
      this.lookupService.getCustomers().subscribe(res => {
        this.partnerOptions = res.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }));
      });
    } else {
      this.lookupService.getVendors().subscribe(res => {
        this.partnerOptions = res.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }));
      });
    }
  }

  loadBanks(): void {
    this.lookupService.getBanks().subscribe(res => {
      this.bankOptions = res.map(b => ({ value: b.id, label: b.name }));
    });
  }

  loadEWalletProviders(): void {
    this.ewalletService.getAll({ pageNumber: 1, pageSize: 100 }, false).subscribe(res => {
      this.eWalletProvidersList = res.items;
      this.eWalletProviderOptions = res.items.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }));
    });
  }

  getSelectedProviderCommission(): { fixed: number; percent: number; max: number | null; totalCommission: number; netAmount: number } | null {
    if (+this.model.method !== 7 || !this.model.eWalletProviderId) return null;
    const provider = this.eWalletProvidersList.find(p => p.id === +this.model.eWalletProviderId!);
    if (!provider) return null;

    const fixed = provider.fixedCommission || 0;
    const percent = provider.commissionPercent || 0;
    const max = provider.maxCommission;

    let totalCommission = fixed + ((this.model.totalAmount || 0) * percent / 100);
    if (max !== null && max !== undefined && max > 0 && totalCommission > max) {
      totalCommission = max;
    }

    const netAmount = (this.model.totalAmount || 0) - totalCommission;
    return {
      fixed,
      percent,
      max: max ?? null,
      totalCommission,
      netAmount
    };
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.viewRecord = null;
    this.receiptPreviewUrl = null;
    this.selectedImageUrl = null;
    this.service.get(id).subscribe({
      next: (res) => {
        this.viewRecord = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.code) {
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.code') }));
    }
    if (!this.model.businessPartnerId) {
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.partner') }));
    }
    if (this.model.totalAmount <= 0) {
      this.validationErrors.push(this.translate.instant('payments.invalidAmount'));
    }
    if (this.model.method === 3 || this.model.method === 4) { // Cheque
      if (!this.model.chequeNumber) {
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.chequeNumber') }));
      }
      if (this.model.method === 4 && !this.model.chequeDueDate) {
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.chequeDueDate') }));
      }
    }
    if (this.model.method === 7) { // EWallet
      if (!this.model.eWalletProviderId) {
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.eWalletProvider') }));
      }
      if (!this.model.eWalletReferenceNumber) {
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: this.translate.instant('payments.fields.eWalletRef') }));
      }
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;
    this.saving = true;
    this.validationErrors = [];

    this.service.add(this.model).subscribe({
      next: (res) => {
        if (this.receiptFile && res.id) {
          this.service.uploadReceipt(res.id, this.receiptFile).subscribe({
            next: () => {
              this.saving = false;
              this.saveSuccess = true;
            },
            error: () => {
              this.saving = false;
              this.saveSuccess = true;
            }
          });
        } else {
          this.saving = false;
          this.saveSuccess = true;
        }
      },
      error: (err: any) => {
        this.saving = false;
        const mapErrorItem = (e: any) => {
          if (typeof e === 'object' && e !== null) {
            const codeStr = e.code ? `[${e.code}] ` : '';
            const msgStr = e.description || e.errorMessage || e.message || JSON.stringify(e);
            return `${codeStr}${msgStr}`;
          }
          return typeof e === 'string' ? e : JSON.stringify(e);
        };

        if (err?.error?.errors) {
          this.validationErrors = Array.isArray(err.error.errors)
            ? err.error.errors.map(mapErrorItem)
            : Object.values(err.error.errors).flat().map(mapErrorItem);
        } else if (err?.error?.message) {
          const codeStr = err.error.code ? `[${err.error.code}] ` : '';
          this.validationErrors = [`${codeStr}${err.error.message}`];
        } else if (err?.error?.title) {
          const codeStr = err.error.code ? `[${err.error.code}] ` : '';
          this.validationErrors = [`${codeStr}${err.error.title}`];
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    });
  }

  // Image Preview Modal
  selectedImageUrl: string | null = null;

  openImageModal(url: string | null): void {
    if (!url) return;
    this.selectedImageUrl = url;
    this.isFullImageModalOpen = true;
  }

  closeImageModal(): void {
    this.isFullImageModalOpen = false;
    this.selectedImageUrl = null;
  }

  getAttachmentUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const baseUrl = this.configService.apiUrl.replace(/\/api\/?$/i, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  getMethodInfo(method: any): { labelKey: string; icon: string } {
    const str = String(method).toLowerCase();
    if (method === 1 || str === '1' || str === 'cash') {
      return { labelKey: 'payments.methods.cash', icon: '💵' };
    }
    if (method === 2 || str === '2' || str === 'banktransfer') {
      return { labelKey: 'payments.methods.bankTransfer', icon: '🏦' };
    }
    if (method === 3 || str === '3' || str === 'cheque') {
      return { labelKey: 'payments.methods.cheque', icon: '📜' };
    }
    if (method === 4 || str === '4' || str === 'postdatedcheque') {
      return { labelKey: 'payments.methods.postDatedCheque', icon: '🗓️' };
    }
    if (method === 5 || str === '5' || str === 'creditcard') {
      return { labelKey: 'payments.methods.creditCard', icon: '💳' };
    }
    if (method === 7 || str === '7' || str === 'ewallet') {
      return { labelKey: 'payments.methods.eWallet', icon: '📱' };
    }
    return { labelKey: 'payments.fields.method', icon: '💳' };
  }

  getStatusInfo(status: any): { labelKey: string; colorClass: string } {
    const str = String(status).toLowerCase();
    if (status === 1 || str === '1' || str === 'completed' || str === 'posted' || str === 'approved') {
      return { labelKey: 'payments.statuses.completed', colorClass: 'bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500/30' };
    }
    if (status === 2 || str === '2' || str === 'cancelled' || str === 'canceled') {
      return { labelKey: 'payments.statuses.cancelled', colorClass: 'bg-error-50 text-error-700 border border-error-200 dark:bg-error-500/20 dark:text-error-400 dark:border-error-500/30' };
    }
    if (status === 3 || str === '3' || str === 'bounced') {
      return { labelKey: 'payments.statuses.bounced', colorClass: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' };
    }
    return { labelKey: 'payments.statuses.pending', colorClass: 'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-500/20 dark:text-warning-400 dark:border-warning-500/30' };
  }

  getVerificationInfo(status: any): { label: string; colorClass: string } {
    const str = String(status).toLowerCase();
    if (str === 'verified' || str === 'approved' || str === 'v') {
      return { label: 'معتمد', colorClass: 'bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/20 dark:text-success-400 dark:border-success-500/30' };
    }
    if (str === 'rejected' || str === 'r') {
      return { label: 'مرفوض', colorClass: 'bg-error-50 text-error-700 border border-error-200 dark:bg-error-500/20 dark:text-error-400 dark:border-error-500/30' };
    }
    return { label: 'قيد الانتظار', colorClass: 'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-500/20 dark:text-warning-400 dark:border-warning-500/30' };
  }

  onCancel(): void {
    this.router.navigate(['/finance/business-partner-payments']);
  }
}
