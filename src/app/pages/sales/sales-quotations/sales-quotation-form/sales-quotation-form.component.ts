import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { SalesQuotationService } from '../../../../core/services/sales-quotation.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { ItemService } from '../../../../core/services/item.service';
import { DocumentStatusBadgeComponent } from '../../../../shared/components/common/document-status-badge/document-status-badge.component';
import { StatusBadgeComponent } from '../../../../shared/components/ui/status-badge/status-badge.component';
import { PrintPreviewModalComponent } from '../../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import {
  SalesQuotationRequest,
  SalesQuotationResponse,
  DocumentStatus,
  ApprovalStatus,
  SalesQuotationLineRequest
} from '../../../../core/models/sales-quotation.model';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-quotation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent,
    SearchableSelectComponent,
    DatePickerComponent,
    ItemLookupModalComponent,
    DocumentStatusBadgeComponent,
    StatusBadgeComponent,
    PrintPreviewModalComponent,
    ModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './sales-quotation-form.component.html',
})
export class SalesQuotationFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;

  private salesQuotationService = inject(SalesQuotationService);
  private lookupService = inject(LookupService);
  private itemService = inject(ItemService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  id: number | null = null;
  mode: 'add' | 'view' | 'edit' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];
  previousWarehouseId?: number;

  // Confirmation Modal
  isActionModalOpen = false;
  isActionLoading = false;
  actionModalTitle = '';
  actionModalMessage = '';
  actionModalType: 'warning' | 'danger' | 'info' | 'success' = 'warning';
  actionModalConfirmText = '';
  pendingAction: 'confirm' | 'cancel' | 'convert' | null = null;

  showLeaveConfirmation = false;
  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  activeTab: 'items' | 'additional' = 'items';
  isItemModalOpen = false;

  // Line Notes Modal
  isLineNotesModalOpen = false;
  currentLineNotesIndex = -1;
  currentLineNotes = '';

  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;

  model: SalesQuotationRequest = {
    id: 0,
    code: '',
    documentNumber: '',
    businessPartnerId: 0,
    currencyId: undefined,
    branchId: undefined,
    warehouseId: undefined,
    postingDate: new Date().toISOString().split('T')[0],
    documentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    requiredDate: undefined,
    status: DocumentStatus.Draft,
    approvalStatus: ApprovalStatus.Pending,
    exchangeRate: 1,
    discountPercent: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalBeforeDiscount: 0,
    totalBeforeTax: 0,
    totalAmount: 0,
    freightAmount: 0,
    referenceNumber: '',
    notes: '',
    internalNotes: '',
    lines: []
  };

  viewResponse?: SalesQuotationResponse;

  // Options for Dropdowns
  customersOptions: SearchableOption[] = [];
  warehousesOptions: SearchableOption[] = [];
  branchesOptions: SearchableOption[] = [];
  currenciesOptions: SearchableOption[] = [];
  uomOptions: any[] = [];

  // Totals calculated on the fly
  subTotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  netTotal = 0;

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'view') this.mode = 'view';
      else if (path === 'edit') this.mode = 'edit';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
    }

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;

    const customers$ = this.lookupService.getCustomers();
    const warehouses$ = this.lookupService.getWarehouses();
    const branches$ = this.lookupService.getBranches();
    const currencies$ = this.lookupService.getCurrencies();
    const uoms$ = this.lookupService.getUnitOfMeasures();
    const action$ = this.id ? this.salesQuotationService.get(this.id) : this.salesQuotationService.getNextCode();

    forkJoin({
      customers: customers$,
      warehouses: warehouses$,
      branches: branches$,
      currencies: currencies$,
      uoms: uoms$,
      actionData: action$
    }).subscribe({
      next: (res: any) => {
        this.customersOptions = res.customers.map((v: any) => ({ value: v.id, label: `${v.code} - ${v.name}` }));
        this.warehousesOptions = res.warehouses.map((w: any) => ({ value: w.id, label: w.name }));
        this.branchesOptions = res.branches.map((b: any) => ({ value: b.id, label: b.name }));
        this.currenciesOptions = res.currencies.map((c: any) => ({ value: c.id, label: c.name }));
        this.uomOptions = res.uoms.map((u: any) => ({ value: u.id, label: u.name, baseUomType: u.baseUomType }));

        if (this.id) {
          this.processViewResponse(res.actionData as SalesQuotationResponse);
        } else {
          this.model.code = res.actionData.nextCode;
        }

        this.previousWarehouseId = this.model.warehouseId;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.loading = false;
      }
    });
  }

  processViewResponse(res: SalesQuotationResponse): void {
    this.viewResponse = res;
    this.model = {
      ...res,
      postingDate: res.postingDate.split('T')[0],
      documentDate: res.documentDate.split('T')[0],
      dueDate: res.dueDate.split('T')[0],
      requiredDate: res.requiredDate ? res.requiredDate.split('T')[0] : undefined,
      lines: res.lines.map(l => ({
        id: l.id,
        itemId: l.itemId,
        warehouseId: l.warehouseId,
        lineNumber: l.lineNumber,
        description: l.description,
        quantity: l.quantity,
        unitOfMeasureId: l.unitOfMeasureId,
        uomConversionFactor: l.uomConversionFactor,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        discountAmount: l.discountAmount,
        taxPercent: l.taxPercent,
        taxAmount: l.taxAmount,
        lineTotalBeforeDiscount: l.lineTotalBeforeDiscount,
        lineTotalBeforeTax: l.lineTotalBeforeTax,
        lineTotal: l.lineTotal,
        lineDueDate: l.lineDueDate ? l.lineDueDate.split('T')[0] : undefined,
        status: l.lineStatus,
        notes: l.notes,
        // Add extra fields just for UI display
        _itemName: l.itemName,
        _itemCode: l.itemCode,
        _baseUomType: l.baseUomType,
        _discountFixedMode: 'percentage',
        _taxFixedMode: 'percentage'
      } as any))
    };
    this.recalculateTotals();
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.salesQuotationService.get(id).subscribe({
      next: (res: SalesQuotationResponse) => {
        this.processViewResponse(res);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: 'items' | 'additional'): void {
    this.activeTab = tab;
  }

  getUomOptions(baseUomType?: string): any[] {
    if (baseUomType === undefined || baseUomType === null) return this.uomOptions;
    return this.uomOptions.filter(u => u.baseUomType === baseUomType);
  }

  onWarehouseChange(newWarehouseId: number): void {
    if (this.mode === 'view') return;

    if (this.model.lines.length > 0 && this.previousWarehouseId !== undefined && newWarehouseId !== this.previousWarehouseId) {
      import('sweetalert2').then(Swal => {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.default.fire({
          title: this.translate.instant('common.cancelWarningTitle'),
          text: this.translate.instant('salesInvoices.errors.changeWarehouseWarning'), // Reuse translation
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: this.translate.instant('common.yes'),
          cancelButtonText: this.translate.instant('common.no'),
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#ffffff' : '#545454'
        }).then((result) => {
          if (result.isConfirmed) {
            this.model.lines = [];
            this.previousWarehouseId = newWarehouseId;
            this.recalculateTotals();
          } else {
            // Revert selection
            setTimeout(() => {
              this.model.warehouseId = this.previousWarehouseId;
            });
          }
        });
      });
    } else {
      this.previousWarehouseId = newWarehouseId;
    }
  }

  // Items Tab Actions
  openItemModal(): void {
    if (this.mode === 'view') return;
    if (!this.model.warehouseId) {
      this.validationErrors = [this.translate.instant('salesInvoices.errors.warehouseRequiredFirst')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }
    this.isItemModalOpen = true;
  }

  onItemSelected(item: ItemLookupResponse): void {
    const exists = this.model.lines.some((l: any) => l.itemId === item.id);
    if (exists) {
      this.validationErrors = [this.translate.instant('salesInvoices.errors.duplicateItem')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }

    this.model.lines.push({
      id: 0,
      itemId: item.id,
      warehouseId: this.model.warehouseId!,
      quantity: 1,
      unitPrice: item.salesPrice || 0, // Should be purchase price if available
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      lineNumber: this.model.lines.length + 1,
      uomConversionFactor: 1,
      unitOfMeasureId: item.purchaseUomId || undefined,
      description: item.name,
      lineTotalBeforeDiscount: 0,
      lineTotalBeforeTax: 0,
      lineTotal: 0,
      lineStatus: DocumentStatus.Open,
      // Internal properties for UI
      _itemCode: item.code,
      _itemName: item.name,
      _baseUomType: item.baseUomType,
      _discountFixedMode: 'percentage',
      _taxFixedMode: 'percentage',
      _isLoading: true,
      notes: ''
    } as any);
    this.form?.form.markAsDirty();
    this.recalculateTotals();

    this.itemService.get(item.id).subscribe({
      next: (details: any) => {
        const line = this.model.lines[this.model.lines.length - 1] as any;
        if (line) {
          line.unitOfMeasureId = details.salesUomId || line.unitOfMeasureId;
          line._baseUomType = details.baseUomType || line._baseUomType;
          if (details.salesPrice !== undefined && details.salesPrice !== null) {
            line.unitPrice = details.salesPrice;
          }
          if (details.unitsOfMeasure && details.unitsOfMeasure.length > 0) {
            line._availableUomsOptions = details.unitsOfMeasure.map((u: any) => ({ value: u.unitOfMeasureId, label: u.unitOfMeasureName }));
          }
          line._isLoading = false;
          this.recalculateTotals();
        }
      },
      error: (err: any) => {
        console.error('Error fetching sales details', err);
        const line = this.model.lines[this.model.lines.length - 1] as any;
        if (line) { line._isLoading = false; }
        this.recalculateTotals();
      }
    });
  }

  onDiscountPercentChange(index: number): void {
    const line = this.model.lines[index] as any;
    line._discountFixedMode = 'percentage';
    this.recalculateTotals();
  }

  onDiscountAmountChange(index: number): void {
    const line = this.model.lines[index] as any;
    line._discountFixedMode = 'amount';
    this.recalculateTotals();
  }

  onTaxPercentChange(index: number): void {
    const line = this.model.lines[index] as any;
    line._taxFixedMode = 'percentage';
    this.recalculateTotals();
  }

  onTaxAmountChange(index: number): void {
    const line = this.model.lines[index] as any;
    line._taxFixedMode = 'amount';
    this.recalculateTotals();
  }

  removeItem(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    this.form?.form.markAsDirty();
    this.recalculateTotals();
  }

  // Notes Modal Actions
  openLineNotesModal(index: number): void {
    if (this.mode === 'view') return;
    this.currentLineNotesIndex = index;
    this.currentLineNotes = this.model.lines[index].notes || '';
    this.isLineNotesModalOpen = true;
  }

  saveLineNotes(): void {
    if (this.currentLineNotesIndex > -1) {
      this.model.lines[this.currentLineNotesIndex].notes = this.currentLineNotes;
      this.form?.form.markAsDirty();
    }
    this.isLineNotesModalOpen = false;
  }

  recalculateTotals(): void {
    this.subTotal = 0;
    this.totalDiscount = 0;
    this.totalTax = 0;
    this.netTotal = 0;

    // Line items
    this.model.lines.forEach((line: any) => {
      const gross = line.quantity * line.unitPrice;
      line.lineTotalBeforeDiscount = gross;

      // Discount sync
      if (line._discountFixedMode === 'amount') {
        line.discountPercent = gross > 0 ? Number(((line.discountAmount / gross) * 100).toFixed(2)) : 0;
      } else {
        line.discountAmount = Number((gross * ((line.discountPercent || 0) / 100)).toFixed(2));
      }

      const discount = line.discountAmount || 0;
      const afterDiscount = gross - discount;
      line.lineTotalBeforeTax = afterDiscount;

      // Tax sync
      if (line._taxFixedMode === 'amount') {
        line.taxPercent = afterDiscount > 0 ? Number(((line.taxAmount / afterDiscount) * 100).toFixed(2)) : 0;
      } else {
        line.taxAmount = Number((afterDiscount * ((line.taxPercent || 0) / 100)).toFixed(2));
      }

      const tax = line.taxAmount || 0;
      const net = afterDiscount + tax;

      line.lineTotal = net;

      this.subTotal += gross;
      this.totalDiscount += discount;
      this.totalTax += tax;
    });

    this.netTotal = this.subTotal - this.totalDiscount + this.totalTax;

    // Update model totals
    this.model.totalBeforeDiscount = this.subTotal;
    this.model.discountAmount = this.totalDiscount;
    this.model.totalBeforeTax = this.subTotal - this.totalDiscount;
    this.model.taxAmount = this.totalTax;
    this.model.totalAmount = this.netTotal;
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.businessPartnerId) {
      this.validationErrors.push(`${this.translate.instant('common.customer')}: ${this.translate.instant('validation.required')}`);
    }
    if (!this.model.warehouseId) {
      this.validationErrors.push(`${this.translate.instant('salesInvoices.fields.warehouse')}: ${this.translate.instant('validation.required')}`);
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('salesInvoices.errors.atLeastOneItem'));
    } else {
      const invalidQuantity = this.model.lines.some((l: any) => l.quantity <= 0);
      if (invalidQuantity) {
        this.validationErrors.push(this.translate.instant('salesInvoices.errors.invalidQuantity'));
      }
      const invalidPrice = this.model.lines.some((l: any) => l.unitPrice <= 0);
      if (invalidPrice) {
        this.validationErrors.push(this.translate.instant('salesInvoices.errors.invalidPrice'));
      }
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    // Clean up internal _ UI properties before sending
    const requestToSend = JSON.parse(JSON.stringify(this.model));
    requestToSend.lines.forEach((l: any) => {
      delete l._itemName;
      delete l._itemCode;
      delete l._baseUomType;
      delete l._discountFixedMode;
      delete l._taxFixedMode;
      delete l._isLoading;
      delete l._availableUomsOptions;
    });

    const obs$: any = this.id
      ? this.salesQuotationService.update(this.id, requestToSend)
      : this.salesQuotationService.add(requestToSend);

    obs$.subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.errors) {
          this.validationErrors = Array.isArray(err.error.errors)
            ? err.error.errors.map((e: any) => e.errorMessage || e.description || JSON.stringify(e))
            : Object.values(err.error.errors).flat() as string[];
        } else if (err?.error?.message) {
          this.validationErrors = [err.error.message];
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    });
  }

  onConfirm(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesQuotations.confirmTitle');
    this.actionModalMessage = this.translate.instant('salesQuotations.confirmText');
    this.actionModalType = 'warning';
    this.actionModalConfirmText = this.translate.instant('common.confirm');
    this.pendingAction = 'confirm';
    this.isActionModalOpen = true;
  }

  onCancelDocument(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesQuotations.cancelTitle');
    this.actionModalMessage = this.translate.instant('salesQuotations.cancelText');
    this.actionModalType = 'danger';
    this.actionModalConfirmText = this.translate.instant('common.delete');
    this.pendingAction = 'cancel';
    this.isActionModalOpen = true;
  }

  onConvertToInvoice(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesQuotations.convertTitle');
    this.actionModalMessage = this.translate.instant('salesQuotations.convertText');
    this.actionModalType = 'info';
    this.actionModalConfirmText = this.translate.instant('salesQuotations.convertToInvoice');
    this.pendingAction = 'convert';
    this.isActionModalOpen = true;
  }

  executePendingAction(): void {
    if (!this.id || !this.pendingAction) return;
    this.isActionLoading = true;

    if (this.pendingAction === 'confirm') {
      this.salesQuotationService.confirm(this.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('salesQuotations.confirmedSuccess'));
          this.loadRecord(this.id!);
          this.isActionModalOpen = false;
          this.isActionLoading = false;
        },
        error: () => this.isActionLoading = false
      });
    } else if (this.pendingAction === 'cancel') {
      this.salesQuotationService.cancel(this.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('salesQuotations.cancelledSuccess'));
          this.loadRecord(this.id!);
          this.isActionModalOpen = false;
          this.isActionLoading = false;
        },
        error: () => this.isActionLoading = false
      });
    } else if (this.pendingAction === 'convert') {
      this.toastr.info('Conversion to Purchase Invoice will be supported soon.');
      this.isActionModalOpen = false;
      this.isActionLoading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/sales/sales-quotations']);
  }

  openPdfPreview(): void {
    if (!this.id) return;
    this.isPrintModalOpen = true;
    this.pdfLoading = true;

    // Placeholder for print
    setTimeout(() => {
      this.pdfLoading = false;
      this.toastr.info('Print preview is not implemented yet.');
      this.isPrintModalOpen = false;
    }, 1000);
  }

  closePrintModal(): void {
    this.isPrintModalOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  hasUnsavedChanges(): boolean {
    return this.mode !== 'view' && !!this.form && !!this.form.dirty && !this.saveSuccess;
  }

  getUnsavedChangesMessage(): string {
    return this.translate.instant('common.unsavedChangesMessage');
  }

  confirmDeactivation(): Promise<boolean> {
    this.showLeaveConfirmation = true;
    return new Promise(resolve => {
      this.leaveConfirmationResolver = resolve;
    });
  }

  onConfirmLeave(): void {
    this.showLeaveConfirmation = false;
    if (this.leaveConfirmationResolver) {
      this.leaveConfirmationResolver(true);
      this.leaveConfirmationResolver = null;
    }
  }

  onCancelLeave(): void {
    this.showLeaveConfirmation = false;
    if (this.leaveConfirmationResolver) {
      this.leaveConfirmationResolver(false);
      this.leaveConfirmationResolver = null;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = this.getUnsavedChangesMessage();
    }
  }
}


