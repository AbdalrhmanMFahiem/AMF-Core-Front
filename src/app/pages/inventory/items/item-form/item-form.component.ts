import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';

import { ItemService } from '../../../../core/services/item.service';
import { UnitOfMeasureService } from '../../../../core/services/unit-of-measure.service';
import { LookupService } from '../../../../core/services/lookup.service';

import { ItemRequest, ItemUnitOfMeasureRequest, UomType, UOM_TYPE_CONFIG_LIST, UomTypeMeta, getUomTypeConfig } from '../../../../core/models/item.model';
import { UnitOfMeasure } from '../../../../core/models/uom.model';
import { IdNameResponse, IntIdCodeNameResponse } from '../../../../core/models/lookup.model';

export function syncLegacyUomFields(model: ItemRequest): ItemRequest {
  const units = model.unitsOfMeasure || [];

  if (model.isPurchased) {
    const purchaseDefault = units.find(u => u.isDefaultPurchaseUnit);
    if (purchaseDefault && purchaseDefault.unitOfMeasureId) {
      model.purchaseUomId = purchaseDefault.unitOfMeasureId;
    }
  } else {
    model.purchaseUomId = undefined;
  }

  if (model.isSold) {
    const salesDefault = units.find(u => u.isDefaultSalesUnit);
    if (salesDefault && salesDefault.unitOfMeasureId) {
      model.salesUomId = salesDefault.unitOfMeasureId;
    }
  } else {
    model.salesUomId = undefined;
  }

  if (model.isInventoryItem) {
    const baseUnit = units.find(u => u.isBaseUnit);
    if (baseUnit && baseUnit.unitOfMeasureId) {
      model.inventoryUomId = baseUnit.unitOfMeasureId;
    }
  } else {
    model.inventoryUomId = undefined;
  }

  return model;
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent,
    SearchableSelectComponent
  ],
  templateUrl: './item-form.component.html',
  styles: ``
})
export class ItemFormComponent implements OnInit {
  private itemService = inject(ItemService);
  private uomService = inject(UnitOfMeasureService);
  private lookupService = inject(LookupService);
  public translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  activeTab: 'basic' | 'uoms' | 'inventory' | 'sales' | 'purchasing' | 'additional' = 'basic';
  tabsWithErrors: string[] = [];

  selectedUomType: UomType | null = null;

  uomTypeOptions: UomTypeMeta[] = UOM_TYPE_CONFIG_LIST;

  // Available UOMs for the currently selected UomType
  availableTypeUoms: UnitOfMeasure[] = [];
  uomOptions: SearchableOption[] = [];

  // Dropdowns from LookupService
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
    baseUomType: undefined,
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
    foreignCode: '',
    unitsOfMeasure: []
  };

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    this.loadGeneralLookups();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadItem(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  loadGeneralLookups(): void {
    forkJoin({
      warehouses: this.lookupService.getWarehouses(),
      vendors: this.lookupService.getVendors(),
      groups: this.lookupService.getItemGroups(),
      properties: this.lookupService.getItemProperties()
    }).subscribe({
      next: (res) => {
        this.warehousesOptions = (res.warehouses || []).map(w => ({ value: w.id, label: w.name }));
        this.vendorsOptions = (res.vendors || []).map(v => ({ value: v.id, label: `${v.code} - ${v.name}` }));
        this.itemGroupsOptions = (res.groups || []).map(g => ({ value: g.id, label: g.name }));
        this.itemPropertiesOptions = (res.properties || []).map(p => ({ value: p.id, label: p.name }));
      },
      error: (err) => console.error('Failed to load lookups', err)
    });
  }

  loadItem(id: number): void {
    this.loading = true;
    forkJoin({
      item: this.itemService.get(id),
      uomLines: this.itemService.getUnitsOfMeasure(id)
    }).subscribe({
      next: (res) => {
        const item = res.item;
        const uomLines = res.uomLines || [];

        this.model = {
          id: item.id,
          code: item.code,
          aName: item.aName,
          eName: item.eName || '',
          notes: item.notes || '',
          baseUomType: item.baseUomType,
          itemGroupId: item.itemGroupId,
          dfltWarehouseId: item.dfltWarehouseId,
          dfltWeight: item.dfltWeight || 0,
          itemPropertyId: item.itemPropertyId,
          isActive: item.isActive,
          isPurchased: item.isPurchased,
          purchaseUomId: item.purchaseUomId,
          preferredVendorId: item.preferredVendorId,
          isSold: item.isSold,
          salesUomId: item.salesUomId,
          salesPrice: item.salesPrice || 0,
          isInventoryItem: item.isInventoryItem,
          inventoryUomId: item.inventoryUomId,
          minStockLevel: item.minStockLevel || 0,
          maxStockLevel: item.maxStockLevel || 0,
          dfltTaxPercent: item.dfltTaxPercent || 0,
          barcode: item.barcode || '',
          foreignCode: item.foreignCode || '',
          unitsOfMeasure: uomLines.map(u => ({
            id: u.id,
            unitOfMeasureId: u.unitOfMeasureId,
            conversionFactor: u.conversionFactor,
            isBaseUnit: u.isBaseUnit,
            isDefaultPurchaseUnit: u.isDefaultPurchaseUnit,
            isDefaultSalesUnit: u.isDefaultSalesUnit,
            barcode: u.barcode || ''
          }))
        };

        if (item.baseUomType) {
          this.selectedUomType = item.baseUomType;
          this.loadAvailableTypeUoms(item.baseUomType, false);
          this.loading = false;
        } else {
          // Determine UomType from base unit line if baseUomType is not set
          const baseLine = this.model.unitsOfMeasure.find(u => u.isBaseUnit);
          if (baseLine && baseLine.unitOfMeasureId) {
            this.uomService.getUnitOfMeasureById(baseLine.unitOfMeasureId).subscribe({
              next: (uom) => {
                if (uom && uom.uomType) {
                  this.selectedUomType = uom.uomType;
                  this.model.baseUomType = uom.uomType;
                  this.loadAvailableTypeUoms(uom.uomType, false);
                }
                this.loading = false;
              },
              error: () => {
                this.loading = false;
              }
            });
          } else {
            this.loading = false;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load item', err);
        this.loading = false;
      }
    });
  }

  getNextCode(): void {
    this.itemService.getNextCode().subscribe(res => {
      this.model.code = res.nextCode;
    });
  }

  onSelectUomType(type: UomType): void {
    if (this.mode === 'view') return;

    if (this.selectedUomType === type) return;

    if (this.model.unitsOfMeasure && this.model.unitsOfMeasure.length > 0) {
      Swal.fire({
        title: this.translate.instant('items.confirmChangeTypeTitle'),
        text: this.translate.instant('items.confirmChangeTypeText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('common.yes'),
        cancelButtonText: this.translate.instant('common.no'),
        customClass: {
          popup: 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-xl',
          title: 'text-xl font-semibold text-gray-800 dark:text-gray-100',
          htmlContainer: 'text-base text-gray-600 dark:text-gray-300',
          confirmButton: 'px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors',
          cancelButton: 'px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg ml-2 font-medium transition-colors'
        }
      }).then(result => {
        if (result.isConfirmed) {
          this.selectedUomType = type;
          this.model.baseUomType = type;
          this.model.unitsOfMeasure = [];
          this.loadAvailableTypeUoms(type, true);
        }
      });
    } else {
      this.selectedUomType = type;
      this.model.baseUomType = type;
      this.loadAvailableTypeUoms(type, true);
    }
  }

  loadAvailableTypeUoms(type: UomType, autoAddBase: boolean = false): void {
    this.lookupService.getUnitOfMeasureByType(type).subscribe({
      next: (list) => {
        this.availableTypeUoms = (list || []).map(u => ({
          id: u.id,
          code: u.code,
          aName: u.name,
          eName: u.name,
          uomType: u.uomType,
          isBaseUnit: u.isBaseUnit,
          conversionFactor: u.conversionFactor,
          notes: u.notes || '',
          isActive: u.isActive,
          tenantId: 0
        }));

        this.uomOptions = (list || []).map(u => ({
          value: u.id,
          label: `${u.code} - ${u.name}`
        }));

        if (autoAddBase && this.model.unitsOfMeasure.length === 0) {
          const baseUnit = this.availableTypeUoms.find(u => u.isBaseUnit);
          if (baseUnit) {
            this.model.unitsOfMeasure.push({
              unitOfMeasureId: baseUnit.id,
              conversionFactor: 1,
              isBaseUnit: true,
              isDefaultPurchaseUnit: true,
              isDefaultSalesUnit: true,
              barcode: ''
            });
            this.syncUoms();
          }
        }
      },
      error: (err) => console.error('Failed to load type UOMs', err)
    });
  }

  setTab(tab: 'basic' | 'uoms' | 'inventory' | 'sales' | 'purchasing' | 'additional'): void {
    if (tab !== 'basic' && !this.selectedUomType) {
      this.validationErrors = [this.translate.instant('items.uomTypeWarning')];
      return;
    }
    this.activeTab = tab;
  }

  addUomRow(): void {
    if (!this.selectedUomType) return;
    if (!this.model.unitsOfMeasure) {
      this.model.unitsOfMeasure = [];
    }

    const isFirst = this.model.unitsOfMeasure.length === 0;

    this.model.unitsOfMeasure.push({
      unitOfMeasureId: null as any,
      conversionFactor: isFirst ? 1 : 1,
      isBaseUnit: isFirst,
      isDefaultPurchaseUnit: isFirst,
      isDefaultSalesUnit: isFirst,
      barcode: ''
    });
    this.syncUoms();
  }

  removeUomRow(index: number): void {
    if (this.model.unitsOfMeasure) {
      this.model.unitsOfMeasure.splice(index, 1);
      this.syncUoms();
    }
  }

  onBaseUnitChange(index: number, isChecked: boolean): void {
    if (!this.model.unitsOfMeasure) return;

    if (isChecked) {
      this.model.unitsOfMeasure[index].conversionFactor = 1;
      this.model.unitsOfMeasure.forEach((uom, i) => {
        if (i !== index) uom.isBaseUnit = false;
      });
    }
    this.syncUoms();
  }

  onDefaultSalesChange(index: number, isChecked: boolean): void {
    if (!this.model.unitsOfMeasure) return;

    if (isChecked) {
      this.model.unitsOfMeasure.forEach((uom, i) => {
        if (i !== index) uom.isDefaultSalesUnit = false;
      });
    }
    this.syncUoms();
  }

  onDefaultPurchaseChange(index: number, isChecked: boolean): void {
    if (!this.model.unitsOfMeasure) return;

    if (isChecked) {
      this.model.unitsOfMeasure.forEach((uom, i) => {
        if (i !== index) uom.isDefaultPurchaseUnit = false;
      });
    }
    this.syncUoms();
  }

  onUomSelectionChange(index: number, uomId: number): void {
    if (!this.model.unitsOfMeasure || !this.model.unitsOfMeasure[index]) return;
    this.model.unitsOfMeasure[index].unitOfMeasureId = uomId;
    this.syncUoms();
  }

  onSalesUomDropdownChange(uomId: number): void {
    this.model.salesUomId = uomId;
    if (this.model.unitsOfMeasure) {
      this.model.unitsOfMeasure.forEach(u => {
        u.isDefaultSalesUnit = (u.unitOfMeasureId === uomId);
      });
    }
    this.syncUoms();
  }

  onPurchaseUomDropdownChange(uomId: number): void {
    this.model.purchaseUomId = uomId;
    if (this.model.unitsOfMeasure) {
      this.model.unitsOfMeasure.forEach(u => {
        u.isDefaultPurchaseUnit = (u.unitOfMeasureId === uomId);
      });
    }
    this.syncUoms();
  }

  onInventoryUomDropdownChange(uomId: number): void {
    this.model.inventoryUomId = uomId;
    this.syncUoms();
  }

  selectSuggestionChip(target: 'inventory' | 'sales' | 'purchasing', unitId: number): void {
    if (target === 'inventory') {
      this.onInventoryUomDropdownChange(unitId);
    } else if (target === 'sales') {
      this.onSalesUomDropdownChange(unitId);
    } else if (target === 'purchasing') {
      this.onPurchaseUomDropdownChange(unitId);
    }
  }

  syncUoms(): void {
    this.model = syncLegacyUomFields(this.model);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  get baseUnitLine(): ItemUnitOfMeasureRequest | undefined {
    return (this.model.unitsOfMeasure || []).find(u => u.isBaseUnit);
  }

  get baseUnitName(): string {
    if (!this.baseUnitLine || !this.baseUnitLine.unitOfMeasureId) return '';
    const uom = this.availableTypeUoms.find(u => u.id === this.baseUnitLine?.unitOfMeasureId);
    return uom ? uom.aName : '';
  }

  get smallestRetailLine(): ItemUnitOfMeasureRequest | undefined {
    const lines = (this.model.unitsOfMeasure || []).filter(u => u.unitOfMeasureId);
    if (!lines.length) return undefined;
    return lines.reduce((prev, curr) => (curr.conversionFactor < prev.conversionFactor ? curr : prev), lines[0]);
  }

  get smallestRetailName(): string {
    if (!this.smallestRetailLine || !this.smallestRetailLine.unitOfMeasureId) return '';
    const uom = this.availableTypeUoms.find(u => u.id === this.smallestRetailLine?.unitOfMeasureId);
    return uom ? uom.aName : '';
  }

  get largestWholesaleLine(): ItemUnitOfMeasureRequest | undefined {
    const lines = (this.model.unitsOfMeasure || []).filter(u => u.unitOfMeasureId);
    if (!lines.length) return undefined;
    return lines.reduce((prev, curr) => (curr.conversionFactor > prev.conversionFactor ? curr : prev), lines[0]);
  }

  get largestWholesaleName(): string {
    if (!this.largestWholesaleLine || !this.largestWholesaleLine.unitOfMeasureId) return '';
    const uom = this.availableTypeUoms.find(u => u.id === this.largestWholesaleLine?.unitOfMeasureId);
    return uom ? uom.aName : '';
  }

  getUomNameById(id?: number): string {
    if (!id) return '';
    const uom = this.availableTypeUoms.find(u => u.id === id);
    return uom ? uom.aName : '';
  }

  validate(): boolean {
    this.tabsWithErrors = [];
    this.validationErrors = [];
    let isValid = true;

    // 1. Basic Tab Rules
    if (!this.selectedUomType) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(this.translate.instant('items.uomTypeRequired'));
      isValid = false;
    }

    if (!this.model.code?.trim()) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('common.code')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    if (!this.model.aName?.trim()) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('items.fields.aName')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    if (!this.model.itemGroupId) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('items.fields.itemGroup')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    // 2. Business Rule: Must be purchased or sold
    if (!this.model.isPurchased && !this.model.isSold) {
      this.tabsWithErrors.push('purchasing', 'sales');
      this.validationErrors.push(this.translate.instant('items.errors.itemMustBePurchasedOrSold'));
      isValid = false;
    }

    // 3. Units of Measure Validation Rules
    const units = this.model.unitsOfMeasure || [];

    // Temporarily disabled validation rule
    // if (this.model.isInventoryItem && units.length === 0) {
    //   this.tabsWithErrors.push('uoms');
    //   this.validationErrors.push(this.translate.instant('items.errors.unitsOfMeasureRequired'));
    //   isValid = false;
    // }

    if (units.length > 0) {
      const baseCount = units.filter(u => u.isBaseUnit).length;
      if (baseCount !== 1) {
        this.tabsWithErrors.push('uoms');
        this.validationErrors.push(this.translate.instant('items.errors.exactlyOneBaseUnitRequired'));
        isValid = false;
      }

      const uomIds = units.map(u => u.unitOfMeasureId).filter(id => !!id);
      if (new Set(uomIds).size !== uomIds.length) {
        this.tabsWithErrors.push('uoms');
        this.validationErrors.push(this.translate.instant('items.errors.duplicateUnitsOfMeasure'));
        isValid = false;
      }

      const hasInvalidConversion = units.some(u => !u.isBaseUnit && (!u.conversionFactor || u.conversionFactor <= 0));
      if (hasInvalidConversion) {
        this.tabsWithErrors.push('uoms');
        this.validationErrors.push(this.translate.instant('items.errors.invalidConversionFactor'));
        isValid = false;
      }

      const purchaseDefaults = units.filter(u => u.isDefaultPurchaseUnit).length;
      if (purchaseDefaults > 1) {
        this.tabsWithErrors.push('uoms');
        this.validationErrors.push(this.translate.instant('items.errors.multipleDefaultPurchaseUnits'));
        isValid = false;
      }
      
      const salesDefaults = units.filter(u => u.isDefaultSalesUnit).length;
      if (salesDefaults > 1) {
        this.tabsWithErrors.push('uoms');
        this.validationErrors.push(this.translate.instant('items.errors.multipleDefaultSalesUnits'));
        isValid = false;
      }
    }

    if (this.model.isSold && !this.model.salesUomId) {
      this.tabsWithErrors.push('sales');
      this.validationErrors.push(this.translate.instant('items.errors.salesUomRequired') || 'Sales unit is required');
      isValid = false;
    }

    if (this.model.isPurchased && !this.model.purchaseUomId) {
      this.tabsWithErrors.push('purchasing');
      this.validationErrors.push(this.translate.instant('items.errors.purchaseUomRequired') || 'Purchase unit is required');
      isValid = false;
    }

    if (this.model.isInventoryItem && !this.model.inventoryUomId) {
      this.tabsWithErrors.push('inventory');
      this.validationErrors.push(this.translate.instant('items.errors.inventoryUomRequired') || 'Inventory unit is required');
      isValid = false;
    }

    if (this.model.isInventoryItem && !this.model.dfltWarehouseId) {
      this.tabsWithErrors.push('inventory');
      this.validationErrors.push(this.translate.instant('items.errors.defaultWarehouseRequired') || 'Default warehouse is required');
      isValid = false;
    }

    // 4. Sales validation
    if (this.model.isSold && this.model.salesPrice < 0) {
      this.tabsWithErrors.push('sales');
      this.validationErrors.push(this.translate.instant('items.errors.invalidSalesPrice'));
      isValid = false;
    }

    // 5. Tax validation
    if (this.model.dfltTaxPercent < 0 || this.model.dfltTaxPercent > 100) {
      this.tabsWithErrors.push('additional');
      this.validationErrors.push(this.translate.instant('items.errors.invalidTaxPercent'));
      isValid = false;
    }

    // 6. Inventory validation
    if (this.model.isInventoryItem && this.model.minStockLevel > this.model.maxStockLevel && this.model.maxStockLevel > 0) {
      this.tabsWithErrors.push('inventory');
      this.validationErrors.push(this.translate.instant('items.errors.minStockExceedsMax'));
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.mode === 'view') return;

    this.syncUoms();

    if (!this.validate()) return;

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
