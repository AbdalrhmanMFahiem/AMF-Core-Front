import { Component, OnInit, inject, ViewChild } from '@angular/core';
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
import { PrintPreviewModalComponent } from '../../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { InvoiceService } from '../../../../core/services/invoice.service';
import Swal from 'sweetalert2';

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
    DatePickerComponent,
    PrintPreviewModalComponent
  ],
  templateUrl: './stock-transactions-list.component.html'
})
export class StockTransactionsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockTransactionService = inject(StockTransactionService);
  private readonly lookupService = inject(LookupService);
  private readonly toastr = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);

  data: any = null;
  loading: boolean = false;
  exportingPdf: boolean = false;
  exportingExcel: boolean = false;

  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;
  selectedTransactionForPrint: any = null;

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

  isActionHidden = () => false;

  customActions = [
    {
      id: 'print',
      label: 'common.print',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>',
      colorClass: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-500/10',
      visible: (item: any) => true
    }
  ];

  onCustomAction(event: { actionId: string, item: any }) {
    if (event.actionId === 'print') {
      this.printDocument(event.item);
    }
  }

  printDocument(row: any): void {
    const salesTypes = [1, 2]; // SalesOut, SalesReturnIn
    const purchaseTypes = [3, 4]; // PurchaseIn, PurchaseReturnOut
    const unsupportedTypes = [5, 6, 7, 8, 9, 10, 11]; // Transfers, Adjustments, Vouchers, Opening Balance

    if (salesTypes.includes(row.transactionType) && row.invoiceId) {
      this.doPrint(row.invoiceId, 'sales', row.referenceCode);
    } else if (purchaseTypes.includes(row.transactionType) && row.invoiceId) {
      this.doPrint(row.invoiceId, 'purchases', row.referenceCode);
    } else if (unsupportedTypes.includes(row.transactionType)) {
      Swal.fire({
        icon: 'info',
        title: this.translate.instant('common.info'),
        text: this.translate.instant('stockTransactions.printNotImplementedYet'),
        confirmButtonColor: '#3085d6'
      });
    }
  }

  private doPrint(id: number, type: 'sales' | 'purchases', refCode: string): void {
    this.selectedTransactionForPrint = { referenceCode: refCode };
    this.isPrintModalOpen = true;
    this.pdfLoading = true;

    this.invoiceService.printPdf(id, type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.pdfBlobUrl = url;
        this.pdfLoading = false;
      },
      error: () => {
        this.pdfLoading = false;
        this.isPrintModalOpen = false;
        this.toastr.error('Failed to generate PDF');
      }
    });
  }

  closePrintModal() {
    this.isPrintModalOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
    this.selectedTransactionForPrint = null;
  }

  exportExcel(): void {
    this.exportingExcel = true;
    this.stockTransactionService.exportToExcel(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StockTransactions_${new Date().getTime()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportingExcel = false;
      },
      error: () => {
        this.toastr.error('Failed to export Excel');
        this.exportingExcel = false;
      }
    });
  }

  exportPdf(): void {
    this.exportingPdf = true;
    this.stockTransactionService.exportToPdf(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StockTransactions_${new Date().getTime()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportingPdf = false;
      },
      error: () => {
        this.toastr.error('Failed to export PDF');
        this.exportingPdf = false;
      }
    });
  }

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
