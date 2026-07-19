import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { ReportService, InvoiceReportResponse } from '../../../core/services/report.service';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SearchableSelectComponent } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { DatePickerComponent } from '../../../shared/components/form/date-picker/date-picker.component';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    SearchableSelectComponent,
    BadgeComponent,
    DatePickerComponent
  ],
  templateUrl: './sales-report.component.html'
})
export class SalesReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  filterForm!: FormGroup;
  
  items: InvoiceReportResponse[] = [];
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

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      searchValue: [''],
      dateFrom: [''],
      dateTo: ['']
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup) {
    const from = group.get('dateFrom')?.value;
    const to = group.get('dateTo')?.value;
    if (from && to && new Date(from) > new Date(to)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  loadData(): void {
    this.loading = true;
    
    const filters = {
      ...this.filterForm.value,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.reportService.getSalesReport(filters)
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

  onSearch(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  onReset(): void {
    this.filterForm.reset({
      searchValue: '',
      dateFrom: '',
      dateTo: ''
    });
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

  getStatusTranslation(status: string): string {
    return 'common.documentStatus.' + status;
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' {
    switch (status) {
      case 'Draft': return 'warning';
      case 'Open': return 'success';
      case 'Confirmed': return 'success';
      case 'Closed': return 'error';
      case 'Cancelled': return 'error';
      default: return 'primary';
    }
  }
}
