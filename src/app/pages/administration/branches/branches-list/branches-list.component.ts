import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { BranchService } from '../../../../core/services/branch.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { BranchBasicResponse } from '../../../../core/models/branch.model';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageBreadcrumbComponent, CrudListComponent],
  templateUrl: './branches-list.component.html'
})
export class BranchesListComponent implements OnInit {
  private branchService = inject(BranchService);
  public translate = inject(TranslateService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;
  includeDisabled = false;
  filters: RequestFilters = { pageNumber: 1, pageSize: 10, searchValue: '', sortColumn: '', sortDirection: '' };
  data: PaginatedList<BranchBasicResponse> = { items: [], totalRecords: 0, pageIndex: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  columns: CrudColumn[] = [];

  ngOnInit(): void {
    this.setupColumns();
    this.loadData();

    this.translate.onLangChange.subscribe(() => {
      this.setupColumns();
    });
  }

  setupColumns(): void {
    this.columns = [
      { field: 'code', header: 'common.code', type: 'code' },
      { field: 'name', header: 'common.name', type: 'text' },
      { field: 'parentBranchName', header: 'common.parentBranch', type: 'text' },
      { field: 'isDefault', header: 'common.isDefault', type: 'badge' },
      { field: 'isActive', header: 'common.status', type: 'badge' }
    ];
  }

  loadData(): void {
    this.loading = true;
    this.branchService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/administration/branches/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/administration/branches/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/administration/branches/view', id]);
  }

  onToggleStatus(item: any): void {
    this.branchService.toggleStatus(item.id).subscribe({
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
