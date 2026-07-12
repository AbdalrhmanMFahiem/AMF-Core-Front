import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockVoucherService } from '../../../../core/services/stock-voucher.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-receipts-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule
  ],
  templateUrl: './stock-receipts-list.component.html'
})
export class StockReceiptsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockVoucherService = inject(StockVoucherService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<any> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'warehouseName', header: 'stockVouchers.fields.warehouse', type: 'text' },
    { field: 'voucherDate', header: 'stockVouchers.fields.voucherDate', type: 'date' },
    { field: 'status', header: 'common.status', type: 'document-status' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockVoucherService.getAll(this.pageNumber, this.pageSize, this.searchValue, 2).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock receipts', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/stock-receipts/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/stock-receipts/view', id]);
  }

  onPageChange(pageIndex: number): void {
    this.pageNumber = pageIndex;
    this.loadData();
  }
}
