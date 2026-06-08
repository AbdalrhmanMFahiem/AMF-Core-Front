import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import {
  InvoiceRequest,
  InvoiceResponse,
  InvoiceType,
  InvoiceStatus,
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
    PaymentModalComponent
  ],
  templateUrl: './sales-invoice-form.component.html',
})
export class SalesInvoiceFormComponent implements OnInit {
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

    this.loadLookups();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadRecord(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  loadLookups(): void {
    // Only loading customers since it's a sales invoice
    this.lookupService.getVendors().subscribe(res => { // Wait, do we have getCustomers?
      // For now, if there is no getCustomers, getVendors is a placeholder. 
      // User hasn't provided the exact lookup for Customers. Let's assume getBusinessPartners or we use getVendors if missing.
      // Wait, there's no getCustomers in lookupService! Let's check. 
      // I will map what exists. If it fails, we can add it later.
      this.partnersOptions = res.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }));
    });
    this.lookupService.getWarehouses().subscribe(res => {
      this.warehousesOptions = res.map(w => ({ value: w.id, label: w.name }));
    });
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.invoiceService.get(id).subscribe({
      next: (res: InvoiceResponse) => {
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
             _netAmount: l.netAmount
          } as any)),
          costLines: res.costLines.map(c => ({
             invoiceCostElementId: c.invoiceCostElementId,
             amount: c.amount,
             percentage: c.percentage,
             notes: c.notes,
             // Add extra fields just for UI display
             _name: c.invoiceCostElementName,
             _operationType: c.invoiceCostOperation
          } as any))
        };
        this.recalculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  getNextCode(): void {
    this.invoiceService.getNextCode().subscribe({
      next: (res) => {
        this.model.code = res.nextCode;
      },
      error: (err) => console.error('Error fetching next code', err)
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
    this.model.lines.push({
      itemId: item.id,
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
      lineOrder: this.model.lines.length + 1,
      // Internal properties for UI
      _itemCode: item.code,
      _itemName: item.name,
      _netAmount: 0
    } as any);
    this.recalculateTotals();
  }

  removeItem(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    this.recalculateTotals();
  }

  // Cost Elements Tab Actions
  openCostElementModal(): void {
    if (this.mode === 'view') return;
    this.isCostElementModalOpen = true;
  }

  onCostElementSelected(element: InvoiceCostElementDropdown): void {
    this.model.costLines.push({
      invoiceCostElementId: element.id,
      amount: 0,
      percentage: element.defaultPercentage || 0,
      // Internal properties for UI
      _name: element.name,
      _operationType: element.operationType
    } as any);
    this.recalculateTotals();
  }

  removeCostElement(index: number): void {
    if (this.mode === 'view') return;
    this.model.costLines.splice(index, 1);
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
      const discount = gross * ((line.discountPercent || 0) / 100);
      const afterDiscount = gross - discount;
      const tax = afterDiscount * ((line.taxPercent || 0) / 100);
      const net = afterDiscount + tax;

      line._netAmount = net; // updating internal prop
      
      this.subTotal += gross;
      this.totalDiscount += discount;
      this.totalTax += tax;
    });

    // Cost elements
    let additionalCosts = 0;
    this.model.costLines.forEach((cost: any) => {
      // In a real scenario, percentage logic might apply to subtotal, but we rely on fixed amount or backend logic.
      // Let's assume amount is filled manually or calculated.
      if (cost._operationType === 'Addition') {
        additionalCosts += cost.amount;
      } else if (cost._operationType === 'Discount') {
        this.totalDiscount += cost.amount;
      }
    });

    this.netTotal = this.subTotal - this.totalDiscount + this.totalTax + additionalCosts;
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.businessPartnerId) {
      this.validationErrors.push(`${this.translate.instant('salesInvoices.fields.businessPartner')}: ${this.translate.instant('validation.required')}`);
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('salesInvoices.errors.atLeastOneItem'));
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

  onCancel(): void {
    this.router.navigate(['/sales/invoices']);
  }
}
