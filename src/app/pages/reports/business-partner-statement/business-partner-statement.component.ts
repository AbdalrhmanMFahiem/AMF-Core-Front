import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { LedgerFilters, BalanceSummaryResponse, BusinessPartnerLedgerResponse } from '../../../core/models/business-partner.model';
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

  getEntryTypeName(type: number): string {
    const map: Record<number, string> = {
      1: 'Sales Invoice',
      2: 'Sales Return',
      3: 'Purchase Invoice',
      4: 'Purchase Return',
      5: 'Opening Balance',
      6: 'Payment',
      7: 'Receipt',
      8: 'Manual Journal'
    };
    return map[type] || type.toString();
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
