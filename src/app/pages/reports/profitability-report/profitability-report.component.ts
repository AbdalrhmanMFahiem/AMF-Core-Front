import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ReportService } from '../../../core/services/report.service';
import { LookupService } from '../../../core/services/lookup.service';
import { PaginatedList } from '../../../core/models/pagination.model';
import { InvoiceProfitability, InvoiceLineProfitability, ProfitabilityFilter } from '../../../core/models/profitability.model';

import { CrudListComponent } from '../../../shared/components/common/crud-list/crud-list.component';
import { CrudColumn } from '../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DatePickerComponent } from '../../../shared/components/form/date-picker/date-picker.component';
import { SearchableSelectComponent, SearchableOption } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profitability-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CrudListComponent,
    PageBreadcrumbComponent,
    DatePickerComponent,
    SearchableSelectComponent,
    ModalComponent
  ],
  templateUrl: './profitability-report.component.html'
})
export class ProfitabilityReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private lookupService = inject(LookupService);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<InvoiceProfitability> | null = null;
  loading = false;

  filters: ProfitabilityFilter = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    dateFrom: undefined,
    dateTo: undefined,
    warehouseId: undefined,
    customerId: undefined,
    itemId: undefined,
    isManufactured: undefined,
    invoiceType: undefined
  };

  // Summaries
  totalRevenue = 0;
  totalCOGS = 0;
  totalProfit = 0;

  warehouses: SearchableOption[] = [];
  customers: SearchableOption[] = [];
  items: SearchableOption[] = [];
  invoiceTypeOptions: SearchableOption[] = [];
  itemTypeOptions: SearchableOption[] = [];

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'invoiceDate', header: 'common.date', type: 'date' },
    { field: 'businessPartnerName', header: 'common.customer', type: 'text' },
    { field: 'warehouseName', header: 'warehouses.title', type: 'text' },
    { field: 'totalNetRevenue', header: 'reports.profitability.netRevenue', type: 'number' },
    { field: 'totalCOGS', header: 'reports.profitability.cogs', type: 'number' },
    { field: 'grossProfit', header: 'reports.profitability.grossProfit', type: 'number' },
    { field: 'profitMarginPercentage', header: 'reports.profitability.margin', type: 'number' }
  ];

  isModalOpen = false;
  selectedInvoice: InvoiceProfitability | null = null;

  ngOnInit(): void {
    this.initOptions();
    this.loadLookups();
    this.loadData();
  }

  private initOptions(): void {
    this.invoiceTypeOptions = [
      { value: '', label: this.translate.instant('reports.profitability.allInvoices') },
      { value: 'Sales', label: this.translate.instant('reports.profitability.salesInvoice') },
      { value: 'SalesReturn', label: this.translate.instant('reports.profitability.salesReturn') }
    ];

    this.itemTypeOptions = [
      { value: undefined, label: this.translate.instant('reports.profitability.allTypes') },
      { value: true, label: this.translate.instant('reports.profitability.manufactured') },
      { value: false, label: this.translate.instant('reports.profitability.trading') }
    ];
  }

  loadLookups(): void {
    this.lookupService.getWarehouses().subscribe(res => {
      this.warehouses = res.map(w => ({ value: w.id, label: w.name }));
    });
    this.lookupService.getCustomers().subscribe(res => {
      this.customers = res.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }));
    });
    this.lookupService.getItemsLookup({ pageNumber: 1, pageSize: 1000 }).subscribe(res => {
      this.items = res.items.map(i => ({ value: i.id, label: `${i.code} - ${i.name}` }));
    });
  }

  loadData(): void {
    this.loading = true;
    this.reportService.getProfitabilityReport(this.filters).subscribe({
      next: (res: any) => {
        this.data = res;
        if (this.data && this.data.items) {
          this.data.items = this.data.items.map((item: any) => ({
            ...item,
            id: item.invoiceId
          }));
        }
        this.calculateSummaries();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateSummaries(): void {
    if (this.data && this.data.items) {
      this.totalRevenue = this.data.items.reduce((sum, item) => sum + item.totalNetRevenue, 0);
      this.totalCOGS = this.data.items.reduce((sum, item) => sum + item.totalCOGS, 0);
      this.totalProfit = this.data.items.reduce((sum, item) => sum + item.grossProfit, 0);
    }
  }

  onSearch(): void {
    this.loadData();
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  applyFilters(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.filters.dateFrom = undefined;
    this.filters.dateTo = undefined;
    this.filters.warehouseId = undefined;
    this.filters.customerId = undefined;
    this.filters.itemId = undefined;
    this.filters.isManufactured = undefined;
    this.filters.invoiceType = undefined;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  get hasActiveAdvancedFilters(): boolean {
    return !!(
      this.filters.dateFrom ||
      this.filters.dateTo ||
      this.filters.warehouseId ||
      this.filters.customerId ||
      this.filters.itemId ||
      this.filters.isManufactured !== undefined ||
      this.filters.invoiceType
    );
  }

  onView(item: any): void {
    this.selectedInvoice = item as InvoiceProfitability;
    this.isModalOpen = true;
  }

  getCostSourceLabel(costSource: string): string {
    if (!costSource) return '-';
    const key = `reports.profitability.costSources.${costSource}`;
    return this.translate.instant(key);
  }

  exportExcel(): void {
    this.reportService.exportProfitabilityExcel(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `InvoiceProfitability_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error(this.translate.instant('reports.exportError'))
    });
  }
}
