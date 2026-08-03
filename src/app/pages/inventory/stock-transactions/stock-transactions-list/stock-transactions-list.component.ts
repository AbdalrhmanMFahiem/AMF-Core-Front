import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';
import { StockTransactionService } from '../../../../core/services/stock-transaction.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { StockTransactionResponse, StockTransactionFilters, StockTransactionType } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    CrudListComponent,
    SearchableSelectComponent,
    DatePickerComponent
  ],
  templateUrl: './stock-transactions-list.component.html'
})
export class StockTransactionsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockTransactionService = inject(StockTransactionService);
  private readonly lookupService = inject(LookupService);
  private readonly toastr = inject(ToastrService);

  data: any = null;
  loading: boolean = false;

  warehousesOptions: SearchableOption[] = [];
  transactionTypeOptions: SearchableOption[] = [];

  filters: StockTransactionFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    itemId: undefined,
    warehouseId: undefined,
    transactionType: undefined,
    dateFrom: undefined,
    dateTo: undefined
  };

  columns: CrudColumn[] = [
    { field: 'transactionDate', header: 'common.date', type: 'date' },
    { field: 'transactionTypeDisplay', header: 'stockTransactions.type', type: 'dynamic-badge' },
    { field: 'referenceCode', header: 'stockTransactions.reference', type: 'code' },
    { field: 'itemName', header: 'stockTransactions.item', type: 'text' },
    { field: 'warehouseName', header: 'stockTransactions.warehouse', type: 'text' },
    { field: 'quantityDisplay', header: 'stockTransactions.quantity', type: 'text' },
    { field: 'runningBalanceDisplay', header: 'stockTransactions.runningBalance', type: 'text' }
  ];

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.warehouseId ||
      this.filters.transactionType !== undefined ||
      this.filters.dateFrom ||
      this.filters.dateTo
    );
  }

  isActionHidden = () => true;

  ngOnInit(): void {
    this.initOptions();
    this.loadData();
  }

  initOptions(): void {
    this.lookupService.getWarehouses().subscribe({
      next: (res) => {
        this.warehousesOptions = (res || []).map((w: any) => ({ value: w.id, label: w.name }));
      }
    });

    this.translate.onLangChange.subscribe(() => this.updateTransactionTypeOptions());
    this.updateTransactionTypeOptions();
  }

  updateTransactionTypeOptions(): void {
    this.transactionTypeOptions = [
      { value: StockTransactionType.SalesOut, label: this.translate.instant('stockTransactions.types.SalesOut') },
      { value: StockTransactionType.SalesReturnIn, label: this.translate.instant('stockTransactions.types.SalesReturnIn') },
      { value: StockTransactionType.PurchaseIn, label: this.translate.instant('stockTransactions.types.PurchaseIn') },
      { value: StockTransactionType.PurchaseReturnOut, label: this.translate.instant('stockTransactions.types.PurchaseReturnOut') },
      { value: StockTransactionType.TransferOut, label: this.translate.instant('stockTransactions.types.TransferOut') },
      { value: StockTransactionType.TransferIn, label: this.translate.instant('stockTransactions.types.TransferIn') },
      { value: StockTransactionType.AdjustmentIn, label: this.translate.instant('stockTransactions.types.AdjustmentIn') },
      { value: StockTransactionType.AdjustmentOut, label: this.translate.instant('stockTransactions.types.AdjustmentOut') },
      { value: StockTransactionType.OpeningBalance, label: this.translate.instant('stockTransactions.types.OpeningBalance') },
      { value: StockTransactionType.ManualIn, label: this.translate.instant('stockTransactions.types.ManualIn') },
      { value: StockTransactionType.ManualOut, label: this.translate.instant('stockTransactions.types.ManualOut') }
    ];
  }

  getTypeInfo(typeVal: any): { key: string; color: string } {
    let key = '';
    if (typeof typeVal === 'number') {
      key = StockTransactionType[typeVal] || String(typeVal);
    } else if (typeof typeVal === 'string') {
      key = typeVal;
    }

    switch (key) {
      case 'SalesOut':
      case '1':
        return { key: 'SalesOut', color: 'error' };
      case 'SalesReturnIn':
      case '2':
        return { key: 'SalesReturnIn', color: 'info' };
      case 'PurchaseIn':
      case '3':
        return { key: 'PurchaseIn', color: 'success' };
      case 'PurchaseReturnOut':
      case '4':
        return { key: 'PurchaseReturnOut', color: 'warning' };
      case 'TransferOut':
      case '5':
        return { key: 'TransferOut', color: 'warning' };
      case 'TransferIn':
      case '6':
        return { key: 'TransferIn', color: 'info' };
      case 'AdjustmentIn':
      case '7':
        return { key: 'AdjustmentIn', color: 'primary' };
      case 'AdjustmentOut':
      case '8':
        return { key: 'AdjustmentOut', color: 'error' };
      case 'OpeningBalance':
      case '9':
        return { key: 'OpeningBalance', color: 'dark' };
      case 'ManualIn':
      case '10':
        return { key: 'ManualIn', color: 'success' };
      case 'ManualOut':
      case '11':
        return { key: 'ManualOut', color: 'warning' };
      default:
        return { key: key || 'Unknown', color: 'light' };
    }
  }

  loadData(): void {
    this.loading = true;
    this.stockTransactionService.getAll(this.filters).subscribe({
      next: (res: any) => {
        const itemsList = res.items || (res as any).Items || [];
        const mappedItems = itemsList.map((item: StockTransactionResponse) => {
          const info = this.getTypeInfo(item.transactionType);
          const translatedText = this.translate.instant(`stockTransactions.types.${info.key}`);
          return {
            ...item,
            referenceCode: item.referenceCode || item.invoiceCode || item.stockTransferCode || item.stockAdjustmentCode || `#${item.id}`,
            transactionTypeDisplay: translatedText !== `stockTransactions.types.${info.key}` ? translatedText : info.key,
            transactionTypeDisplayColor: info.color,
            quantityDisplay: item.quantity != null ? item.quantity.toLocaleString('en-US') : '0',
            runningBalanceDisplay: item.runningBalance != null ? item.runningBalance.toLocaleString('en-US') : '0'
          };
        });

        this.data = { ...res, items: mappedItems };
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock transactions', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      itemId: undefined,
      warehouseId: undefined,
      transactionType: undefined,
      dateFrom: undefined,
      dateTo: undefined
    };
    this.loadData();
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }
}
