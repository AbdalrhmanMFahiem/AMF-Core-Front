import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { GovernorateService } from '../../../../core/services/governorate.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { GovernorateBasicResponse } from '../../../../core/models/governorate.model';

@Component({
  selector: 'app-governorates-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './governorates-list.component.html'
})
export class GovernoratesListComponent implements OnInit {
  private governorateService = inject(GovernorateService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<GovernorateBasicResponse> | null = null;
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
    { field: 'code', header: 'governorates.fields.code', type: 'code' },
    { field: 'name', header: 'governorates.fields.name', type: 'text' },
    { field: 'countryName', header: 'governorates.fields.country', type: 'text' },
    { field: 'isActive', header: 'governorates.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.governorateService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
      }
    });
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onPageChange(event: any): void {
    this.filters.pageNumber = event.pageIndex + 1;
    this.filters.pageSize = event.pageSize;
    this.loadData();
  }

  onIncludeDisabledChange(checked: boolean): void {
    this.includeDisabled = checked;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onAdd(): void {
    this.router.navigate(['/master-data/governorates/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/governorates/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/governorates/edit', id]);
  }

  onToggleStatus(id: number): void {
    this.governorateService.toggleStatus(id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('common.statusUpdated'));
        this.loadData();
      },
      error: () => this.toastr.error(this.translate.instant('common.errorUpdatingStatus'))
    });
  }
}
