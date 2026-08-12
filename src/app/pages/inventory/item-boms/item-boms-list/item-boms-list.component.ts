import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ItemBomService } from '../../../../core/services/item-bom.service';
import { ItemBomBasicResponse, ItemBomFilters } from '../../../../core/models/item-bom.model';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-item-boms-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CrudListComponent,
    PageBreadcrumbComponent,
    TranslateModule
  ],
  templateUrl: './item-boms-list.component.html',
  styles: ``
})
export class ItemBomsListComponent implements OnInit {
  private toastr = inject(ToastrService);
  private itemBomService = inject(ItemBomService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  data: PaginatedList<ItemBomBasicResponse> | null = null;
  loading = false;
  includeDisabled = false;

  filters: ItemBomFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'name', header: 'common.item', type: 'text' },
    { field: 'quantity', header: 'common.quantity', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.itemBomService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res: any) => {
        const rawItems = res?.items || res?.Items || [];
        const mappedItems = rawItems.map((item: any) => {
          const itemId = item.id ?? item.Id ?? item.ID;
          return {
            ...item,
            id: itemId,
            code: item.code ?? item.Code ?? '',
            aName: item.aName ?? item.AName ?? '',
            eName: item.eName ?? item.EName ?? '',
            itemName: item.itemName ?? item.ItemName ?? item.aName ?? item.AName ?? '',
            quantity: item.quantity ?? item.Quantity ?? 0,
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
        console.error('Error loading item boms data', err);
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
    this.router.navigate(['/inventory/item-boms/add']);
  }

  onEdit(id: number): void {
    if (!id) return;
    this.router.navigate(['/inventory/item-boms/edit', id]);
  }

  onView(id: number): void {
    if (!id) return;
    this.router.navigate(['/inventory/item-boms/view', id]);
  }

  onToggleStatus(item: any): void {
    const itemId = item.id ?? item.Id;
    if (!itemId) return;
    this.itemBomService.toggleStatus(itemId).subscribe({
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
