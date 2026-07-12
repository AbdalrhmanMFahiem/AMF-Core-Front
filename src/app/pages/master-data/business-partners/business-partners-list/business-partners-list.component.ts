import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BusinessPartnerService } from '../../../../core/services/business-partner.service';
import { BusinessPartnerBasicResponse, BusinessPartnerResponse } from '../../../../core/models/business-partner.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-business-partners-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './business-partners-list.component.html'
})
export class BusinessPartnersListComponent implements OnInit {
  private businessPartnerService = inject(BusinessPartnerService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<BusinessPartnerBasicResponse> | null = null;
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
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'name', header: 'common.name', type: 'text' },
    { field: 'bpType', header: 'common.type', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  getPartnerTypeDisplay(isCustomer: boolean, isVendor: boolean): string {
    if (isCustomer && isVendor) return this.translate.instant('businessPartners.types.both');
    if (isCustomer) return this.translate.instant('businessPartners.types.customer');
    if (isVendor) return this.translate.instant('businessPartners.types.vendor');
    return '';
  }

  loadData(): void {
    this.loading = true;
    this.businessPartnerService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        // Map type and name for the grid columns
        res.items = res.items.map(item => ({
          ...item,
          bpType: this.getPartnerTypeDisplay(item.isCustomer, item.isVendor)
        }));
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
    this.router.navigate(['/master-data/business-partners/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/master-data/business-partners/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/master-data/business-partners/view', id]);
  }

  onToggleStatus(item: any): void {
    this.businessPartnerService.toggleStatus(item.id).subscribe(() => {
      if (this.data) {
        const msg = item.isActive ? 
          this.translate.instant('common.statusChangedToInactive') : 
          this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      }
    });
  }
}
