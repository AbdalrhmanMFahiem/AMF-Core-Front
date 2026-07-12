import { DocumentStatusBadgeComponent } from '../../../../shared/components/common/document-status-badge/document-status-badge.component';
import { Component, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { InventoryCountService } from '../../../../core/services/inventory-count.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-inventory-count-form',
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
  , DocumentStatusBadgeComponent],
  templateUrl: './inventory-count-form.component.html'
})
export class InventoryCountFormComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('form') form!: NgForm;
  private inventoryCountService = inject(InventoryCountService);
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

  model: any = {
    warehouseId: 0,
    countDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: []
  };

  viewResponse?: any;
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

    forkJoin({ warehouses: warehouses$ }).subscribe({
      next: (res: any) => {
        this.warehousesOptions = res.warehouses.map((w: any) => ({ value: w.id, label: w.name }));
        if (this.id) this.loadRecord(this.id);
        else this.loading = false;
      },
      error: (err) => {
        console.error('Error loading initial data', err);
        this.loading = false;
      }
    });
  }

  processViewResponse(res: any): void {
    this.viewResponse = res;
    this.model = {
      warehouseId: res.warehouseId,
      countDate: res.countDate.split('T')[0],
      description: res.description,
      lines: res.lines.map((l: any) => ({
        itemId: l.itemId,
        actualQuantity: l.actualQuantity,
        systemQuantity: l.systemQuantity,
        difference: l.difference,
        uomId: l.uomId,
        binLocationId: l.binLocationId,
        lineOrder: l.lineOrder,
        notes: l.notes,
        _itemCode: l.itemCode,
        _itemName: l.itemName
      }))
    };
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.inventoryCountService.get(id).subscribe({
      next: (res: any) => {
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
      actualQuantity: 0,
      systemQuantity: 0, // In a real scenario, this might be fetched from the backend.
      difference: 0,
      lineOrder: this.model.lines.length + 1,
      _itemCode: item.code,
      _itemName: item.name
    });
    this.form?.form.markAsDirty();
  }

  removeItem(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    this.form?.form.markAsDirty();
  }

  calculateDifference(line: any): void {
     // System quantity is normally fetched from server before saving, but for local input we just pass actual.
     // In view mode, we see the difference from the server.
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.model.warehouseId) {
      this.validationErrors.push(`${this.translate.instant('stockVouchers.fields.warehouse')}: ${this.translate.instant('common.required')}`);
    }
    if (!this.model.lines || this.model.lines.length === 0) {
      this.validationErrors.push(this.translate.instant('stockTransfers.errors.atLeastOneItem'));
    } else {
      const invalidQuantity = this.model.lines.some((l: any) => l.actualQuantity < 0);
      if (invalidQuantity) {
        this.validationErrors.push(this.translate.instant('inventoryCounts.errors.invalidQuantity'));
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

    this.inventoryCountService.create(requestToSend).subscribe({
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
          this.validationErrors = [this.translate.instant('common.errorSavingData')];
        }
      }
    });
  }

  onConfirm(): void {
    if (!this.id) return;
    this.saving = true;
    this.inventoryCountService.confirm(this.id).subscribe({
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

  onCancelCount(): void {
    if (!this.id) return;
    this.saving = true;
    this.inventoryCountService.cancel(this.id).subscribe({
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
    this.router.navigate(['/inventory/inventory-counts']);
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
