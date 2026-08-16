import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { NgApexchartsModule } from 'ng-apexcharts';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SearchableSelectComponent, SearchableOption } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { DatePickerComponent } from '../../../shared/components/form/date-picker/date-picker.component';
import { PrintPreviewModalComponent } from '../../../shared/components/common/print-preview-modal/print-preview-modal.component';

import { BusinessPartnerService } from '../../../core/services/business-partner.service';
import { ReportService } from '../../../core/services/report.service';
import { LookupService } from '../../../core/services/lookup.service';
import { LedgerFilters, BalanceSummaryResponse, BusinessPartnerLedgerResponse, LedgerEntryType } from '../../../core/models/business-partner.model';
import { PaginatedList } from '../../../core/models/pagination.model';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexYAxis,
  ApexFill
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-business-partner-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    SearchableSelectComponent,
    DatePickerComponent,
    PrintPreviewModalComponent,
    NgApexchartsModule
  ],
  templateUrl: './business-partner-statement.component.html'
})
export class BusinessPartnerStatementComponent implements OnInit {
  private readonly businessPartnerService = inject(BusinessPartnerService);
  private readonly reportService = inject(ReportService);
  private readonly lookupService = inject(LookupService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly translate = inject(TranslateService);
  private readonly toastr = inject(ToastrService);

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;

  filters: LedgerFilters = {
    pageNumber: 1,
    pageSize: 10
  };

  businessPartnerId: number | null = null;

  summary: BalanceSummaryResponse | null = null;
  ledgerData: PaginatedList<BusinessPartnerLedgerResponse> = {
    items: [],
    pageIndex: 1,
    totalPages: 1,
    totalRecords: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  loading = false;
  summaryLoading = false;

  businessPartnersOptions: SearchableOption[] = [];

  // PDF Preview properties
  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;
  pdfBlob: Blob | null = null;

  ngOnInit(): void {
    this.loadLookups();
    this.initChart();

    this.route.queryParams.subscribe(params => {
      const idParam = params['id'] || params['partnerId'];
      if (idParam) {
        this.businessPartnerId = +idParam;
        this.loadData();
      }
    });
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: this.translate.instant('reports.businessPartnerStatement.balance'),
          data: []
        }
      ],
      chart: {
        height: 350,
        type: 'area',
        fontFamily: 'inherit',
        toolbar: { show: false }
      },
      colors: ['#3b82f6'], // blue-500
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        type: 'datetime',
        categories: []
      },
      tooltip: {
        x: { format: 'dd/MM/yy HH:mm' }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      }
    };
  }

  getAbs(value: number): number {
    return Math.abs(value || 0);
  }

  loadLookups(): void {
    this.businessPartnerService.getAll({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        this.businessPartnersOptions = res.items.map((bp: any) => ({
          value: bp.id,
          label: `${bp.code} - ${bp.name}`
        }));
      }
    });
  }

  onSearch(): void {
    if (!this.businessPartnerId) {
      return;
    }
    this.filters.pageNumber = 1;
    this.loadData();
  }

  loadData(): void {
    if (!this.businessPartnerId) return;

    this.loading = true;
    this.summaryLoading = true;

    this.businessPartnerService.getBalanceSummary(this.businessPartnerId).subscribe({
      next: (res) => {
        this.summary = res;
        this.summaryLoading = false;
      },
      error: () => this.summaryLoading = false
    });

    this.businessPartnerService.getLedger(this.businessPartnerId, this.filters).subscribe({
      next: (res) => {
        this.ledgerData = res;

        this.ledgerData.items = res.items.map(item => ({
          ...item,
          badgeColor: item.amount >= 0 ? 'warning' : 'success',
          entryTypeName: this.getEntryTypeName(item.entryType)
        } as any));

        this.updateChart();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateChart() {
    if (this.ledgerData && this.ledgerData.items.length > 0) {
      // Sort items by date ascending for chart
      const sortedItems = [...this.ledgerData.items].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

      const balances = sortedItems.map(x => x.runningBalance);
      const dates = sortedItems.map(x => new Date(x.entryDate).getTime());

      this.chartOptions.series = [{
        name: this.translate.instant('reports.businessPartnerStatement.balance'),
        data: balances
      }];
      this.chartOptions.xaxis = {
        ...this.chartOptions.xaxis,
        categories: dates
      };
    } else {
      this.chartOptions.series = [{ data: [] }];
      this.chartOptions.xaxis = { categories: [] };
    }
  }

  getEntryTypeName(type: string | number): string {
    if (type === null || type === undefined) return '';

    const numMap: Record<number, string> = {
      1: 'reports.businessPartnerStatement.entryTypes.invoice',
      2: 'reports.businessPartnerStatement.entryTypes.return',
      3: 'reports.businessPartnerStatement.entryTypes.payment',
      4: 'reports.businessPartnerStatement.entryTypes.adjustment',
      5: 'reports.businessPartnerStatement.entryTypes.openingbalance',
      6: 'reports.businessPartnerStatement.entryTypes.partnerpayment',
      7: 'reports.businessPartnerStatement.entryTypes.receipt',
      8: 'reports.businessPartnerStatement.entryTypes.manualjournal'
    };

    const num = Number(type);
    if (!isNaN(num) && numMap[num]) {
      return numMap[num];
    }

    const strKey = String(type).toLowerCase().replace(/[^a-z0-9]/g, '');
    const strMap: Record<string, string> = {
      'invoice': 'reports.businessPartnerStatement.entryTypes.invoice',
      'return': 'reports.businessPartnerStatement.entryTypes.return',
      'payment': 'reports.businessPartnerStatement.entryTypes.payment',
      'adjustment': 'reports.businessPartnerStatement.entryTypes.adjustment',
      'openingbalance': 'reports.businessPartnerStatement.entryTypes.openingbalance',
      'partnerpayment': 'reports.businessPartnerStatement.entryTypes.partnerpayment',
      'receipt': 'reports.businessPartnerStatement.entryTypes.receipt',
      'manualjournal': 'reports.businessPartnerStatement.entryTypes.manualjournal'
    };

    return strMap[strKey] || `reports.businessPartnerStatement.entryTypes.${strKey}`;
  }

  getEntryTypeBadgeClass(type: string | number): string {
    const num = Number(type);
    const key = typeof type === 'string' ? type.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    if (num === 1 || key === 'invoice') {
      return 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/30';
    }
    if (num === 2 || key === 'return') {
      return 'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-500/15 dark:text-warning-400 dark:border-warning-500/30';
    }
    if (num === 3 || key === 'payment') {
      return 'bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/15 dark:text-success-400 dark:border-success-500/30';
    }
    if (num === 4 || key === 'adjustment') {
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30';
    }
    if (num === 5 || key === 'openingbalance') {
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
    }
    if (num === 6 || key === 'partnerpayment') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    }
    if (num === 7 || key === 'receipt') {
      return 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30';
    }
    if (num === 8 || key === 'manualjournal') {
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
    }

    return 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }

  viewTransaction(row: BusinessPartnerLedgerResponse): void {
    const targetId = row.sourceId || row.paymentId || row.invoiceId;
    if (!targetId) return;

    const numType = Number(row.entryType);
    // If Payment (3), PartnerPayment (6), or Receipt (7), or has paymentId -> Go to Payment View Mode
    if (numType === 3 || numType === 6 || numType === 7 || row.paymentId) {
      this.router.navigate(['/finance/business-partner-payments/view', targetId]);
    }
    // If Invoice (1) or Return (2), or has invoiceId
    else if (numType === 1 || numType === 2 || row.invoiceId) {
      const code = (row.sourceCode || row.invoiceCode || '').toUpperCase();
      if (code.startsWith('PRN') || code.startsWith('PR')) {
        this.router.navigate(['/purchases/returns/view', targetId]);
      } else if (numType === 2 || code.startsWith('SRN') || code.startsWith('SR')) {
        this.router.navigate(['/sales/returns/view', targetId]);
      } else if (code.startsWith('PUR') || code.startsWith('PINV')) {
        this.router.navigate(['/purchases/invoices/view', targetId]);
      } else {
        this.router.navigate(['/invoices/sales/view', targetId]);
      }
    }
  }

  onPageChange(page: number): void {
    this.filters.pageNumber = page;
    this.loadData();
  }

  onPageSizeChange(size: any): void {
    this.filters.pageSize = size;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onReset(): void {
    this.filters = { pageNumber: 1, pageSize: 10 };
    this.businessPartnerId = null;
    this.summary = null;
    this.ledgerData = { items: [], pageIndex: 1, totalPages: 1, totalRecords: 0, hasPreviousPage: false, hasNextPage: false };
    this.chartOptions.series = [{ data: [] }];
  }

  exportExcel(): void {
    if (!this.businessPartnerId) return;
    const exportFilters = { ...this.filters, businessPartnerId: this.businessPartnerId, pageNumber: 1, pageSize: 10000 };

    this.reportService.exportStatementExcel(exportFilters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BP_Statement_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error(this.translate.instant('reports.exportError'))
    });
  }

  openPdfPreview(): void {
    if (!this.businessPartnerId) return;

    this.isPrintModalOpen = true;
    this.pdfLoading = true;

    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }

    const exportFilters = { ...this.filters, businessPartnerId: this.businessPartnerId, pageNumber: 1, pageSize: 10000 };

    this.reportService.exportStatementPdf(exportFilters)
      .pipe(finalize(() => this.pdfLoading = false))
      .subscribe({
        next: (blob) => {
          this.pdfBlob = blob;
          this.pdfBlobUrl = window.URL.createObjectURL(blob);
        },
        error: () => {
          this.toastr.error(this.translate.instant('reports.exportError'));
          this.isPrintModalOpen = false;
        }
      });
  }

  closePrintModal(): void {
    this.isPrintModalOpen = false;
    if (this.pdfBlobUrl) {
      setTimeout(() => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
          this.pdfBlobUrl = null;
        }
      }, 1000);
    }
  }
}
