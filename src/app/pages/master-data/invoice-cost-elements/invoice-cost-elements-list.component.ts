import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoiceCostElementService } from '../../../core/services/invoice-cost-element.service';
import { InvoiceCostElementBasicResponse } from '../../../core/models/invoice-cost-element.model';
import { PaginatedList, RequestFilters } from '../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoice-cost-elements-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './invoice-cost-elements-list.component.html'
})
export class InvoiceCostElementsListComponent implements OnInit {
  private invoiceCostElementService = inject(InvoiceCostElementService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<any> | null = null;
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
    { field: 'typeDisplay', header: 'common.type', type: 'text' },
    { field: 'operationTypeDisplay', header: 'invoiceCostElements.fields.operationType', type: 'text' },
    { field: 'defaultPercentage', header: 'invoiceCostElements.fields.defaultPercentage', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.invoiceCostElementService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        const anyRes = res as any;
        anyRes.items = anyRes.items.map((item: any) => ({
          ...item,
          typeDisplay: this.getTypeLabel(item.type),
          operationTypeDisplay: this.getOperationTypeLabel(item.operationType)
        }));
        this.data = anyRes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading records', err);
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
    this.router.navigate(['/inventory/invoice-cost-elements/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/inventory/invoice-cost-elements/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/invoice-cost-elements/view', id]);
  }

  onToggleStatus(item: any): void {
    this.invoiceCostElementService.toggleStatus(item.id).subscribe(() => {
      if (this.data) {
        const msg = item.isActive ?
          this.translate.instant('common.statusChangedToInactive') :
          this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      }
    });
  }

  getOperationTypeLabel(type: string): string {
    const key = `invoiceCostElements.operationType.${type}`;
    return this.translate.instant(key);
  }

  getTypeLabel(type: string): string {
    const key = `invoiceCostElements.type.${type}`;
    return this.translate.instant(key);
  }
}
