import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockAdjustmentService } from '../../../../core/services/stock-adjustment.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { StockAdjustmentResponse } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-adjustments-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule
  ],
  templateUrl: './stock-adjustments-list.component.html'
})
export class StockAdjustmentsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockAdjustmentService = inject(StockAdjustmentService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<StockAdjustmentResponse> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'warehouseName', header: 'stockAdjustments.warehouse', type: 'text' },
    { field: 'adjustmentType', header: 'stockAdjustments.type', type: 'text' },
    { field: 'adjustmentDate', header: 'common.date', type: 'date' },
    { field: 'status', header: 'common.status', type: 'text' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockAdjustmentService.getAll(this.pageNumber, this.pageSize, this.searchValue).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock adjustments', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/stock-adjustments/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/stock-adjustments/view', id]);
  }

  onPageChange(pageIndex: number): void {
    this.pageNumber = pageIndex;
    this.loadData();
  }
}
