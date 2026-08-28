import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TenantService } from '../../../../core/services/tenant.service';
import { TenantSummaryResponse, TenantStatsSummaryResponse } from '../../../../core/models/tenant.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TenantEditModalComponent } from '../tenant-edit-modal/tenant-edit-modal.component';
import { TenantUsersModalComponent } from '../tenant-users-modal/tenant-users-modal.component';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    TenantEditModalComponent,
    TenantUsersModalComponent
  ],
  templateUrl: './tenants-list.component.html'
})
export class TenantsListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public translate = inject(TranslateService);

  data: PaginatedList<TenantSummaryResponse> | null = null;
  stats: TenantStatsSummaryResponse | null = null;
  loading = false;
  statsLoading = false;
  includeInactive = false;

  // Modals state
  isEditModalOpen = false;
  isUsersModalOpen = false;
  selectedTenant: TenantSummaryResponse | null = null;

  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'CreatedOn',
    sortDirection: 'DESC'
  };

  ngOnInit(): void {
    this.loadStats();
    this.loadData();
  }

  loadStats(): void {
    this.statsLoading = true;
    this.tenantService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.tenantService.getAll(this.filters, this.includeInactive).subscribe({
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

  onPageChange(page: number): void {
    this.filters.pageNumber = page;
    this.loadData();
  }

  onIncludeInactiveChanged(include: boolean): void {
    this.includeInactive = include;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onAddNewCompany(): void {
    this.router.navigate(['/setup-company']);
  }

  onViewUsers(tenant: TenantSummaryResponse): void {
    this.selectedTenant = tenant;
    this.isUsersModalOpen = true;
  }

  onEditTenant(tenant: TenantSummaryResponse): void {
    this.selectedTenant = tenant;
    this.isEditModalOpen = true;
  }

  onTenantSaved(updated: TenantSummaryResponse): void {
    this.loadData();
    this.loadStats();
  }

  onToggleStatus(tenant: TenantSummaryResponse, event: Event): void {
    event.stopPropagation();
    this.tenantService.toggleStatus(tenant.tenantId).subscribe({
      next: () => {
        const msg = tenant.isActive
          ? this.translate.instant('tenants.deactivatedSuccess') || 'Company account deactivated'
          : this.translate.instant('tenants.activatedSuccess') || 'Company account activated';
        this.toastr.success(msg);
        this.loadData();
        this.loadStats();
      },
      error: (err) => {
        const msg = err?.error?.message || this.translate.instant('errors.generic');
        this.toastr.error(msg);
      }
    });
  }

  getCapacityPercent(tenant: TenantSummaryResponse): number {
    if (!tenant.maxUsers || tenant.maxUsers <= 0) return 0;
    return Math.min(100, Math.round((tenant.totalUsers / tenant.maxUsers) * 100));
  }

  getCapacityColor(percent: number): string {
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  }
}
