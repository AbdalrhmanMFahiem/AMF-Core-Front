import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockTransferService } from '../../../../core/services/stock-transfer.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { StockTransferResponse } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-transfers-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule
  ],
  templateUrl: './stock-transfers-list.component.html'
})
export class StockTransfersListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockTransferService = inject(StockTransferService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<StockTransferResponse> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'fromWarehouseName', header: 'stockTransfers.fromWarehouse', type: 'text' },
    { field: 'toWarehouseName', header: 'stockTransfers.toWarehouse', type: 'text' },
    { field: 'transferDate', header: 'common.date', type: 'date' },
    { field: 'status', header: 'common.status', type: 'text' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockTransferService.getAll(this.pageNumber, this.pageSize, this.searchValue).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock transfers', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/stock-transfers/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/stock-transfers/view', id]);
  }

  onPageChange(pageIndex: number): void {
    this.pageNumber = pageIndex;
    this.loadData();
  }
}
