import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportService } from '../../../core/services/report.service';
import { SalesRepService } from '../../../core/services/sales-rep.service';
import { BusinessPartnerService } from '../../../core/services/business-partner.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { SalesRepResponse } from '../../../core/models/sales-rep.model';

@Component({
  selector: 'app-sales-rep-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './sales-rep-report.component.html',
  styleUrls: ['./sales-rep-report.component.css']
})
export class SalesRepReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private salesRepService = inject(SalesRepService);
  private partnerService = inject(BusinessPartnerService);
  private warehouseService = inject(WarehouseService);
  public translate = inject(TranslateService);

  salesReps: SalesRepResponse[] = [];
  customers: any[] = [];
  warehouses: any[] = [];

  filters: any = {
    salesRepUserId: '',
    periodType: 'today',
    dateFrom: null,
    dateTo: null,
    businessPartnerId: null,
    warehouseId: null,
    pageNumber: 1,
    pageSize: 20
  };

  summary: any = {
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    customersServed: 0,
    averageInvoiceValue: 0
  };

  invoices: any[] = [];
  totalCount: number = 0;
  totalPages: number = 1;
  loading: boolean = false;
  exporting: boolean = false;

  ngOnInit(): void {
    this.loadLookups();
    this.loadReport();
  }

  loadLookups(): void {
    this.salesRepService.getAll().subscribe((res: any) => this.salesReps = res);
    this.partnerService.getAll({ pageNumber: 1, pageSize: 500 }).subscribe((res: any) => this.customers = res.items || res);
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe((res: any) => this.warehouses = res.items || res);
  }

  setPeriod(period: string): void {
    this.filters.periodType = period;
    this.filters.pageNumber = 1;
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.reportService.getSalesRepReport(this.filters).subscribe({
      next: (res: any) => {
        this.summary = res.summary || this.summary;
        if (res.invoices) {
          this.invoices = res.invoices.items || [];
          this.totalCount = res.invoices.totalCount || 0;
          this.totalPages = res.invoices.totalPages || 1;
        } else {
          this.invoices = [];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.pageNumber = 1;
    this.loadReport();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filters.pageNumber = page;
      this.loadReport();
    }
  }

  exportExcel(): void {
    this.exporting = true;
    this.reportService.exportSalesRepReportExcel(this.filters).subscribe({
      next: (blob: Blob) => {
        this.exporting = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SalesRepReport_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exporting = false;
      }
    });
  }
}
