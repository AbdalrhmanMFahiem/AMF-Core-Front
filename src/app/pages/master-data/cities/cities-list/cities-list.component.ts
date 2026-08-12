import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CityService } from '../../../../core/services/city.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CityBasicResponse, CityFilters } from '../../../../core/models/city.model';
import { IdNameResponse } from '../../../../core/models/lookup.model';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule, SearchableSelectComponent],
  templateUrl: './cities-list.component.html'
})
export class CitiesListComponent implements OnInit {
  private cityService = inject(CityService);
  private lookupService = inject(LookupService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<CityBasicResponse> | null = null;
  governorates: SearchableOption[] = [];
  loading = false;
  includeDisabled = false;

  filters: CityFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'cities.fields.code', type: 'code' },
    { field: 'name', header: 'cities.fields.name', type: 'text' },
    { field: 'governorateName', header: 'cities.fields.governorate', type: 'text' },
    { field: 'isActive', header: 'cities.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadGovernorates();
    this.loadData();
  }

  loadGovernorates(): void {
    this.lookupService.getGovernorates().subscribe({
      next: (res) => this.governorates = res.map(g => ({ value: g.id, label: g.name })),
      error: () => this.toastr.error(this.translate.instant('common.errorLoadingData'))
    });
  }

  onGovernorateChange(governorateId: number | null): void {
    this.filters.governorateId = governorateId;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cityService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/master-data/cities/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/cities/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/cities/edit', id]);
  }

  onToggleStatus(id: number): void {
    this.cityService.toggleStatus(id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('common.statusUpdated'));
        this.loadData();
      },
      error: () => this.toastr.error(this.translate.instant('common.errorUpdatingStatus'))
    });
  }
}
