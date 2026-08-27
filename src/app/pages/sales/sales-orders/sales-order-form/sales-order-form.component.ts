import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { SalesOrderService } from '../../../../core/services/sales-order.service';
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
import { PrintPreviewModalComponent } from '../../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';
import { SqLinesImportModalComponent } from '../../../../shared/components/lookups/sq-lines-import-modal/sq-lines-import-modal.component';
import { OpenSalesQuotationLineResponse } from '../../../../core/models/sales-quotation.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import {
  SalesOrderRequest,
  SalesOrderResponse,
  DocumentStatus,
  ApprovalStatus,
  SalesOrderLineRequest
} from '../../../../core/models/sales-order.model';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';
import { ToastrService } from 'ngx-toastr';

import { LineNotesModalComponent } from '../../../../shared/components/common/line-notes-modal/line-notes-modal.component';

import { CostElementLookupModalComponent } from '../../../../shared/components/lookups/cost-element-lookup-modal/cost-element-lookup-modal.component';
import { QuickCustomerModalComponent } from '../../../../shared/components/quick-customer-modal/quick-customer-modal.component';
import { InvoiceCostElementDropdown } from '../../../../core/models/lookup.model';
import { InvoiceCostLineRequest, InvoiceCostLineResponse } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-sales-order-form',
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
    DocumentStatusBadgeComponent,
    PrintPreviewModalComponent,
    ConfirmationModalComponent,
    SqLinesImportModalComponent,
    LineNotesModalComponent,
    QuickCustomerModalComponent
  ],
  templateUrl: './sales-order-form.component.html',
})
export class SalesOrderFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;

  private salesOrderService = inject(SalesOrderService);
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
  pendingAction: 'confirm' | 'cancel' | 'convert' | 'close' | null = null;

  showLeaveConfirmation = false;
  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  activeTab: 'items' | 'cost-elements' | 'additional' = 'items';
  isItemModalOpen = false;
  isCostElementModalOpen = false;

  // Line Notes Modal
  isLineNotesModalOpen = false;
  currentLineNotesIndex = -1;
  currentLineNotes = '';

  // SQ Import Modal
  isSqModalOpen = false;

  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;

  isQuickCustomerModalOpen = false;

  openQuickCustomerModal(): void {
    if (this.mode === 'view') return;
    this.isQuickCustomerModalOpen = true;
  }

  onCustomerCreated(newCustomer: any): void {
    this.lookupService.getCustomers().subscribe((customers: any[]) => {
      this.customersOptions = customers.map((v: any) => ({ value: v.id, label: `${v.code} - ${v.name}` }));
      this.model.businessPartnerId = newCustomer.id;
      this.form?.form.markAsDirty();
    });
  }

  model: SalesOrderRequest = {
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
    approvalStatus: ApprovalStatus.NotRequired,
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
    lines: [],
    costLines: []
  };

  viewResponse?: SalesOrderResponse;

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
    const action$ = this.id ? this.salesOrderService.get(this.id) : this.salesOrderService.getNextCode();

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
          this.processViewResponse(res.actionData as SalesOrderResponse);
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

  processViewResponse(res: SalesOrderResponse): void {
    this.viewResponse = res;
    this.model = {
      ...res,
      postingDate: res.postingDate.split('T')[0],
      documentDate: res.documentDate.split('T')[0],
      dueDate: res.dueDate.split('T')[0],
      requiredDate: res.requiredDate ? res.requiredDate.split('T')[0] : undefined,
      lines: res.lines.map(l => {
        const lineItem: any = {
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
          status: l.status,
          notes: l.notes,
          baseDocumentId: l.baseDocumentId,
          baseDocumentCode: l.baseDocumentCode || l.baseDocumentId,
          baseLineId: l.baseLineId,
          baseDocumentTypeId: l.baseDocumentTypeId,
          // Add extra fields just for UI display
          _itemName: l.itemName,
          _itemCode: l.itemCode,
          _baseDocumentCode: (l as any).baseDocumentCode || (l as any).salesQuotationCode || l.baseDocumentId,
          _baseUomType: l.baseUomType,
          _availableUomsOptions: l.unitOfMeasureId && (l.uomName || l.unitOfMeasureName) ? [{ value: l.unitOfMeasureId, label: (l.uomName || l.unitOfMeasureName)! }] : [],
          _discountFixedMode: 'percentage',
          _taxFixedMode: 'percentage'
        };

        if (l.itemId) {
          this.itemService.getSalesDetails(l.itemId).subscribe({
            next: (details: any) => {
              const uoms = details.availableUoms || details.unitsOfMeasure || [];
              if (uoms.length > 0) {
                lineItem._availableUomsOptions = uoms.map((u: any) => ({
                  value: u.id || u.unitOfMeasureId,
                  label: u.name || u.unitOfMeasureName || u.aName
                }));
              }
            }
          });
        }

        return lineItem;
      }),
      costLines: (res.costLines || []).map(c => ({
        invoiceCostElementId: c.invoiceCostElementId,
        amount: c.amount,
        percentage: c.percentage,
        notes: c.notes,
        _name: c.invoiceCostElementName,
        _operationType: c.invoiceCostOperation,
        _fixedMode: 'amount'
      } as any))
    };
    this.recalculateTotals();
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.salesOrderService.get(id).subscribe({
      next: (res: SalesOrderResponse) => {
        this.processViewResponse(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: 'items' | 'cost-elements' | 'additional'): void {
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
          text: this.translate.instant('salesOrders.errors.changeWarehouseWarning'),
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
      this.validationErrors = [this.translate.instant('salesOrders.errors.warehouseRequiredFirst')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }
    this.isItemModalOpen = true;
  }

  onItemSelected(item: ItemLookupResponse): void {
    const exists = this.model.lines.some((l: any) => l.itemId === item.id);
    if (exists) {
      this.validationErrors = [this.translate.instant('salesOrders.errors.duplicateItem')];
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
      unitOfMeasureId: item.salesUomId || item.purchaseUomId || undefined,
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

    this.itemService.getSalesDetails(item.id).subscribe({
      next: (details: any) => {
        const line = this.model.lines[this.model.lines.length - 1] as any;
        if (line) {
          line.unitOfMeasureId = details.salesUomId || item.salesUomId || line.unitOfMeasureId;
          line._baseUomType = details.baseUomType || item.baseUomType || line._baseUomType;
          if (details.salesPrice !== undefined && details.salesPrice !== null && details.salesPrice > 0) {
            line.unitPrice = details.salesPrice;
          }
          const uoms = details.availableUoms || details.unitsOfMeasure || [];
          if (uoms.length > 0) {
            line._availableUomsOptions = uoms.map((u: any) => ({
              value: u.id || u.unitOfMeasureId,
              label: u.name || u.unitOfMeasureName || u.aName
            }));
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

  get existingItemIds(): number[] {
    return (this.model.lines || []).map((l: any) => l.itemId).filter(id => !!id);
  }

  get referencedSqCodes(): string[] {
    const codes = new Set<string>();
    (this.model.lines || []).forEach((l: any) => {
      const code = l.baseDocumentCode || l.baseDocumentId || l._baseDocumentCode;
      if (code) codes.add(code);
    });
    return Array.from(codes);
  }

  // SQ Import Actions
  openSqModal(): void {
    if (this.mode === 'view') return;
    if (!this.model.businessPartnerId) {
      this.validationErrors = [this.translate.instant('salesOrders.errors.customerRequiredFirst')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }
    if (!this.model.warehouseId) {
      this.validationErrors = [this.translate.instant('salesOrders.errors.warehouseRequiredFirst')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }
    this.isSqModalOpen = true;
  }

  onSqLinesImported(lines: OpenSalesQuotationLineResponse[]): void {
    if (!lines || lines.length === 0) return;

    if (!this.model.warehouseId) {
      this.model.warehouseId = lines[0].warehouseId;
      this.previousWarehouseId = lines[0].warehouseId;
    }

    let hasDuplicate = false;
    const currentItemIds = new Set((this.model.lines || []).map((l: any) => l.itemId));

    lines.forEach(l => {
      if (currentItemIds.has(l.itemId)) {
        hasDuplicate = true;
        return;
      }
      currentItemIds.add(l.itemId);

      const lineId = l.salesQuotationLineId ?? (l as any).id ?? (l as any).baseLineId;
      const docCode = l.salesQuotationCode ?? (l as any).baseDocumentId ?? (l as any).code ?? '';
      const qtyToImport = l.quantity ?? l.importQuantity ?? l.openQuantity;

      this.model.lines.push({
        id: 0,
        itemId: l.itemId,
        warehouseId: l.warehouseId,
        quantity: qtyToImport,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        discountAmount: 0,
        taxPercent: l.taxPercent,
        taxAmount: 0,
        lineNumber: this.model.lines.length + 1,
        uomConversionFactor: 1,
        unitOfMeasureId: l.unitOfMeasureId,
        description: l.itemName,
        lineTotalBeforeDiscount: 0,
        lineTotalBeforeTax: 0,
        lineTotal: 0,
        status: DocumentStatus.Open,
        baseDocumentId: docCode ? docCode.toString() : '',
        baseDocumentCode: docCode ? docCode.toString() : '',
        baseLineId: lineId !== undefined && lineId !== null ? lineId.toString() : '',
        baseDocumentTypeId: 2, // 2 = Sales Quotation
        notes: l.notes,
        // UI
        _itemCode: l.itemCode,
        _itemName: l.itemName,
        _baseDocumentCode: docCode,
        _baseUomType: 'Quantity',
        _availableUomsOptions: l.unitOfMeasureId && (l['uomName'] || l.unitOfMeasureName) ? [{ value: l.unitOfMeasureId, label: (l['uomName'] || l.unitOfMeasureName)! }] : [],
        _discountFixedMode: 'percentage',
        _taxFixedMode: 'percentage',
        _isLoading: false
      } as any);

      if (l.itemId) {
        const addedLine = this.model.lines[this.model.lines.length - 1] as any;
        this.itemService.getSalesDetails(l.itemId).subscribe({
          next: (details: any) => {
            addedLine._baseUomType = details.baseUomType || addedLine._baseUomType;
            const uoms = details.availableUoms || details.unitsOfMeasure || [];
            if (uoms.length > 0) {
              addedLine._availableUomsOptions = uoms.map((u: any) => ({
                value: u.id || u.unitOfMeasureId,
                label: u.name || u.unitOfMeasureName || u.aName
              }));
            }
          }
        });
      }
    });

    if (hasDuplicate) {
      this.validationErrors = [this.translate.instant('salesOrders.errors.duplicateItem')];
      setTimeout(() => this.validationErrors = [], 4000);
    }

    this.form?.form.markAsDirty();
    this.recalculateTotals();
  }

  // Notes Modal Actions
  currentLineItemCode?: string;
  currentLineItemName?: string;

  openLineNotesModal(index: number): void {
    const line = this.model.lines[index] as any;
    if (!line) return;
    this.currentLineNotesIndex = index;
    this.currentLineNotes = line.notes || '';
    this.currentLineItemCode = line._itemCode;
    this.currentLineItemName = line._itemName;
    this.isLineNotesModalOpen = true;
  }

  onSaveLineNotes(updatedNotes: string): void {
    if (this.currentLineNotesIndex >= 0 && this.model.lines[this.currentLineNotesIndex]) {
      (this.model.lines[this.currentLineNotesIndex] as any).notes = updatedNotes;
      this.form?.form.markAsDirty();
    }
    this.isLineNotesModalOpen = false;
  }

  // Cost Elements Tab Actions
  openCostElementModal(): void {
    if (this.mode === 'view') return;
    this.isCostElementModalOpen = true;
  }

  onCostElementSelected(element: InvoiceCostElementDropdown): void {
    if (!this.model.costLines) this.model.costLines = [];
    const exists = this.model.costLines.some((c: any) => c.invoiceCostElementId === element.id);
    if (exists) {
      this.validationErrors = [this.translate.instant('salesOrders.errors.duplicateCostElement')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }

    this.model.costLines.push({
      invoiceCostElementId: element.id,
      amount: 0,
      percentage: element.defaultPercentage || 0,
      _name: element.name,
      _operationType: element.operationType,
      _fixedMode: 'percentage'
    } as any);
    this.form?.form.markAsDirty();
    this.recalculateTotals();
  }

  onCostPercentageChange(index: number): void {
    if (!this.model.costLines) return;
    const cost = this.model.costLines[index] as any;
    cost._fixedMode = 'percentage';
    this.recalculateTotals();
  }

  onCostAmountChange(index: number): void {
    if (!this.model.costLines) return;
    const cost = this.model.costLines[index] as any;
    cost._fixedMode = 'amount';
    this.recalculateTotals();
  }

  removeCostElement(index: number): void {
    if (this.mode === 'view' || !this.model.costLines) return;
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

    const itemsNetTotal = this.model.lines.reduce((sum: any, line: any) => sum + (line.lineTotal || 0), 0);

    let additionalCosts = 0;
    if (this.model.costLines) {
      this.model.costLines.forEach((cost: any) => {
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
    }

    this.totalTax += additionalCosts;
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
      this.validationErrors.push(`${this.translate.instant('common.customer')}: ${this.translate.instant('common.pleaseFillRequiredFields')}`);
    }
    if (!this.model.warehouseId) {
      this.validationErrors.push(`${this.translate.instant('salesOrders.fields.warehouse')}: ${this.translate.instant('common.pleaseFillRequiredFields')}`);
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('salesOrders.errors.atLeastOneItem'));
    } else {
      // Check for duplicate items
      const itemIds = this.model.lines.map((l: any) => l.itemId).filter(id => !!id);
      const uniqueItemIds = new Set(itemIds);
      if (uniqueItemIds.size < itemIds.length) {
        this.validationErrors.push(this.translate.instant('salesOrders.errors.duplicateItem'));
      }

      this.model.lines.forEach((l: any, idx: number) => {
        const lineNum = idx + 1;
        const rowPrefix = `${this.translate.instant('common.row')} ${lineNum}`;

        if (!l.unitOfMeasureId) {
          this.validationErrors.push(`${rowPrefix}: ${this.translate.instant('common.unitOfMeasure')} ${this.translate.instant('common.uomRequired')}`);
        }
        if (l.quantity === undefined || l.quantity === null || l.quantity <= 0) {
          this.validationErrors.push(`${rowPrefix}: ${this.translate.instant('salesOrders.errors.invalidQuantity')}`);
        }
        if (l.unitPrice === undefined || l.unitPrice === null || l.unitPrice <= 0) {
          this.validationErrors.push(`${rowPrefix}: ${this.translate.instant('salesOrders.errors.invalidPrice')}`);
        }
      });
    }

    if (this.model.costLines && this.model.costLines.length > 0) {
      const costElementIds = this.model.costLines.map((c: any) => c.invoiceCostElementId).filter(id => !!id);
      const uniqueCostIds = new Set(costElementIds);
      if (uniqueCostIds.size < costElementIds.length) {
        this.validationErrors.push(this.translate.instant('salesOrders.errors.duplicateCostElement'));
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
    if (requestToSend.costLines) {
      requestToSend.costLines.forEach((c: any) => {
        delete c._name;
        delete c._operationType;
        delete c._fixedMode;
      });
    }

    const obs$: any = this.id
      ? this.salesOrderService.update(this.id, requestToSend)
      : this.salesOrderService.add(requestToSend);

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
    this.actionModalTitle = this.translate.instant('salesOrders.confirmTitle');
    this.actionModalMessage = this.translate.instant('salesOrders.confirmText');
    this.actionModalType = 'warning';
    this.actionModalConfirmText = this.translate.instant('common.confirm');
    this.pendingAction = 'confirm';
    this.isActionModalOpen = true;
  }

  onCancelDocument(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesOrders.cancelTitle');
    this.actionModalMessage = this.translate.instant('salesOrders.cancelText');
    this.actionModalType = 'danger';
    this.actionModalConfirmText = this.translate.instant('common.delete');
    this.pendingAction = 'cancel';
    this.isActionModalOpen = true;
  }

  onCloseDocument(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesOrders.closeTitle');
    this.actionModalMessage = this.translate.instant('salesOrders.closeText');
    this.actionModalType = 'warning';
    this.actionModalConfirmText = this.translate.instant('salesOrders.closeDocument');
    this.pendingAction = 'close';
    this.isActionModalOpen = true;
  }

  onConvertToInvoice(): void {
    if (!this.id) return;
    this.actionModalTitle = this.translate.instant('salesOrders.convertTitle');
    this.actionModalMessage = this.translate.instant('salesOrders.convertText');
    this.actionModalType = 'info';
    this.actionModalConfirmText = this.translate.instant('salesOrders.convertToInvoice');
    this.pendingAction = 'convert';
    this.isActionModalOpen = true;
  }

  executePendingAction(): void {
    if (!this.id || !this.pendingAction) return;
    this.isActionLoading = true;

    if (this.pendingAction === 'confirm') {
      this.salesOrderService.confirm(this.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('salesOrders.confirmedSuccess'));
          this.loadRecord(this.id!);
          this.isActionModalOpen = false;
          this.isActionLoading = false;
        },
        error: () => this.isActionLoading = false
      });
    } else if (this.pendingAction === 'cancel') {
      this.salesOrderService.cancel(this.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('salesOrders.cancelledSuccess'));
          this.loadRecord(this.id!);
          this.isActionModalOpen = false;
          this.isActionLoading = false;
        },
        error: () => this.isActionLoading = false
      });
    } else if (this.pendingAction === 'close') {
      this.salesOrderService.close(this.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('salesOrders.closedSuccess'));
          this.loadRecord(this.id!);
          this.isActionModalOpen = false;
          this.isActionLoading = false;
        },
        error: () => this.isActionLoading = false
      });
    } else if (this.pendingAction === 'convert') {
      this.toastr.info(this.translate.instant('salesOrders.conversionNotSupported'));
      this.isActionModalOpen = false;
      this.isActionLoading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/sales/sales-orders']);
  }


  openPdfPreview(): void {
    if (!this.id) return;
    this.isPrintModalOpen = true;
    this.pdfLoading = true;

    this.salesOrderService.printPdf(this.id).subscribe({
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


