import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CountryService } from '../../../../core/services/country.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CountryBasicResponse } from '../../../../core/models/country.model';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './countries-list.component.html'
})
export class CountriesListComponent implements OnInit {
  private countryService = inject(CountryService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<CountryBasicResponse> | null = null;
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
    { field: 'code', header: 'countries.fields.code', type: 'code' },
    { field: 'name', header: 'countries.fields.name', type: 'text' },
    { field: 'countryGroupName', header: 'countries.fields.countryGroup', type: 'text' },
    { field: 'isActive', header: 'countries.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.countryService.getAll(this.filters, this.includeDisabled).subscribe({
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

  onPageChange(page: number): void {
    this.filters.pageNumber = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.filters.pageSize = size;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onAdd(): void {
    this.router.navigate(['/master-data/countries/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/countries/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/countries/view', id]);
  }

  onToggleStatus(row: CountryBasicResponse): void {
    this.countryService.toggleStatus(row.id).subscribe({
      next: () => {
        row.isActive = !row.isActive;
        this.toastr.success(this.translate.instant('common.statusUpdated'));
      },
      error: () => {
        this.toastr.error(this.translate.instant('common.errorUpdatingStatus'));
      }
    });
  }

  onIncludeDisabledChange(checked: boolean): void {
    this.includeDisabled = checked;
    this.filters.pageNumber = 1;
    this.loadData();
  }
}
