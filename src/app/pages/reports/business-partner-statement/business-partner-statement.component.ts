import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { SearchableSelectComponent, SearchableOption } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { BusinessPartnerService } from '../../../core/services/business-partner.service';
import { LookupService } from '../../../core/services/lookup.service';
import { StatementFilter, BusinessPartnerStatementResponse } from '../../../core/models/report.model';

@Component({
  selector: 'app-business-partner-statement',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageBreadcrumbComponent, ComponentCardComponent, SearchableSelectComponent],
  templateUrl: './business-partner-statement.component.html'
})
export class BusinessPartnerStatementComponent implements OnInit {
  private businessPartnerService = inject(BusinessPartnerService);
  private lookupService = inject(LookupService);
  public translate = inject(TranslateService);

  filters: StatementFilter = {};
  data: BusinessPartnerStatementResponse | null = null;
  loading = false;

  businessPartnersOptions: SearchableOption[] = [];

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    // For statement, we typically want all business partners (both customers and vendors)
    // We will use vendors lookup for now, or if we had a generic business partners lookup we'd use it.
    // Given the lookup service has getVendors(), we'll use that as a placeholder or we can fetch all from getAll.
    // Actually, let's fetch basic lookup for business partners
    this.businessPartnerService.getAll({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        this.businessPartnersOptions = res.items.map((bp: any) => ({
          value: bp.id,
          label: `${bp.code} - ${bp.aName}`
        }));
      }
    });
  }

  onSearch(): void {
    if (!this.filters.businessPartnerId) {
      return; // Do not search if no partner is selected
    }

    this.loading = true;
    this.businessPartnerService.getStatement(this.filters).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Handle error (e.g., API might not be implemented yet)
        console.error('Failed to load statement');
      }
    });
  }

  onReset(): void {
    this.filters = {};
    this.data = null;
  }
}
