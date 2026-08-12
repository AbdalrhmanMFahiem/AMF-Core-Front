import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DistrictService } from '../../../../core/services/district.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { DistrictBasicResponse, DistrictFilters } from '../../../../core/models/district.model';
import { IdNameResponse } from '../../../../core/models/lookup.model';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-districts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './districts-list.component.html'
})
export class DistrictsListComponent implements OnInit {
  private districtService = inject(DistrictService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<DistrictBasicResponse> | null = null;
  cities: SearchableOption[] = [];
  loading = false;
  includeDisabled = false;

  filters: DistrictFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'districts.fields.code', type: 'code' },
    { field: 'name', header: 'districts.fields.name', type: 'text' },
    { field: 'cityName', header: 'districts.fields.city', type: 'text' },
    { field: 'isActive', header: 'districts.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadCities();
    this.loadData();
  }

  loadCities(): void {
    this.lookupService.getCities().subscribe({
      next: (res) => this.cities = res.map(c => ({ value: c.id, label: c.name })),
      error: () => this.toastr.error(this.translate.instant('common.errorLoadingData'))
    });
  }

  onCityChange(cityId: number | null): void {
    this.filters.cityId = cityId;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.districtService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/master-data/districts/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/districts/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/districts/edit', id]);
  }

  onToggleStatus(id: number): void {
    this.districtService.toggleStatus(id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('common.statusUpdated'));
        this.loadData();
      },
      error: () => this.toastr.error(this.translate.instant('common.errorUpdatingStatus'))
    });
  }
}
