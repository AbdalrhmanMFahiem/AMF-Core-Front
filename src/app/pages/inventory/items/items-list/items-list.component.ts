import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../../../core/services/item.service';
import { ItemResponse } from '../../../../core/models/item.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './items-list.component.html',
  styles: ``
})
export class ItemsListComponent implements OnInit {
  private toastr = inject(ToastrService);
  private itemService = inject(ItemService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  data: PaginatedList<ItemResponse> | null = null;
  loading = false;
  includeDisabled = false;

  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'items.fields.code', type: 'code' },
    { field: 'name', header: 'items.fields.name', type: 'text' },
    { field: 'itemGroupName', header: 'items.fields.itemGroup', type: 'text' },
    { field: 'warehouseName', header: 'items.fields.dfltWarehouse', type: 'text' },
    { field: 'isActive', header: 'items.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.itemService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/inventory/items/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/items/view', id]);
  }

  onToggleStatus(item: any): void {
    this.itemService.toggleStatus(item.id).subscribe({
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
