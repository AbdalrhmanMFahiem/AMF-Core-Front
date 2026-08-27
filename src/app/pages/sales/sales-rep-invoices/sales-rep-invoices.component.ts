import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SalesRepService } from '../../../core/services/sales-rep.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import {
  SalesRepCustomerResponse,
  SalesRepWarehouseResponse
} from '../../../core/models/sales-rep.model';
import { InvoiceBasicResponse, InvoiceFilters } from '../../../core/models/invoice.model';
import { PaginatedList } from '../../../core/models/pagination.model';
import { PrintPreviewModalComponent } from '../../../shared/components/common/print-preview-modal/print-preview-modal.component';

@Component({
  selector: 'app-sales-rep-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    PrintPreviewModalComponent
  ],
  templateUrl: './sales-rep-invoices.component.html'
})
export class SalesRepInvoicesComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  loading: boolean = false;
  invoicesData: PaginatedList<InvoiceBasicResponse> | null = null;

  customers: SalesRepCustomerResponse[] = [];
  warehouses: SalesRepWarehouseResponse[] = [];

  filters: InvoiceFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    businessPartnerId: undefined,
    warehouseId: undefined,
    status: undefined,
    paymentStatus: undefined,
    invoiceDateFrom: undefined,
    invoiceDateTo: undefined
  };

  // Print Preview Modal State
  isPrintPreviewOpen: boolean = false;
  pdfBlobUrl: string | null = null;
  pdfLoading: boolean = false;
  printPreviewTitle: string = '';

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWarehouses();
    this.loadInvoices();
  }

  loadCustomers(): void {
    this.salesRepService.getMyCustomers().subscribe({
      next: (res) => (this.customers = res || [])
    });
  }

  loadWarehouses(): void {
    this.salesRepService.getMyWarehouses().subscribe({
      next: (res) => (this.warehouses = res || [])
    });
  }

  loadInvoices(): void {
    this.loading = true;
    this.salesRepService.getMyInvoices(this.filters).subscribe({
      next: (res) => {
        this.invoicesData = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  onSearch(): void {
    this.filters.pageNumber = 1;
    this.loadInvoices();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchValue: '',
      businessPartnerId: undefined,
      warehouseId: undefined,
      status: undefined,
      paymentStatus: undefined,
      invoiceDateFrom: undefined,
      invoiceDateTo: undefined
    };
    this.loadInvoices();
  }

  goToPage(page: number): void {
    if (page < 1 || (this.invoicesData && page > this.invoicesData.totalPages)) {
      return;
    }
    this.filters.pageNumber = page;
    this.loadInvoices();
  }

  onPageSizeChange(event: any): void {
    this.filters.pageSize = Number(event.target.value);
    this.filters.pageNumber = 1;
    this.loadInvoices();
  }

  // ── Printing & Navigation ──────────────────────────────────────────────────

  openStandardPrint(invoiceId: number, invoiceCode: string): void {
    this.pdfLoading = true;
    this.isPrintPreviewOpen = true;
    this.printPreviewTitle = `${this.translate.instant('quickSale.printStandard')} - ${invoiceCode}`;

    this.invoiceService.printPdf(invoiceId).subscribe({
      next: (blob: Blob) => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
        }
        this.pdfBlobUrl = window.URL.createObjectURL(blob);
        this.pdfLoading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
        this.pdfLoading = false;
        this.isPrintPreviewOpen = false;
      }
    });
  }

  openReceiptPrint(invoiceId: number, invoiceCode: string): void {
    this.pdfLoading = true;
    this.isPrintPreviewOpen = true;
    this.printPreviewTitle = `${this.translate.instant('quickSale.printReceipt')} - ${invoiceCode}`;

    this.invoiceService.printReceiptPdf(invoiceId).subscribe({
      next: (blob: Blob) => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
        }
        this.pdfBlobUrl = window.URL.createObjectURL(blob);
        this.pdfLoading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
        this.pdfLoading = false;
        this.isPrintPreviewOpen = false;
      }
    });
  }

  closePrintPreview(): void {
    this.isPrintPreviewOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  viewInvoice(invoiceId: number): void {
    this.router.navigate(['/invoices/sales/view', invoiceId]);
  }

  getStatusClass(status: string | number): string {
    const s = String(status).toLowerCase();
    if (s === 'closed' || s === '1') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    }
    if (s === 'draft' || s === '0') {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    }
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
  }

  getPaymentStatusClass(paymentStatus: string | number): string {
    const s = String(paymentStatus).toLowerCase();
    if (s === 'paid' || s === 'fullypaid' || s === '2') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    }
    if (s === 'partiallypaid' || s === 'partial' || s === '1') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/60';
    }
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
  }
}
