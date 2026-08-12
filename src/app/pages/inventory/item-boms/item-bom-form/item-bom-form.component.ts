import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { ItemLookupModalComponent } from '../../../../shared/components/lookups/item-lookup-modal/item-lookup-modal.component';
import { ComponentLookupModalComponent } from '../../../../shared/components/lookups/component-lookup-modal/component-lookup-modal.component';
import { LineNotesModalComponent } from '../../../../shared/components/common/line-notes-modal/line-notes-modal.component';

import { ItemBomService } from '../../../../core/services/item-bom.service';
import { ItemService } from '../../../../core/services/item.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { UnitOfMeasureService } from '../../../../core/services/unit-of-measure.service';

import { ItemBomRequest, ItemBomLineRequest, BomLineType, BomComponentLookupResponse } from '../../../../core/models/item-bom.model';
import { ItemLookupResponse, IntIdCodeNameResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-item-bom-form',
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
    ItemLookupModalComponent,
    ComponentLookupModalComponent,
    LineNotesModalComponent
  ],
  templateUrl: './item-bom-form.component.html',
  styles: ``
})
export class ItemBomFormComponent implements OnInit {
  private itemBomService = inject(ItemBomService);
  private itemService = inject(ItemService);
  private lookupService = inject(LookupService);
  private uomService = inject(UnitOfMeasureService);
  public translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  activeTab: 'basic' | 'components' = 'basic';
  tabsWithErrors: string[] = [];

  // Header item popup modal controls
  isHeaderItemModalOpen = false;
  selectedHeaderItemName = '';
  fetchHeaderItems = (filters: any) => this.itemBomService.getHeaderItemsLookup(filters, this.id || undefined);

  // Make BomLineType accessible to template
  BomLineType = BomLineType;

  // Component lookup modal controls
  isComponentModalOpen = false;
  editingLineIndex = -1;
  componentModalLineType = '';
  fetchComponentItems = (headerItemId: number, lineType: string) =>
    this.itemBomService.getComponentsLookup(headerItemId, lineType);

  model: ItemBomRequest = {
    itemId: 0,
    quantity: 1,
    warehouseId: null,
    priceListId: null,
    treeType: 1,
    notes: '',
    minSpeed: 0,
    maxSpeed: 0,
    dfltSpeed: 0,
    dfltSpeedUomType: undefined,
    dfltWeight: 0,
    lines: []
  };

  warehousesOptions: SearchableOption[] = [];
  priceListsOptions: SearchableOption[] = [];
  uomOptions: SearchableOption[] = [];

  get lineTypeOptions() {
    return [
      { value: BomLineType.Item, label: this.translate.instant('common.item') || 'Item' },
      { value: BomLineType.Resource, label: this.translate.instant('common.resource') || 'Resource' }
    ];
  }

  itemsLookupOptions: SearchableOption[] = [];
  resourcesLookupOptions: SearchableOption[] = [];

  // Component display names per line index
  componentDisplayNames: Map<number, string> = new Map();

  // Line notes modal controls
  isLineNotesModalOpen = false;
  currentLineNotesIndex = -1;
  currentLineNotes = '';
  currentLineItemCode = '';
  currentLineItemName = '';

  treeTypeOptions = [
    { value: 'Standard', label: 'Standard' }
  ];

  issueMethodOptions = [
    { value: 'Backflush', label: 'Backflush' },
    { value: 'Manual', label: 'Manual' }
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = +idParam;
        this.mode = this.route.snapshot.data['mode'] || 'edit';
        this.loadItemBom(this.id);
      } else {
        const itemIdParam = this.route.snapshot.queryParamMap.get('itemId');
        if (itemIdParam) {
          this.model.itemId = +itemIdParam;
          this.onHeaderItemChange();
        }
      }
    });

    this.loadLookups();
  }

  loadLookups(): void {
    this.lookupService.getWarehouses().subscribe(res => {
      this.warehousesOptions = (res || []).map(w => ({ value: w.id, label: w.name }));
    });

    this.uomService.getUnitOfMeasures({ pageNumber: 1, pageSize: 1000, searchValue: '', sortColumn: 'Id', sortDirection: 'DESC' }).subscribe((res: any) => {
      this.uomOptions = (res.items || []).map((u: any) => ({
        value: u.id,
        label: u.code ? `${u.code} - ${u.name || u.aName}` : (u.name || u.aName || u.eName)
      }));
      if (this.model && this.model.lines) {
        this.model.lines.forEach(line => {
          if (this.isResourceLine(line) && line.uomId) {
            line.uomOptions = this.uomOptions;
          }
        });
      }
    });
  }

  openHeaderItemModal(): void {
    if (this.mode === 'add') {
      this.isHeaderItemModalOpen = true;
    }
  }

  closeHeaderItemModal(): void {
    this.isHeaderItemModalOpen = false;
  }

  onSelectHeaderItem(item: ItemLookupResponse): void {
    this.model.itemId = item.id;
    this.selectedHeaderItemName = item.code ? `${item.code} - ${item.name}` : item.name;
    if (!this.model.warehouseId && item.dfltWarehouseId) {
      this.model.warehouseId = item.dfltWarehouseId;
    }
    if (!this.model.dfltWeight && item.dfltWeight) {
      this.model.dfltWeight = item.dfltWeight;
    }
    this.onHeaderItemChange();
  }

  uomCacheByItemId = new Map<number, { uomOptions: SearchableOption[], defaultUomId?: number }>();

  onHeaderItemChange(): void {
    this.itemsLookupOptions = [];
    this.resourcesLookupOptions = [];
  }

  onLineTypeChange(row: ItemBomLineRequest, newType?: any): void {
    if (newType !== undefined) {
      const isResource = newType === 'Resource' || newType === 'R' || newType === '82' || newType === 82 || newType === 2 || newType === BomLineType.Resource;
      row.lineType = isResource ? BomLineType.Resource : BomLineType.Item;
      if (isResource) {
        row.warehouseId = null;
      }
    }
    row.componentId = null;
    row.uomId = null;
    row.uomOptions = [];
    // Clear display name for this line
    const idx = this.model.lines.indexOf(row);
    if (idx >= 0) this.componentDisplayNames.delete(idx);
  }

  isResourceLine(row: ItemBomLineRequest): boolean {
    if (!row || !row.lineType) return false;
    return row.lineType === 'Resource' || row.lineType === 'R' || (row.lineType as any) === 82 || row.lineType === BomLineType.Resource;
  }

  onComponentChange(row: ItemBomLineRequest, newComponentId?: any): void {
    if (newComponentId !== undefined) {
      row.componentId = newComponentId;
    }
    this.loadLineUomOptions(row, false);
  }

  loadLineUomOptions(row: ItemBomLineRequest, preserveUomId: boolean = false): void {
    const isResource = row.lineType === 'Resource' || row.lineType === 'R' || (row.lineType as any) === 82 || row.lineType === BomLineType.Resource;
    if (isResource) {
      return;
    }
    if (!row.componentId) {
      row.uomOptions = [];
      if (!preserveUomId) row.uomId = null;
      return;
    }

    const componentId = row.componentId;
    if (this.uomCacheByItemId.has(componentId)) {
      const cached = this.uomCacheByItemId.get(componentId)!;
      row.uomOptions = cached.uomOptions;
      if (!preserveUomId || !row.uomId) {
        row.uomId = cached.defaultUomId || null;
      }
    } else {
      this.itemService.getSalesDetails(componentId).subscribe({
        next: (res) => {
          const uomOptions = (res.availableUoms || []).map(u => ({
            value: u.id,
            label: u.code ? `${u.code} - ${u.name}` : u.name
          }));
          const defaultUomId = res.salesUomId || (res.availableUoms && res.availableUoms[0]?.id);
          this.uomCacheByItemId.set(componentId, { uomOptions, defaultUomId });

          row.uomOptions = uomOptions;
          if (!preserveUomId || !row.uomId) {
            row.uomId = defaultUomId || null;
          }
        },
        error: () => {
          row.uomOptions = [];
        }
      });
    }
  }

  ensureComponentLookupLoaded(lineType: string | number): void {
    // No longer needed - components are loaded via popup modal
  }

  openComponentModal(index: number): void {
    if (this.mode === 'view') return;
    if (!this.model.itemId) return;
    const row = this.model.lines[index];
    if (!row || !row.lineType) return;
    this.editingLineIndex = index;
    const isResource = row.lineType === 'Resource' || row.lineType === 'R' || (row.lineType as any) === 82 || row.lineType === BomLineType.Resource;
    this.componentModalLineType = isResource ? 'Resource' : 'Item';
    this.isComponentModalOpen = true;
  }

  closeComponentModal(): void {
    this.isComponentModalOpen = false;
    this.editingLineIndex = -1;
  }

  onSelectComponent(item: BomComponentLookupResponse): void {
    if (this.editingLineIndex < 0 || this.editingLineIndex >= this.model.lines.length) return;
    const row = this.model.lines[this.editingLineIndex];
    row.componentId = item.id;
    this.componentDisplayNames.set(this.editingLineIndex, `${item.code} - ${item.name}`);
    const isResource = row.lineType === 'Resource' || row.lineType === 'R' || (row.lineType as any) === 82 || row.lineType === BomLineType.Resource;
    if (isResource) {
      if (item.unitOfMeasureId) {
        row.uomId = item.unitOfMeasureId;
        row.uomOptions = [{ value: item.unitOfMeasureId, label: item.unitOfMeasureName || '' }];
      }
    } else {
      this.loadLineUomOptions(row, false);
    }
  }

  getComponentDisplayName(index: number): string {
    return this.componentDisplayNames.get(index) || '';
  }

  openLineNotesModal(index: number): void {
    if (index < 0 || index >= this.model.lines.length) return;
    this.currentLineNotesIndex = index;
    const line = this.model.lines[index];
    this.currentLineNotes = line.notes || '';

    const displayName = this.getComponentDisplayName(index);
    if (displayName.includes(' - ')) {
      const parts = displayName.split(' - ');
      this.currentLineItemCode = parts[0];
      this.currentLineItemName = parts.slice(1).join(' - ');
    } else {
      this.currentLineItemCode = '';
      this.currentLineItemName = displayName;
    }

    this.isLineNotesModalOpen = true;
  }

  onSaveLineNotes(updatedNotes: string): void {
    if (this.currentLineNotesIndex >= 0 && this.currentLineNotesIndex < this.model.lines.length) {
      this.model.lines[this.currentLineNotesIndex].notes = updatedNotes;
    }
    this.isLineNotesModalOpen = false;
  }

  getTotalQuantity(row: ItemBomLineRequest): number {
    const qty = Number(row.quantity) || 0;
    const scrap = Number(row.scrapPercentage) || 0;
    const total = qty * (1 + scrap / 100);
    return Number(total.toFixed(4));
  }

  loadItemBom(id: number): void {
    this.loading = true;
    this.itemBomService.get(id).subscribe({
      next: (res) => {
        this.selectedHeaderItemName = res.itemCode ? `${res.itemCode} - ${res.itemName}` : (res.itemName || `${res.itemId}`);
        this.model = {
          itemId: res.itemId,
          quantity: res.quantity,
          warehouseId: res.warehouseId,
          priceListId: res.priceListId,
          treeType: res.treeType,
          notes: res.notes,
          minSpeed: res.minSpeed,
          maxSpeed: res.maxSpeed,
          dfltSpeed: res.dfltSpeed,
          dfltSpeedUomType: res.dfltSpeedUomType ?? undefined,
          dfltWeight: res.dfltWeight,
          lines: res.lines?.map(l => {
            const isResource = l.lineType === 'Resource' || l.lineType === 'R' || (l.lineType as any) === 82 || l.lineType === BomLineType.Resource;
            const uomLabel = (l.uomCode && l.uomName) ? `${l.uomCode} - ${l.uomName}` : (l.uomName || l.uomCode || '');
            const fallbackOption = l.uomId ? [{ value: l.uomId, label: uomLabel || `${l.uomId}` }] : [];
            const lineObj: ItemBomLineRequest = {
              id: l.id,
              itemBomId: l.itemBomId,
              lineType: isResource ? BomLineType.Resource : BomLineType.Item,
              componentId: (l as any).componentItemId ?? (l as any).componentId,
              childNum: l.childNum,
              visOrder: l.visOrder,
              quantity: l.quantity,
              warehouseId: l.warehouseId,
              itemPriceListId: l.itemPriceListId,
              uomId: l.uomId,
              issueMethod: l.issueMethod,
              addedQuantity: l.addedQuantity,
              scrapPercentage: l.scrapPercentage,
              lineText: l.lineText,
              notes: l.notes ?? '',
              uomOptions: isResource ? (this.uomOptions.length > 0 ? this.uomOptions : fallbackOption) : []
            };
            if (!isResource && lineObj.componentId) {
              this.loadLineUomOptions(lineObj, true);
            }
            return lineObj;
          }) || []
        };
        this.onHeaderItemChange();
        // Build component display names from the original response lines (which have componentCode/componentName)
        res.lines?.forEach((rl, idx) => {
          const code = rl.componentCode || '';
          const name = rl.componentName || '';
          if (code || name) {
            this.componentDisplayNames.set(idx, code ? `${code} - ${name}` : name);
          }
        });
        this.model.lines?.forEach((l, idx) => {
          this.loadLineUomOptions(l, true);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load item bom', err);
        this.loading = false;
      }
    });
  }


  setTab(tab: 'basic' | 'components'): void {
    this.activeTab = tab;
  }

  addLine(): void {
    if (!this.model.lines) {
      this.model.lines = [];
    }

    const nextChildNum = this.model.lines.length > 0
      ? Math.max(...this.model.lines.map(l => l.childNum)) + 1
      : 1;

    const newLine: ItemBomLineRequest = {
      id: 0,
      itemBomId: this.id || 0,
      lineType: BomLineType.Item,
      componentId: null,
      childNum: nextChildNum,
      visOrder: nextChildNum,
      quantity: 1,
      warehouseId: null,
      itemPriceListId: null,
      uomId: null,
      issueMethod: 1, // Default to Backflush
      addedQuantity: 0,
      scrapPercentage: 0,
      lineText: '',
      notes: ''
    };

    this.model.lines.push(newLine);
  }

  removeLine(index: number): void {
    if (this.mode === 'view') return;
    this.model.lines.splice(index, 1);
    // Rebuild component display names after removal
    const newMap = new Map<number, string>();
    this.componentDisplayNames.forEach((val, key) => {
      if (key < index) newMap.set(key, val);
      else if (key > index) newMap.set(key - 1, val);
    });
    this.componentDisplayNames = newMap;
  }

  onCancel(): void {
    this.router.navigate(['/inventory/item-boms']);
  }

  validate(): boolean {
    this.validationErrors = [];
    this.tabsWithErrors = [];
    let isValid = true;

    if (!this.model.itemId) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('items.item')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    if (this.model.quantity <= 0) {
      this.tabsWithErrors.push('basic');
      this.validationErrors.push(`${this.translate.instant('common.quantity')}: ${this.translate.instant('validation.min', { min: 1 })}`);
      isValid = false;
    }

    if (!this.model.lines || this.model.lines.length === 0) {
      this.tabsWithErrors.push('components');
      this.validationErrors.push(this.translate.instant('items.errors.componentsRequired') || 'At least one component is required');
      isValid = false;
    } else {
      for (let i = 0; i < this.model.lines.length; i++) {
        const line = this.model.lines[i];
        const rowText = this.translate.instant('common.row');
        const componentText = this.translate.instant('common.component');
        const uomText = this.translate.instant('common.uom');
        const warehouseText = this.translate.instant('common.warehouse');
        const quantityText = this.translate.instant('common.quantity');
        const requiredText = this.translate.instant('validation.required');
        const minText = this.translate.instant('validation.min', { min: 1 });

        if (!line.componentId) {
          this.tabsWithErrors.push('components');
          this.validationErrors.push(`${rowText} ${i + 1}: ${componentText} ${requiredText}`);
          isValid = false;
        }

        const isResource = line.lineType === 'Resource' || line.lineType === 'R' || line.lineType === BomLineType.Resource;
        if (!line.uomId) {
          this.tabsWithErrors.push('components');
          this.validationErrors.push(`${rowText} ${i + 1}: ${uomText} ${requiredText}`);
          isValid = false;
        }

        if (!isResource && !line.warehouseId) {
          this.tabsWithErrors.push('components');
          this.validationErrors.push(`${rowText} ${i + 1}: ${warehouseText} ${requiredText}`);
          isValid = false;
        }

        if (line.quantity <= 0) {
          this.tabsWithErrors.push('components');
          this.validationErrors.push(`${rowText} ${i + 1}: ${quantityText} - ${minText}`);
          isValid = false;
        }
      }
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.mode === 'view') return;

    if (!this.validate()) return;

    // Calculate addedQuantity (extra quantity due to scrap) for each line
    this.model.lines?.forEach(line => {
      const qty = Number(line.quantity) || 0;
      const scrap = Number(line.scrapPercentage) || 0;
      line.addedQuantity = Number((qty * (scrap / 100)).toFixed(4));
    });

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
      this.itemBomService.create(this.model).subscribe(observer);
    } else {
      this.itemBomService.update(this.id!, this.model).subscribe(observer);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
