import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EWalletProviderService } from '../../../../core/services/e-wallet-provider.service';
import { EWalletProviderBasicResponse } from '../../../../core/models/e-wallet-provider.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-e-wallet-provider-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './e-wallet-provider-list.component.html'
})
export class EWalletProviderListComponent implements OnInit {
  private service = inject(EWalletProviderService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<EWalletProviderBasicResponse> | null = null;
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
    { field: 'code', header: 'eWalletProviders.fields.code', type: 'code' },
    { field: 'name', header: 'eWalletProviders.fields.name', type: 'text' },
    { field: 'fixedCommission', header: 'eWalletProviders.fields.fixedCommission', type: 'text' },
    { field: 'commissionPercent', header: 'eWalletProviders.fields.commissionPercent', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.service.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/finance/e-wallet-providers/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/finance/e-wallet-providers/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/finance/e-wallet-providers/view', id]);
  }

  onToggleStatus(item: EWalletProviderBasicResponse): void {
    this.service.toggleStatus(item.id).subscribe({
      next: () => {
        const msg = item.isActive
          ? this.translate.instant('common.statusChangedToInactive')
          : this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      }
    });
  }
}
