import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from '../../../../core/services/item.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ItemBasicResponse, ItemFilters, UOM_TYPE_CONFIG_LIST } from '../../../../core/models/item.model';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { UomTypeBadgeComponent } from '../../../../shared/components/common/uom-type-badge/uom-type-badge.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CrudListComponent,
    PageBreadcrumbComponent,
    TranslateModule,
    SearchableSelectComponent,
    UomTypeBadgeComponent
  ],
  templateUrl: './items-list.component.html',
  styles: ``
})
export class ItemsListComponent implements OnInit {
  private toastr = inject(ToastrService);
  private itemService = inject(ItemService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  data: PaginatedList<ItemBasicResponse> | null = null;
  loading = false;
  includeDisabled = false;

  itemGroupsOptions: SearchableOption[] = [];
  warehousesOptions: SearchableOption[] = [];
  usageTypeOptions: SearchableOption[] = [];
  uomTypeOptions: SearchableOption[] = [];

  filters: ItemFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.itemGroupId ||
      this.filters.warehouseId ||
      this.filters.baseUomType ||
      this.filters.usageType
    );
  }

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'name', header: 'common.name', type: 'text' },
    { field: 'baseUomType', header: 'uom.uomType', type: 'custom' },
    { field: 'itemGroupName', header: 'items.fields.itemGroup', type: 'text' },
    { field: 'warehouseName', header: 'items.fields.dfltWarehouse', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.lookupService.getItemGroups().subscribe(res => {
      this.itemGroupsOptions = (res || []).map(g => ({ value: g.id, label: g.name }));
    });

    this.lookupService.getWarehouses().subscribe(res => {
      this.warehousesOptions = (res || []).map(w => ({ value: w.id, label: w.name }));
    });

    this.uomTypeOptions = UOM_TYPE_CONFIG_LIST.map(opt => ({
      value: opt.type,
      label: this.translate.instant(opt.translationKey)
    }));

    this.translate.onLangChange.subscribe(() => {
      this.updateUsageOptions();
      this.uomTypeOptions = UOM_TYPE_CONFIG_LIST.map(opt => ({
        value: opt.type,
        label: this.translate.instant(opt.translationKey)
      }));
    });
    this.updateUsageOptions();
  }

  updateUsageOptions(): void {
    this.usageTypeOptions = [
      { value: 'Sales', label: this.translate.instant('items.fields.isSold') },
      { value: 'Purchases', label: this.translate.instant('items.fields.isPurchased') },
      { value: 'Inventory', label: this.translate.instant('items.fields.isInventoryItem') }
    ];
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      sortColumn: 'Id',
      sortDirection: 'DESC',
      itemGroupId: undefined,
      warehouseId: undefined,
      baseUomType: undefined,
      usageType: undefined
    };
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.itemService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res: any) => {
        const rawItems = res?.items || res?.Items || [];
        const mappedItems = rawItems.map((item: any) => {
          const itemId = item.id ?? item.Id ?? item.ID;
          return {
            ...item,
            id: itemId,
            code: item.code ?? item.Code ?? '',
            name: item.name ?? item.Name ?? item.aName ?? item.AName ?? '',
            baseUomType: item.baseUomType ?? item.BaseUomType,
            itemGroupName: item.itemGroupName ?? item.ItemGroupName ?? '',
            warehouseName: item.warehouseName ?? item.WarehouseName ?? item.dfltWarehouseName ?? '',
            isActive: item.isActive !== undefined ? item.isActive : (item.IsActive !== undefined ? item.IsActive : true)
          };
        });

        this.data = {
          items: mappedItems,
          totalRecords: res?.totalRecords ?? res?.TotalRecords ?? mappedItems.length,
          pageIndex: res?.pageIndex ?? res?.PageIndex ?? 1,
          totalPages: res?.totalPages ?? res?.TotalPages ?? 1,
          hasNextPage: res?.hasNextPage ?? res?.HasNextPage ?? false,
          hasPreviousPage: res?.hasPreviousPage ?? res?.HasPreviousPage ?? false
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading items data', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  onIncludeDisabledChanged(include: boolean): void {
    this.includeDisabled = include;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onAdd(): void {
    this.router.navigate(['/inventory/items/add']);
  }

  onEdit(id: number): void {
    if (!id) {
      console.error('Cannot edit item without valid ID:', id);
      return;
    }
    this.router.navigate(['/inventory/items/edit', id]);
  }

  onView(id: number): void {
    if (!id) {
      console.error('Cannot view item without valid ID:', id);
      return;
    }
    this.router.navigate(['/inventory/items/view', id]);
  }

  onToggleStatus(item: any): void {
    const itemId = item.id ?? item.Id;
    if (!itemId) return;
    this.itemService.toggleStatus(itemId).subscribe({
      next: () => {
        const msg = item.isActive ? 
          this.translate.instant('common.statusChangedToInactive') : 
          this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      },
      error: (err) => {
        this.toastr.error('Failed to update status', 'Error');
        console.error(err);
      }
    });
  }
}
