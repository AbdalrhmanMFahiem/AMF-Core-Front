import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { StockTransferService } from '../../../../core/services/stock-transfer.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { StockTransferRequest, StockTransferResponse, StockTransferStatus } from '../../../../core/models/inventory.model';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-stock-transfer-form',
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
    ItemLookupModalComponent
  ],
  templateUrl: './stock-transfer-form.component.html',
})
export class StockTransferFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;
  private stockTransferService = inject(StockTransferService);
  private lookupService = inject(LookupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'view' = 'add'; 
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  showLeaveConfirmation = false;
  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  isItemModalOpen = false;

  model: StockTransferRequest = {
    fromWarehouseId: 0,
    toWarehouseId: 0,
    transferDate: new Date().toISOString().split('T')[0],
    lines: []
  };

  viewResponse?: StockTransferResponse;

  warehousesOptions: SearchableOption[] = [];

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

    const warehouses$ = this.lookupService.getWarehouses();

    forkJoin({
      warehouses: warehouses$
    }).subscribe({
      next: (res: any) => {
        this.warehousesOptions = res.warehouses.map((w: any) => ({ value: w.id, label: w.name }));

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

  processViewResponse(res: StockTransferResponse): void {
    this.viewResponse = res;
    this.model = {
      fromWarehouseId: res.fromWarehouseId,
      toWarehouseId: res.toWarehouseId,
      transferDate: res.transferDate.split('T')[0],
      lines: res.lines.map(l => ({
        itemId: l.itemId,
        quantity: l.quantity,
        uomId: l.uomId,
        fromBinLocationId: l.fromBinLocationId,
        toBinLocationId: l.toBinLocationId,
        lineOrder: l.lineOrder,
        _itemCode: l.itemCode,
        _itemName: l.itemName
      } as any))
    };
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.stockTransferService.get(id).subscribe({
      next: (res: StockTransferResponse) => {
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
      this.validationErrors = [this.translate.instant('stockTransfers.errors.duplicateItem')];
      setTimeout(() => this.validationErrors = [], 4000);
      return;
    }

    this.model.lines.push({
      itemId: item.id,
      quantity: 1,
      lineOrder: this.model.lines.length + 1,
      _itemCode: item.code,
      _itemName: item.name
    } as any);
    this.form?.form.markAsDirty();
  }

  removeItem(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    this.form?.form.markAsDirty();
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.fromWarehouseId) {
      this.validationErrors.push(`${this.translate.instant('stockTransfers.fromWarehouse')}: ${this.translate.instant('validation.required')}`);
    }
    if (!this.model.toWarehouseId) {
      this.validationErrors.push(`${this.translate.instant('stockTransfers.toWarehouse')}: ${this.translate.instant('validation.required')}`);
    }
    if (this.model.fromWarehouseId && this.model.toWarehouseId && this.model.fromWarehouseId === this.model.toWarehouseId) {
        this.validationErrors.push(this.translate.instant('stockTransfers.errors.sameWarehouse'));
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('stockTransfers.errors.atLeastOneItem'));
    } else {
      const invalidQuantity = this.model.lines.some((l: any) => l.quantity <= 0);
      if (invalidQuantity) {
        this.validationErrors.push(this.translate.instant('stockTransfers.errors.invalidQuantity'));
      }
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
    });

    this.stockTransferService.create(requestToSend).subscribe({
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
    this.saving = true;
    this.stockTransferService.confirm(this.id).subscribe({
        next: () => {
            this.saving = false;
            this.loadRecord(this.id!);
        },
        error: (err) => {
            this.saving = false;
            console.error(err);
        }
    });
  }

  onCancelTransfer(): void {
    if (!this.id) return;
    this.saving = true;
    this.stockTransferService.cancel(this.id).subscribe({
        next: () => {
            this.saving = false;
            this.loadRecord(this.id!);
        },
        error: (err) => {
            this.saving = false;
            console.error(err);
        }
    });
  }

  onCancel(): void {
    this.router.navigate(['/inventory/stock-transfers']);
  }

  hasUnsavedChanges(): boolean {
    return this.mode !== 'view' && !!this.form && !!this.form.dirty && !this.saveSuccess;
  }

  getUnsavedChangesMessage(): string {
    return this.translate.instant('Common.unsavedChangesMessage');
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
