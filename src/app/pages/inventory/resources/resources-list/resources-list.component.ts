import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { ResourceService } from '../../../../core/services/resource.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { 
  ResourceFilters, 
  ResourceBasicResponse, 
  RESOURCE_TYPE_CONFIG_LIST, 
  getResourceTypeConfig 
} from '../../../../core/models/resource.model';
import { UOM_TYPE_CONFIG_LIST, getUomTypeConfig } from '../../../../core/models/uom.model';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';

@Component({
  selector: 'app-resources-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    CrudListComponent,
    SearchableSelectComponent
  ],
  templateUrl: './resources-list.component.html'
})
export class ResourcesListComponent implements OnInit {
  private resourceService = inject(ResourceService);
  public translate = inject(TranslateService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;
  includeDisabled = false;
  filters: ResourceFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: '',
    sortDirection: '',
    resourceType: null,
    rateUomType: null
  };

  data: PaginatedList<ResourceBasicResponse> = {
    items: [],
    totalRecords: 0,
    pageIndex: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  columns: CrudColumn[] = [];
  resourceTypeOptions: SearchableOption[] = [];
  rateUomTypeOptions: SearchableOption[] = [];

  get hasActiveAdvancedFilters(): boolean {
    return !!this.filters.resourceType || !!this.filters.rateUomType;
  }

  ngOnInit(): void {
    this.setupColumns();
    this.setupDropdownOptions();
    this.loadData();

    this.translate.onLangChange.subscribe(() => {
      this.setupColumns();
      this.setupDropdownOptions();
      this.loadData();
    });
  }

  setupDropdownOptions(): void {
    const isAr = this.translate.currentLang === 'ar';
    this.resourceTypeOptions = RESOURCE_TYPE_CONFIG_LIST.map(opt => ({
      value: opt.type,
      label: isAr ? opt.aName : opt.eName
    }));

    this.rateUomTypeOptions = UOM_TYPE_CONFIG_LIST.map(opt => ({
      value: opt.type,
      label: isAr ? opt.aName : opt.eName
    }));
  }

  setupColumns(): void {
    this.columns = [
      { field: 'code', header: 'common.code', type: 'code' },
      { field: 'name', header: 'common.name', type: 'text' },
      { field: 'resourceTypeLabel', header: 'resources.fields.resourceType', type: 'text' },
      { field: 'costRate', header: 'resources.fields.costRate', type: 'text' },
      { field: 'unitOfMeasureName', header: 'resources.fields.unitOfMeasure', type: 'text' },
      { field: 'isActive', header: 'common.status', type: 'badge' }
    ];
  }

  loadData(): void {
    this.loading = true;
    const isAr = this.translate.currentLang === 'ar';

    this.resourceService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = {
          ...res,
          items: res.items.map(item => {
            const resTypeMeta = getResourceTypeConfig(item.resourceType);
            return {
              ...item,
              resourceTypeLabel: isAr ? resTypeMeta.aName : resTypeMeta.eName
            } as any;
          })
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  clearAdvancedFilters(): void {
    this.filters.resourceType = null;
    this.filters.rateUomType = null;
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
    this.router.navigate(['/inventory/resources/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/resources/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/resources/view', id]);
  }

  onToggleStatus(item: any): void {
    this.resourceService.toggleStatus(item.id).subscribe({
      next: () => {
        const msg = item.isActive
          ? this.translate.instant('common.statusChangedToInactive')
          : this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }
}
