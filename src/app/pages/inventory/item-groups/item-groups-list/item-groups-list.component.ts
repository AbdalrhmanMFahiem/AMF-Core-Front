import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { ItemGroupService } from '../../../../core/services/item-group.service';
import { PaginatedList, RequestFilters } from '../../../../core/models/pagination.model';
import { ItemGroupResponse } from '../../../../core/models/item-group.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-groups-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent
  ],
  templateUrl: './item-groups-list.component.html',
  styles: ``
})
export class ItemGroupsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly itemGroupService = inject(ItemGroupService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<ItemGroupResponse> | null = null;
  includeDisabled: boolean = false;
  loading: boolean = false;
  
  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'name', header: 'common.name', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.itemGroupService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load item groups', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/item-groups/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/item-groups/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/item-groups/edit', id]);
  }

  onToggleStatus(item: any): void {
    this.itemGroupService.toggleStatus(item.id).subscribe({
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

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  onIncludeDisabledChanged(include: boolean): void {
    this.includeDisabled = include;
    this.loadData();
  }
}
