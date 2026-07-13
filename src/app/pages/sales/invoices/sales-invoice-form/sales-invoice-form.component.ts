import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { CostElementLookupModalComponent } from '../../../../shared/components/lookups/cost-element-lookup-modal/cost-element-lookup-modal.component';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { DocumentStatusBadgeComponent } from '../../../../shared/components/common/document-status-badge/document-status-badge.component';
import { StatusBadgeComponent } from '../../../../shared/components/ui/status-badge/status-badge.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import {
  InvoiceRequest,
  InvoiceResponse,
  InvoiceType,
  DocumentStatus,
  InvoiceLineRequest,
  InvoiceCostLineRequest,
  InvoiceCostOperation,
  PaymentMethod
} from '../../../../core/models/invoice.model';
import { ItemLookupResponse, InvoiceCostElementDropdown } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-sales-invoice-form',
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
    CostElementLookupModalComponent,
    PaymentModalComponent,
    DocumentStatusBadgeComponent,
    StatusBadgeComponent
  ],
  templateUrl: './sales-invoice-form.component.html',
})
export class SalesInvoiceFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;

  private invoiceService = inject(InvoiceService);
  private lookupService = inject(LookupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'view' = 'add'; // Note: no edit mode
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  showLeaveConfirmation = false;
  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  activeTab: 'items' | 'cost-elements' = 'items';
  isItemModalOpen = false;
  isCostElementModalOpen = false;
  isPaymentModalOpen = false;

  model: InvoiceRequest = {
    code: '',
    invoiceType: InvoiceType.Sales,
    businessPartnerId: 0,
    currencyId: undefined,
    branchId: undefined,
    warehouseId: undefined,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: undefined,
    notes: '',
    lines: [],
    costLines: []
  };

  viewResponse?: InvoiceResponse;

  // Options for Dropdowns
  partnersOptions: SearchableOption[] = [];
  warehousesOptions: SearchableOption[] = [];

  // Totals calculated on the fly
  subTotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  netTotal = 0;

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'view') this.mode = 'view';
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
    const action$ = this.id ? this.invoiceService.get(this.id) : this.invoiceService.getNextCode();

    forkJoin({
      customers: customers$,
      warehouses: warehouses$,
      actionData: action$
    }).subscribe({
      next: (res: any) => {
        this.partnersOptions = res.customers.map((v: any) => ({ value: v.id, label: `${v.code} - ${v.name}` }));
        this.warehousesOptions = res.warehouses.map((w: any) => ({ value: w.id, label: w.name }));

        if (this.id) {
          this.processViewResponse(res.actionData as InvoiceResponse);
        } else {
          this.model.code = res.actionData.nextCode;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.loading = false;
      }
    });
  }

  processViewResponse(res: InvoiceResponse): void {
    this.viewResponse = res;
    this.model = {
      code: res.code,
      invoiceType: res.invoiceType,
      businessPartnerId: res.businessPartnerId,
      currencyId: res.currencyId,
      branchId: res.branchId,
      warehouseId: res.warehouseId,
      invoiceDate: res.invoiceDate.split('T')[0],
      dueDate: res.dueDate ? res.dueDate.split('T')[0] : undefined,
      notes: res.notes,
      lines: res.lines.map(l => ({
        itemId: l.itemId,
        uomId: l.uomId,
        warehouseId: l.warehouseId,
        binLocationId: l.binLocationId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
        lineOrder: l.lineOrder,
        notes: l.notes,
        // Add extra fields just for UI display
        _itemName: l.itemName,
        _itemCode: l.itemCode,
        _netAmount: l.netAmount,
        _discountAmount: 0,
        _taxAmount: 0,
        _discountFixedMode: 'percentage',
        _taxFixedMode: 'percentage'
      } as any)),
      costLines: res.costLines.map(c => ({
        invoiceCostElementId: c.invoiceCostElementId,
        amount: c.amount,
        percentage: c.percentage,
        notes: c.notes,
        // Add extra fields just for UI display
        _name: c.invoiceCostElementName,
        _operationType: c.invoiceCostOperation,
        _fixedMode: 'amount'
      } as any))
    };
    this.recalculateTotals();
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.invoiceService.get(id).subscribe({
      next: (res: InvoiceResponse) => {
        this.processViewResponse(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: 'items' | 'cost-elements'): void {
    this.activeTab = tab;
  }

  // Items Tab Actions
  openItemModal(): void {
    if (this.mode === 'view') return;
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
      itemId: item.id,
      quantity: 1,
      unitPrice: item.salesPrice || 0,
      discountPercent: 0,
      taxPercent: 0,
      lineOrder: this.model.lines.length + 1,
      // Internal properties for UI
      _itemCode: item.code,
      _itemName: item.name,
      _netAmount: 0,
      _discountAmount: 0,
      _taxAmount: 0,
      _discountFixedMode: 'percentage',
      _taxFixedMode: 'percentage'
    } as any);
    this.form?.form.markAsDirty();
    this.recalculateTotals();
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

  // Cost Elements Tab Actions
  openCostElementModal(): void {
    if (this.mode === 'view') return;
    this.isCostElementModalOpen = true;
  }

  onCostElementSelected(element: InvoiceCostElementDropdown): void {
    const exists = this.model.costLines.some((c: any) => c.invoiceCostElementId === element.id);
    if (exists) {
      this.validationErrors = [this.translate.instant('salesInvoices.errors.duplicateCostElement')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }

    this.model.costLines.push({
      invoiceCostElementId: element.id,
      amount: 0,
      percentage: element.defaultPercentage || 0,
      // Internal properties for UI
      _name: element.name,
      _operationType: element.operationType,
      _fixedMode: 'percentage'
    } as any);
    this.form?.form.markAsDirty();
    this.recalculateTotals();
  }

  onCostPercentageChange(index: number): void {
    const cost = this.model.costLines[index] as any;
    cost._fixedMode = 'percentage';
    this.recalculateTotals();
  }

  onCostAmountChange(index: number): void {
    const cost = this.model.costLines[index] as any;
    cost._fixedMode = 'amount';
    this.recalculateTotals();
  }

  removeCostElement(index: number): void {
    if (this.mode === 'view') return;
    this.model.costLines.splice(index, 1);
    this.form?.form.markAsDirty();
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    this.subTotal = 0;
    this.totalDiscount = 0;
    this.totalTax = 0;
    this.netTotal = 0;

    // Line items
    this.model.lines.forEach((line: any) => {
      const gross = line.quantity * line.unitPrice;

      // Discount sync
      if (line._discountFixedMode === 'amount') {
        line.discountPercent = gross > 0 ? Number(((line._discountAmount / gross) * 100).toFixed(2)) : 0;
      } else {
        line._discountAmount = Number((gross * ((line.discountPercent || 0) / 100)).toFixed(2));
      }

      const discount = line._discountAmount || 0;
      const afterDiscount = gross - discount;

      // Tax sync
      if (line._taxFixedMode === 'amount') {
        line.taxPercent = afterDiscount > 0 ? Number(((line._taxAmount / afterDiscount) * 100).toFixed(2)) : 0;
      } else {
        line._taxAmount = Number((afterDiscount * ((line.taxPercent || 0) / 100)).toFixed(2));
      }

      const tax = line._taxAmount || 0;
      const net = afterDiscount + tax;

      line._netAmount = net;

      this.subTotal += gross;
      this.totalDiscount += discount;
      this.totalTax += tax;
    });

    // Items Net Total for cost calculation
    const itemsNetTotal = this.model.lines.reduce((sum: any, line: any) => sum + (line['_netAmount'] || 0), 0);

    // Cost elements
    let additionalCosts = 0;
    this.model.costLines.forEach((cost: any) => {
      // Sync percentage & amount
      if (cost._fixedMode === 'amount') {
        cost.percentage = itemsNetTotal > 0 ? Number(((cost.amount / itemsNetTotal) * 100).toFixed(2)) : 0;
      } else {
        cost.amount = Number(((cost.percentage / 100) * itemsNetTotal).toFixed(2));
      }

      if (cost._operationType === 'Addition') {
        additionalCosts += cost.amount;
      } else if (cost._operationType === 'Discount' || cost._operationType === 'Deduction') {
        this.totalDiscount += cost.amount;
      }
    });

    // Combine item taxes and cost element additions into totalTax (which represents additionalAmount in UI)
    this.totalTax += additionalCosts;

    this.netTotal = this.subTotal - this.totalDiscount + this.totalTax;
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.businessPartnerId) {
      this.validationErrors.push(`${this.translate.instant('salesInvoices.fields.businessPartner')}: ${this.translate.instant('validation.required')}`);
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
      delete l._netAmount;
    });
    requestToSend.costLines.forEach((c: any) => {
      delete c._name;
      delete c._operationType;
    });

    this.invoiceService.add(requestToSend).subscribe({
      next: (res) => {
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

  onPaymentAdded(): void {
    if (this.id) {
      this.loadRecord(this.id);
    }
  }

  onConfirm(): void {
    if (!this.id) return;
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: this.translate.instant('common.confirmTitle'),
        text: this.translate.instant('common.confirmWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: this.translate.instant('stockAdjustments.confirm'),
        cancelButtonText: this.translate.instant('login.cancel')
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoiceService.confirm(this.id!).subscribe({
            next: () => {
              this.loadRecord(this.id!);
            }
          });
        }
      });
    });
  }

  onCancelDocument(): void {
    if (!this.id) return;
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: this.translate.instant('common.cancelWarningTitle'),
        text: this.translate.instant('common.cancelWarningText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: this.translate.instant('common.delete'),
        cancelButtonText: this.translate.instant('login.cancel')
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoiceService.cancel(this.id!).subscribe({
            next: () => {
              this.loadRecord(this.id!);
            }
          });
        }
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoices/sales']);
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
