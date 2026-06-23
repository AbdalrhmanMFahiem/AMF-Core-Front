import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SearchableSelectComponent, SearchableOption } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { CrudListComponent } from '../../../shared/components/common/crud-list/crud-list.component';
import { DatePickerComponent } from '../../../shared/components/form/date-picker/date-picker.component';
import { BusinessPartnerService } from '../../../core/services/business-partner.service';
import { LookupService } from '../../../core/services/lookup.service';
import { LedgerFilters, BalanceSummaryResponse, BusinessPartnerLedgerResponse } from '../../../core/models/business-partner.model';
import { PaginatedList } from '../../../core/models/pagination.model';
import { forkJoin } from 'rxjs';

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
    CrudListComponent,
    DatePickerComponent
  ],
  templateUrl: './business-partner-statement.component.html'
})
export class BusinessPartnerStatementComponent implements OnInit {
  private businessPartnerService = inject(BusinessPartnerService);
  private lookupService = inject(LookupService);
  public translate = inject(TranslateService);

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

  columns = [
    { field: 'entryDate', header: 'Common.date', type: 'date' as const },
    { field: 'invoiceCode', header: 'reports.businessPartnerStatement.table.invoiceCode', type: 'text' as const },
    { field: 'entryTypeName', header: 'reports.businessPartnerStatement.entryType', type: 'badge' as const },
    { field: 'amount', header: 'reports.businessPartnerStatement.table.amount', type: 'text' as const },
    { field: 'runningBalance', header: 'reports.businessPartnerStatement.balance', type: 'text' as const },
    { field: 'notes', header: 'reports.businessPartnerStatement.table.notes', type: 'text' as const }
  ];

  ngOnInit(): void {
    this.loadLookups();
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
    
    // Reset pagination on new search
    this.filters.pageNumber = 1;
    this.loadData();
  }

  loadData(): void {
    if (!this.businessPartnerId) return;

    this.loading = true;
    this.summaryLoading = true;

    // Load Summary
    this.businessPartnerService.getBalanceSummary(this.businessPartnerId).subscribe({
      next: (res) => {
        this.summary = res;
        this.summaryLoading = false;
      },
      error: () => this.summaryLoading = false
    });

    // Load Ledger
    this.businessPartnerService.getLedger(this.businessPartnerId, this.filters).subscribe({
      next: (res) => {
        this.ledgerData = res;
        
        // Format entry types for badges
        this.ledgerData.items = res.items.map(item => ({
          ...item,
          // Badge color based on amount (positive debit / negative credit)
          badgeColor: item.amount >= 0 ? 'warning' : 'success',
          entryTypeName: this.getEntryTypeName(item.entryType)
        } as any));
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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

  onReset(): void {
    this.filters = { pageNumber: 1, pageSize: 10 };
    this.businessPartnerId = null;
    this.summary = null;
    this.ledgerData = { items: [], pageIndex: 1, totalPages: 1, totalRecords: 0, hasPreviousPage: false, hasNextPage: false };
  }
}
