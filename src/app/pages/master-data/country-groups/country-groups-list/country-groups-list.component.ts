import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CountryGroupService } from '../../../../core/services/country-group.service';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CountryGroupBasicResponse } from '../../../../core/models/country-group.model';

@Component({
  selector: 'app-country-groups-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './country-groups-list.component.html'
})
export class CountryGroupsListComponent implements OnInit {
  private countryGroupService = inject(CountryGroupService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<CountryGroupBasicResponse> | null = null;
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
    { field: 'code', header: 'countryGroups.fields.code', type: 'code' },
    { field: 'name', header: 'countryGroups.fields.name', type: 'text' },
    { field: 'isActive', header: 'countryGroups.fields.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.countryGroupService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/master-data/country-groups/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/country-groups/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/country-groups/view', id]);
  }

  onToggleStatus(item: any): void {
    this.countryGroupService.toggleStatus(item.id).subscribe(() => {
      const msg = item.isActive
        ? this.translate.instant('common.statusChangedToInactive')
        : this.translate.instant('common.statusChangedToActive');
      this.toastr.success(msg);
      this.loadData();
    });
  }
}
