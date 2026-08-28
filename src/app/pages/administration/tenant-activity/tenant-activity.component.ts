import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantActivityLogResponse, TenantActivityFilterRequest, TenantSummaryResponse } from '../../../core/models/tenant.model';
import { RequestFilters, PaginatedList } from '../../../core/models/pagination.model';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-tenant-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent
  ],
  templateUrl: './tenant-activity.component.html'
})
export class TenantActivityComponent implements OnInit {
  private tenantService = inject(TenantService);
  public translate = inject(TranslateService);

  data: PaginatedList<TenantActivityLogResponse> | null = null;
  tenants: TenantSummaryResponse[] = [];
  loading = false;

  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 15,
    searchValue: '',
    sortColumn: 'LastLoginOn',
    sortDirection: 'DESC'
  };

  activityFilters: TenantActivityFilterRequest = {
    tenantId: '',
    onlyActive: false
  };

  ngOnInit(): void {
    this.loadTenantsDropdown();
    this.loadData();
  }

  loadTenantsDropdown(): void {
    this.tenantService.getAll({ pageNumber: 1, pageSize: 100, searchValue: '' }, true).subscribe({
      next: (res) => {
        this.tenants = res.items || [];
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.tenantService.getActivityLogs(this.filters, this.activityFilters).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    this.filters.pageNumber = page;
    this.loadData();
  }

  isRecentlyActive(lastLoginOn?: string): boolean {
    if (!lastLoginOn) return false;
    const loginTime = new Date(lastLoginOn).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - loginTime) < hours24;
  }
}
