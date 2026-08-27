import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { BusinessPartnerPaymentService } from '../../../../core/services/business-partner-payment.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { EWalletProviderService } from '../../../../core/services/e-wallet-provider.service';
import { ConfigPaymentService } from '../../../../core/services/config-payment.service';
import { CommissionCalculationMode } from '../../../../core/models/config-payment.model';
import { ModalComponent } from '../../ui/modal/modal.component';
import { DatePickerComponent } from '../../form/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableOption } from '../../form/searchable-select/searchable-select.component';
import { PartnerBalanceBadgeComponent } from '../partner-balance-badge/partner-balance-badge.component';
import { ErrorBannerComponent } from '../error-banner/error-banner.component';
import {
  BusinessPartnerPaymentRequest,
  PaymentDirection,
  PartnerAccountSummary
} from '../../../../core/models/business-partner-payment.model';
import { EWalletProviderBasicResponse } from '../../../../core/models/e-wallet-provider.model';
import { InvoiceBasicResponse, InvoiceResponse } from '../../../../core/models/invoice.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invoice-payment-modal, app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ModalComponent,
    DatePickerComponent,
    SearchableSelectComponent,
    PartnerBalanceBadgeComponent,
    ErrorBannerComponent
  ],
  templateUrl: './invoice-payment-modal.component.html'
})
export class InvoicePaymentModalComponent implements OnChanges {
  private service = inject(BusinessPartnerPaymentService);
  private lookupService = inject(LookupService);
  private ewalletService = inject(EWalletProviderService);
  private configPaymentService = inject(ConfigPaymentService);
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);
  private configService = inject(AppConfigService);

  @Input() isOpen: boolean = false;
  @Input() invoice: InvoiceBasicResponse | InvoiceResponse | any | null = null;
  @Input() directionOverride?: PaymentDirection;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSaved = new EventEmitter<void>();
  @Output() paymentAdded = new EventEmitter<void>(); // alias for backward compatibility

  loading = false;
  saving = false;
  validationErrors: string[] = [];

  model: BusinessPartnerPaymentRequest = {
    id: 0,
    code: '',
    direction: 'Incoming',
    businessPartnerId: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    baseAmount: 0,
    totalAmountWithCommission: 0,
    method: 1, // Cash
    bankId: null,
    bankBranchId: null,
    chequeNumber: null,
    chequeDueDate: null,
    eWalletProviderId: null,
    eWalletReferenceNumber: null,
    reference: null,
    notes: null,
    paymentReason: null
  };

  partnerSummary: PartnerAccountSummary | null = null;
  loadingPartnerSummary = false;

  bankOptions: SearchableOption[] = [];
  eWalletProviderOptions: SearchableOption[] = [];
  eWalletProvidersList: EWalletProviderBasicResponse[] = [];

  baseAmount: number = 0;
  defaultCommissionPercent: number = 0;
  defaultFixedCommission: number = 0;
  appliedCommissionPercent: number = 0;
  appliedFixedCommission: number = 0;
  commissionAmount: number = 0;
  totalAmountWithCommission: number = 0;
  paymentReason: string = '';

  // Commission mode: 1 = Deduct from Base Amount (الصافي = المبلغ - العمولة), 2 = Add on Top (الإجمالي = المبلغ + العمولة)
  commissionMode: number = CommissionCalculationMode.DeductFromAmount;

  receiptFile: File | null = null;
  receiptPreviewUrl: string | null = null;
  isFullImageModalOpen: boolean = false;
  selectedImageUrl: string | null = null;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.invoice) {
      this.initFormForInvoice();
    }
  }

  private resolveDirection(): PaymentDirection {
    if (this.directionOverride) {
      return this.directionOverride;
    }
    const invType = this.invoice?.invoiceType;
    if (invType === 'Purchase' || invType === 1 || invType === 'PurchaseInvoice') {
      return 'Outgoing';
    }
    if (invType === 'SalesReturn' || invType === 2) {
      return 'Outgoing';
    }
    if (invType === 'PurchaseReturn' || invType === 3) {
      return 'Incoming';
    }
    return 'Incoming'; // Default for Sales Invoice
  }

  initFormForInvoice(): void {
    this.validationErrors = [];
    this.receiptFile = null;
    this.receiptPreviewUrl = null;
    this.selectedImageUrl = null;
    this.isFullImageModalOpen = false;

    const direction = this.resolveDirection();
    const partnerId = this.invoice.businessPartnerId || (this.invoice as any).customerId || (this.invoice as any).vendorId || 0;
    const remaining = Number(this.invoice.remainingAmount) || 0;

    this.baseAmount = remaining;
    this.commissionAmount = 0;
    this.defaultCommissionPercent = 0;
    this.defaultFixedCommission = 0;
    this.appliedCommissionPercent = 0;
    this.appliedFixedCommission = 0;
    this.totalAmountWithCommission = remaining;

    const todayStr = new Date().toISOString().split('T')[0];
    const isSales = direction === 'Incoming';
    const actionLabel = isSales ? 'تحصيل من عميل' : 'سداد لمورد';
    this.paymentReason = `سداد فاتورة رقم #${this.invoice.code} (${actionLabel}) - بتاريخ: ${todayStr}`;

    this.model = {
      id: 0,
      code: '',
      direction: direction,
      businessPartnerId: partnerId,
      paymentDate: todayStr,
      totalAmount: remaining,
      baseAmount: remaining,
      totalAmountWithCommission: remaining,
      method: 1, // Cash
      bankId: null,
      bankBranchId: null,
      chequeNumber: null,
      chequeDueDate: null,
      eWalletProviderId: null,
      eWalletReferenceNumber: null,
      reference: null,
      notes: null,
      paymentReason: this.paymentReason,
      initialAllocations: [
        {
          invoiceId: this.invoice.id,
          amount: remaining
        }
      ]
    };

    this.loadPaymentSettings();
    this.getNextCode(direction);
    this.loadBanks();
    this.loadEWalletProviders();
    if (partnerId) {
      this.loadPartnerSummary(partnerId);
    }
  }

  loadPaymentSettings(): void {
    this.configPaymentService.getSettings().subscribe({
      next: (config) => {
        if (config?.commissionMode) {
          this.commissionMode = config.commissionMode;
          this.recalculateCommissionFromPercent();
        }
      },
      error: () => {}
    });
  }

  getNextCode(dir: PaymentDirection): void {
    this.service.getNextCode(dir).subscribe({
      next: (res) => {
        this.model.code = res.nextCode;
      },
      error: () => {
        this.model.code = dir === 'Incoming' ? 'RCT-00001' : 'PAY-00001';
      }
    });
  }

  loadBanks(): void {
    this.lookupService.getBanks().subscribe({
      next: (res) => {
        this.bankOptions = (res || []).map(b => ({ value: b.id, label: b.name }));
      }
    });
  }

  loadEWalletProviders(): void {
    this.ewalletService.getAll({ pageNumber: 1, pageSize: 100 }, false).subscribe({
      next: (res) => {
        this.eWalletProvidersList = res.items || [];
        this.eWalletProviderOptions = this.eWalletProvidersList.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }));
      }
    });
  }

  loadPartnerSummary(partnerId: number): void {
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

  setCommissionMode(mode: number): void {
    this.commissionMode = mode;
    this.recalculateCommissionFromPercent();
  }

  onBaseAmountChange(amount: number): void {
    this.baseAmount = Number(amount) || 0;
    this.recalculateCommissionFromPercent();
    this.syncAllocations();
  }

  setFullAmount(): void {
    this.baseAmount = Number(this.invoice?.remainingAmount) || 0;
    this.recalculateCommissionFromPercent();
    this.syncAllocations();
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
    if (+this.commissionMode === 1) { // Deduct
      this.totalAmountWithCommission = Number((netBase - this.commissionAmount).toFixed(2));
    } else { // Add
      this.totalAmountWithCommission = Number((netBase + this.commissionAmount).toFixed(2));
    }
    this.syncModelCommission();
  }

  recalculateCommissionFromPercent(): void {
    const netBase = this.baseAmount;
    const pct = this.appliedCommissionPercent;
    const fixed = this.appliedFixedCommission;

    this.commissionAmount = Number((fixed + (netBase * (pct / 100))).toFixed(2));
    if (+this.commissionMode === 1) { // Deduct from base amount
      this.totalAmountWithCommission = Number((netBase - this.commissionAmount).toFixed(2));
    } else { // Add on top of base amount
      this.totalAmountWithCommission = Number((netBase + this.commissionAmount).toFixed(2));
    }
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

  syncAllocations(): void {
    if (this.invoice?.id) {
      this.model.initialAllocations = [
        {
          invoiceId: this.invoice.id,
          amount: this.baseAmount
        }
      ];
    }
  }

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

  openImageModal(url: string | null): void {
    if (!url) return;
    this.selectedImageUrl = url;
    this.isFullImageModalOpen = true;
  }

  closeImageModal(): void {
    this.isFullImageModalOpen = false;
    this.selectedImageUrl = null;
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
    if (this.invoice && this.model.totalAmount > (this.invoice.remainingAmount + 0.001)) {
      this.validationErrors.push('المبلغ المدخل أكبر من المبلغ المتبقي على الفاتورة (' + this.invoice.remainingAmount + ')');
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
    this.syncModelCommission();
    this.syncAllocations();

    if (!this.validate()) return;
    this.saving = true;
    this.validationErrors = [];

    this.service.add(this.model).subscribe({
      next: (res) => {
        if (this.receiptFile && res.id) {
          this.service.uploadReceipt(res.id, this.receiptFile).subscribe({
            next: () => {
              this.handleSaveSuccess();
            },
            error: () => {
              this.handleSaveSuccess();
            }
          });
        } else {
          this.handleSaveSuccess();
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

  private handleSaveSuccess(): void {
    this.saving = false;
    this.toastr.success(this.translate.instant('common.savedSuccessfully'));
    this.paymentSaved.emit();
    this.paymentAdded.emit();
    this.onClose();
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }
}
