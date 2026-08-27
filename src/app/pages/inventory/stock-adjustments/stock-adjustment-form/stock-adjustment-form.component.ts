import { DocumentStatusBadgeComponent } from '../../../../shared/components/common/document-status-badge/document-status-badge.component';
import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { StockAdjustmentService } from '../../../../core/services/stock-adjustment.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { StockAdjustmentRequest, StockAdjustmentResponse, StockAdjustmentType } from '../../../../core/models/inventory.model';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';
import { ItemService } from '../../../../core/services/item.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-stock-adjustment-form',
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
    ConfirmationModalComponent],
  templateUrl: './stock-adjustment-form.component.html',
})
export class StockAdjustmentFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;
  private stockAdjustmentService = inject(StockAdjustmentService);
  private lookupService = inject(LookupService);
  private itemService = inject(ItemService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  id: number | null = null;
  mode: 'add' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  showLeaveConfirmation = false;
  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  isItemModalOpen = false;

  showConfirmationModal = false;
  confirmationActionId: string | null = null;
  confirmTitle = 'common.confirm';
  confirmMessage = 'common.confirmTransaction';
  confirmType: 'warning' | 'danger' | 'info' | 'success' = 'warning';

  model: StockAdjustmentRequest = {
    adjustmentType: StockAdjustmentType.Inventory,
    warehouseId: 0,
    adjustmentDate: new Date().toISOString().split('T')[0],
    reason: '',
    lines: []
  };

  viewResponse?: StockAdjustmentResponse;

  warehousesOptions: SearchableOption[] = [];
  adjustmentTypeOptions: SearchableOption[] = [];
  uomOptions: SearchableOption[] = [];

  getUomOptions(baseUomType?: string): SearchableOption[] {
    if (baseUomType === undefined || baseUomType === null) return this.uomOptions;
    return this.uomOptions.filter((u: any) => u.baseUomType === baseUomType);
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
    }

    this.adjustmentTypeOptions = [
      { value: StockAdjustmentType.Inventory, label: this.translate.instant('stockAdjustments.types.inventory') },
      { value: StockAdjustmentType.Adjustment, label: this.translate.instant('stockAdjustments.types.adjustment') }
    ];

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;

    const warehouses$ = this.lookupService.getWarehouses();
    const uoms$ = this.lookupService.getUnitOfMeasures();

    forkJoin({
      warehouses: warehouses$,
      uoms: uoms$
    }).subscribe({
      next: (res: any) => {
        this.warehousesOptions = res.warehouses.map((w: any) => ({ value: w.id, label: w.name }));
        this.uomOptions = res.uoms.map((u: any) => ({ value: u.id, label: u.name, baseUomType: (u as any).baseUomType }));

        if (this.id) {
          this.loadRecord(this.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.loading = false;
      }
    });
  }

  processViewResponse(res: StockAdjustmentResponse): void {
    this.viewResponse = res;
    this.model = {
      adjustmentType: res.adjustmentType,
      warehouseId: res.warehouseId,
      adjustmentDate: res.adjustmentDate.split('T')[0],
      reason: res.reason,
      lines: res.lines.map(l => {
        const lineItem: any = {
          itemId: l.itemId,
          binLocationId: l.binLocationId,
          uomId: l.uomId,
          systemQuantity: l.systemQuantity,
          countedQuantity: l.countedQuantity,
          lineOrder: l.lineOrder,
          _itemCode: l.itemCode,
          _itemName: l.itemName,
          _availableUomsOptions: l.uomId && l.uomName ? [{ value: l.uomId, label: l.uomName }] : [],
          _difference: l.difference
        };

        if (l.itemId) {
          this.itemService.getSalesDetails(l.itemId).subscribe({
            next: (details: any) => {
              const uoms = details.availableUoms || details.unitsOfMeasure || [];
              if (uoms && uoms.length > 0) {
                lineItem._availableUomsOptions = uoms.map((u: any) => ({
                  value: u.id || u.unitOfMeasureId,
                  label: u.name || u.unitOfMeasureName || u.aName
                }));
              }
            }
          });
        }

        return lineItem;
      })
    };
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.stockAdjustmentService.get(id).subscribe({
      next: (res: StockAdjustmentResponse) => {
        this.processViewResponse(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  openItemModal(): void {
    if (this.mode === 'view') return;
    this.isItemModalOpen = true;
  }

  onItemSelected(item: ItemLookupResponse): void {
    const exists = this.model.lines.some((l: any) => l.itemId === item.id);
    if (exists) {
      this.validationErrors = [this.translate.instant('stockAdjustments.errors.duplicateItem')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }

    const defaultUomId = item.inventoryUomId || item.salesUomId || item.purchaseUomId || undefined;
    const defaultUomName = item.inventoryUomName || item.salesUomName || item.purchaseUomName || '';

    const newLine: any = {
      itemId: item.id,
      uomId: defaultUomId,
      systemQuantity: 0,
      countedQuantity: 0,
      lineOrder: this.model.lines.length + 1,
      _itemCode: item.code,
      _itemName: item.name,
      _baseUomType: item.baseUomType,
      _availableUomsOptions: defaultUomId && defaultUomName ? [{ value: defaultUomId, label: defaultUomName }] : [],
      _difference: 0
    };

    this.model.lines.push(newLine);
    this.form?.form.markAsDirty();

    this.itemService.getSalesDetails(item.id).subscribe({
      next: (details: any) => {
        newLine.uomId = details.inventoryUomId || details.salesUomId || defaultUomId || newLine.uomId;
        newLine._baseUomType = details.baseUomType || item.baseUomType || newLine._baseUomType;
        const uoms = details.availableUoms || details.unitsOfMeasure || [];
        if (uoms && uoms.length > 0) {
          newLine._availableUomsOptions = uoms.map((u: any) => ({
            value: u.id || u.unitOfMeasureId,
            label: u.name || u.unitOfMeasureName || u.aName
          }));
        }
      },
      error: (err: any) => {
        console.error('Error fetching UOM details for item', err);
      }
    });
  }

  onQuantityChange(index: number): void {
    const line = this.model.lines[index] as any;
    line._difference = line.countedQuantity - line.systemQuantity;
  }

  removeItem(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    this.form?.form.markAsDirty();
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.warehouseId) {
      this.validationErrors.push(`${this.translate.instant('stockAdjustments.warehouse')}: ${this.translate.instant('validation.required')}`);
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('stockAdjustments.errors.atLeastOneItem'));
    } else {
      this.model.lines.forEach((l: any, idx: number) => {
        const lineNum = idx + 1;
        const rowPrefix = `${this.translate.instant('common.row')} ${lineNum}`;

        if (!l.uomId) {
          this.validationErrors.push(`${rowPrefix}: ${this.translate.instant('common.unitOfMeasure')} ${this.translate.instant('common.uomRequired')}`);
        }
      });
    }
    return this.validationErrors.length === 0;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    const requestToSend = JSON.parse(JSON.stringify(this.model));
    requestToSend.lines.forEach((l: any) => {
      delete l._itemName;
      delete l._itemCode;
      delete l._difference;
      delete l._baseUomType;
      delete l._availableUomsOptions;
    });

    this.stockAdjustmentService.create(requestToSend).subscribe({
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

  onConfirm(): void {
    if (!this.id) return;
    this.confirmationActionId = 'confirm';
    this.confirmTitle = 'stockAdjustments.confirm';
    this.confirmMessage = 'common.confirmTransaction';
    this.confirmType = 'info';
    this.showConfirmationModal = true;
  }

  onCancelDocument(): void {
    if (!this.id) return;
    this.confirmationActionId = 'cancel';
    this.confirmTitle = this.translate.instant('stockAdjustments.cancelWarningTitle') || 'Cancel Warning';
    this.confirmMessage = this.translate.instant('stockAdjustments.cancelWarningText') || 'Are you sure you want to cancel?';
    this.confirmType = 'danger';
    this.showConfirmationModal = true;
  }

  onProceedConfirm(): void {
    if (!this.id || !this.confirmationActionId) return;
    this.saving = true;

    if (this.confirmationActionId === 'confirm') {
      this.stockAdjustmentService.confirm(this.id).subscribe({
        next: () => {
          this.saving = false;
          this.showConfirmationModal = false;
          this.toastr.success(this.translate.instant('common.updatedSuccessfully') || 'Updated successfully');
          this.loadRecord(this.id!);
        },
        error: (err) => {
          this.saving = false;
          this.showConfirmationModal = false;
          console.error(err);
        }
      });
    } else if (this.confirmationActionId === 'cancel') {
      this.stockAdjustmentService.cancel(this.id).subscribe({
        next: () => {
          this.saving = false;
          this.showConfirmationModal = false;
          this.toastr.success(this.translate.instant('common.updatedSuccessfully') || 'Updated successfully');
          this.loadRecord(this.id!);
        },
        error: (err) => {
          this.saving = false;
          this.showConfirmationModal = false;
          console.error(err);
        }
      });
    }
  }

  onCancelConfirmModal(): void {
    this.showConfirmationModal = false;
    this.confirmationActionId = null;
  }

  onCancel(): void {
    this.router.navigate(['/inventory/stock-adjustments']);
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
