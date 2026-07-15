import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ReportService, WarehouseItemsStockResponse } from '../../../core/services/report.service';
import { LookupService } from '../../../core/services/lookup.service';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { MultiSelectComponent } from '../../../shared/components/form/multi-select/multi-select.component';
import { SearchableSelectComponent } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { PrintPreviewModalComponent } from '../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { Option } from '../../../shared/components/form/multi-select/multi-select.component';

@Component({
  selector: 'app-warehouse-items-stock',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    MultiSelectComponent,
    SearchableSelectComponent,
    PrintPreviewModalComponent
  ],
  templateUrl: './warehouse-items-stock.component.html'
})
export class WarehouseItemsStockComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly lookupService = inject(LookupService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  filterForm!: FormGroup;
  
  items: WarehouseItemsStockResponse[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageNumber = 1;
  hasPreviousPage = false;
  hasNextPage = false;
  totalPages = 1;
  pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ];

  warehouses: Option[] = [];
  warehousesLoading = false;
  selectedWarehouseIds: string[] = [];
  
  // PDF Preview properties
  isPrintModalOpen = false;
  pdfBlobUrl: string | null = null;
  pdfLoading = false;
  pdfBlob: Blob | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadWarehouses();
    this.loadData();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      searchValue: [''],
      hideZeroStock: [false]
    });
  }

  loadWarehouses(): void {
    this.warehousesLoading = true;
    this.lookupService.getWarehouses()
      .pipe(finalize(() => this.warehousesLoading = false))
      .subscribe({
        next: (res: any) => {
          this.warehouses = res.map((w: any) => ({
            value: w.id.toString(),
            text: w.name
          }));
        },
        error: () => this.toastr.error(this.translate.instant('common.error'))
      });
  }

  loadData(): void {
    this.loading = true;
    
    // MultiSelectComponent returns an array of string IDs, we need to convert them to numbers
    const warehouseIds = this.selectedWarehouseIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    const filters = {
      ...this.filterForm.value,
      warehouseIds: warehouseIds.length > 0 ? warehouseIds : null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.reportService.getWarehouseItemsStockReport(filters)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          const isSuccess = response.isSuccess !== undefined ? response.isSuccess : response.succeeded;
          if (isSuccess) {
            const data = response.value || response.data;
            this.items = data?.items || [];
            this.totalItems = data?.totalRecords || data?.totalCount || 0;
            this.hasPreviousPage = data?.hasPreviousPage || false;
            this.hasNextPage = data?.hasNextPage || false;
            this.totalPages = data?.totalPages || 1;
          } else {
            const errorMsg = response.error?.description || response.messages?.[0] || 'Error fetching data';
            this.toastr.error(errorMsg);
          }
        },
        error: () => this.toastr.error(this.translate.instant('common.error'))
      });
  }

  onWarehouseSelectionChange(selected: string[]): void {
    this.selectedWarehouseIds = selected;
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  onReset(): void {
    this.filterForm.reset({
      hideZeroStock: false
    });
    this.selectedWarehouseIds = [];
    this.onSearch();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadData();
  }
  
  onPageSizeChange(size: any): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadData();
  }

  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadData();
    }
  }

  onNextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadData();
    }
  }

  exportExcel(): void {
    const warehouseIds = this.selectedWarehouseIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const filters = { 
      ...this.filterForm.value, 
      warehouseIds: warehouseIds.length > 0 ? warehouseIds : null,
      pageNumber: 1, 
      pageSize: 10000 
    };
    this.reportService.exportWarehouseItemsStockExcel(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Warehouse_Stock_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error(this.translate.instant('reports.exportError'))
    });
  }

  openPdfPreview(): void {
    this.isPrintModalOpen = true;
    this.pdfLoading = true;
    
    // Revoke previous url if exists
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }

    const warehouseIds = this.selectedWarehouseIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const filters = { 
      ...this.filterForm.value, 
      warehouseIds: warehouseIds.length > 0 ? warehouseIds : null,
      pageNumber: 1, 
      pageSize: 10000 
    };
    
    this.reportService.exportWarehouseItemsStockPdf(filters)
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
      // Don't revoke immediately to allow printing to finish if needed, but since we are closing we can.
      setTimeout(() => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
          this.pdfBlobUrl = null;
        }
      }, 1000);
    }
  }
}
