import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { WarehouseService } from '../../../../core/services/warehouse.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { WarehouseBasicResponse } from '../../../../core/models/warehouse.model';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageBreadcrumbComponent, CrudListComponent],
  templateUrl: './warehouses-list.component.html'
})
export class WarehousesListComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  public translate = inject(TranslateService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;
  includeDisabled = false;
  filters: RequestFilters = { pageNumber: 1, pageSize: 10, searchValue: '', sortColumn: '', sortDirection: '' };
  data: PaginatedList<WarehouseBasicResponse> = { items: [], totalRecords: 0, pageIndex: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  columns: CrudColumn[] = [];

  ngOnInit(): void {
    this.setupColumns();
    this.loadData();
    
    // Subscribe to language changes to update columns dynamically
    this.translate.onLangChange.subscribe(() => {
      this.setupColumns();
    });
  }

  setupColumns(): void {
    this.columns = [
      { field: 'code', header: 'warehouses.fields.code', type: 'code' },
      { field: 'name', header: 'warehouses.fields.name', type: 'text' },
      { field: 'maxVolumeCapacity', header: 'warehouses.fields.maxVolumeCapacity', type: 'text' },
      { field: 'maxWeightCapacity', header: 'warehouses.fields.maxWeightCapacity', type: 'text' },
      { field: 'maxPalletsCount', header: 'warehouses.fields.maxPalletsCount', type: 'text' },
      { field: 'notes', header: 'Common.Notes', type: 'text' },
      { field: 'isActive', header: 'Common.Status', type: 'badge' }
    ];
  }

  loadData(): void {
    this.loading = true;
    this.warehouseService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
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
    this.router.navigate(['/inventory/warehouses/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/warehouses/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/warehouses/view', id]);
  }

  onToggleStatus(item: any): void {
    this.warehouseService.toggleStatus(item.id).subscribe({
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
