import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { LocationService } from '../../../../core/services/location.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { LocationBasicResponse } from '../../../../core/models/location.model';

import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageBreadcrumbComponent, CrudListComponent],
  templateUrl: './locations-list.component.html'
})
export class LocationsListComponent implements OnInit {
  private locationService = inject(LocationService);
  public translate = inject(TranslateService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;
  includeDisabled = false;
  filters: RequestFilters = { pageNumber: 1, pageSize: 10, searchValue: '', sortColumn: '', sortDirection: '' };
  data: PaginatedList<LocationBasicResponse> = { items: [], totalRecords: 0, pageIndex: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

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
      { field: 'code', header: 'common.code' },
      { field: 'name', header: 'common.name' },
      { field: 'notes', header: 'common.notes' },
      { field: 'isActive', header: 'common.status', type: 'badge' }
    ];
  }

  loadData(): void {
    this.loading = true;
    this.locationService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/inventory/locations/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/locations/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/locations/view', id]);
  }

  onToggleStatus(item: any): void {
    this.locationService.toggleStatus(item.id).subscribe({
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
