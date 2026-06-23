import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockTransactionService } from '../../../../core/services/stock-transaction.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { StockTransactionResponse, StockTransactionFilters } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-transactions-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule
  ],
  templateUrl: './stock-transactions-list.component.html'
})
export class StockTransactionsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockTransactionService = inject(StockTransactionService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<StockTransactionResponse> | null = null;
  loading: boolean = false;
  
  filters: StockTransactionFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: ''
  };

  columns: CrudColumn[] = [
    { field: 'transactionDate', header: 'common.date', type: 'date' },
    { field: 'transactionType', header: 'stockTransactions.type', type: 'text' },
    { field: 'itemName', header: 'stockTransactions.item', type: 'text' },
    { field: 'warehouseName', header: 'stockTransactions.warehouse', type: 'text' },
    { field: 'quantity', header: 'stockTransactions.quantity', type: 'text' },
    { field: 'runningBalance', header: 'stockTransactions.runningBalance', type: 'text' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockTransactionService.getAll(this.filters).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock transactions', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }
}
