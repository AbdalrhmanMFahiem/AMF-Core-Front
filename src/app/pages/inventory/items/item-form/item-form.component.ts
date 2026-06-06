import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ItemService } from '../../../../core/services/item.service';
import { ItemRequest } from '../../../../core/models/item.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { LookupsFilters, IdNameResponse, IntIdCodeNameResponse } from '../../../../core/models/lookup.model';
import { forkJoin } from 'rxjs';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComponentCardComponent, PageBreadcrumbComponent, SuccessRedirectBannerComponent, SearchableSelectComponent, ErrorBannerComponent],
  templateUrl: './item-form.component.html',
  styles: ``
})
export class ItemFormComponent implements OnInit {
  private itemService = inject(ItemService);
  private lookupService = inject(LookupService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];

  activeTab: 'basic' | 'purchasing' | 'sales' | 'inventory' | 'additional' = 'basic';
  tabsWithErrors: string[] = [];

  // Dropdown options
  uoms: IdNameResponse[] = [];
  warehouses: IdNameResponse[] = [];
  vendors: IntIdCodeNameResponse[] = [];
  itemGroups: IdNameResponse[] = [];
  itemProperties: IdNameResponse[] = [];

  uomsOptions: SearchableOption[] = [];
  warehousesOptions: SearchableOption[] = [];
  vendorsOptions: SearchableOption[] = [];
  itemGroupsOptions: SearchableOption[] = [];
  itemPropertiesOptions: SearchableOption[] = [];

  model: ItemRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    notes: '',
    itemGroupId: undefined,
    dfltWarehouseId: undefined,
    dfltWeight: 0,
    itemPropertyId: undefined,
    isActive: true,
    isPurchased: true,
    purchaseUomId: undefined,
    preferredVendorId: undefined,
    isSold: true,
    salesUomId: undefined,
    salesPrice: 0,
    isInventoryItem: true,
    inventoryUomId: undefined,
    minStockLevel: 0,
    maxStockLevel: 0,
    dfltTaxPercent: 0,
    barcode: '',
    foreignCode: ''
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadItem(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }

    this.loadLookups();
  }

  loadLookups(): void {
    forkJoin({
      units: this.lookupService.getUnitOfMeasures(),
      warehouses: this.lookupService.getWarehouses(),
      vendors: this.lookupService.getVendors(),
      groups: this.lookupService.getItemGroups(),
      properties: this.lookupService.getItemProperties()
    }).subscribe({
      next: (res) => {
        this.uoms = res.units || [];
        this.warehouses = res.warehouses || [];
        this.vendors = res.vendors || [];
        this.itemGroups = res.groups || [];
        this.itemProperties = res.properties || [];

        this.uomsOptions = this.uoms.map(u => ({ value: u.id, label: u.name }));
        this.warehousesOptions = this.warehouses.map(w => ({ value: w.id, label: w.name }));
        this.vendorsOptions = this.vendors.map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }));
        this.itemGroupsOptions = this.itemGroups.map(g => ({ value: g.id, label: g.name }));
        this.itemPropertiesOptions = this.itemProperties.map(p => ({ value: p.id, label: p.name }));
      },
      error: (err) => console.error('Failed to load lookups', err)
    });
  }

  loadItem(id: number): void {
    this.loading = true;
    this.itemService.get(id).subscribe({
      next: (res) => {
        this.model = {
          ...res,
          eName: res.eName || '',
          notes: res.notes || '',
          itemGroupId: res.itemGroupId,
          dfltWarehouseId: res.dfltWarehouseId,
          itemPropertyId: res.itemPropertyId,
          purchaseUomId: res.purchaseUomId,
          preferredVendorId: res.preferredVendorId,
          salesUomId: res.salesUomId,
          inventoryUomId: res.inventoryUomId,
          barcode: res.barcode,
          foreignCode: res.foreignCode
        };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getNextCode(): void {
    this.itemService.getNextCode().subscribe(res => {
      this.model.code = res.nextCode;
    });
  }

  setTab(tab: 'basic' | 'purchasing' | 'sales' | 'inventory' | 'additional'): void {
    this.activeTab = tab;
  }

  validate(): boolean {
    this.tabsWithErrors = [];
    this.validationErrors = [];
    let isValid = true;

    // Basic Validation
    if (!this.model.code) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('items.fields.code')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }
    if (!this.model.aName) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('items.fields.aName')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    // You can add more complex validations here (e.g. min/max stock)
    if (this.model.minStockLevel > this.model.maxStockLevel && this.model.isInventoryItem) {
      this.tabsWithErrors.push('inventory');
      this.validationErrors.push(this.translate.instant('errors.generic')); // Can map to specific translation later
      isValid = false;
    }

    if (!this.model.isPurchased && !this.model.isSold) {
      this.tabsWithErrors.push('purchasing', 'sales');
      this.validationErrors.push(this.translate.instant('validation.invalid'));
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) {
          this.validationErrors = [err.error.message];
        } else if (err?.error?.errors) {
          if (Array.isArray(err.error.errors)) {
            this.validationErrors = err.error.errors.map((e: any) => e.description || e.errorMessage || (typeof e === 'string' ? e : JSON.stringify(e)));
          } else {
            this.validationErrors = Object.values(err.error.errors).flat() as string[];
          }
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    };

    if (this.mode === 'add') {
      this.itemService.create(this.model).subscribe(observer);
    } else {
      this.itemService.update(this.id!, this.model).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/items']);
  }
}
