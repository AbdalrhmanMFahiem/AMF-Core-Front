import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { BusinessPartnerService } from '../../../../core/services/business-partner.service';
import { BusinessPartnerRequest, LedgerEntryType } from '../../../../core/models/business-partner.model';
import { DatePickerComponent } from '../../../../shared/components/form/date-picker/date-picker.component';

@Component({
  selector: 'app-business-partner-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComponentCardComponent, PageBreadcrumbComponent, SuccessRedirectBannerComponent, ErrorBannerComponent, DatePickerComponent, SearchableSelectComponent],
  templateUrl: './business-partner-form.component.html',
})
export class BusinessPartnerFormComponent implements OnInit {
  private businessPartnerService = inject(BusinessPartnerService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);



  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess: boolean = false;
  validationErrors: string[] = [];

  model: BusinessPartnerRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    notes: '',
    isActive: true,
    isCustomer: true,
    isVendor: false,
    phone: '',
    email: '',
    address: ''
  };

  activeTab: 'basic' | 'ledger' = 'basic';
  ledgerData: any[] = []; // BusinessPartnerLedgerResponse
  loadingLedger = false;
  totalLedgerRecords = 0;
  ledgerFilters: any = {
    pageNumber: 1,
    pageSize: 10,
    from: undefined,
    to: undefined,
    entryType: undefined
  };
  ledgerEntryType = LedgerEntryType;
  public ledgerFiltersEntryType: SearchableOption[] = [];

  ngOnInit(): void {
    this.initializeLedgerFiltersEntryType();

    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadBusinessPartner(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  loadBusinessPartner(id: number): void {
    this.loading = true;
    this.businessPartnerService.get(id).subscribe({
      next: (res) => {
        this.model = {
          ...res,
          eName: res.eName || '',
          notes: res.notes || '',
          phone: res.phone || '',
          email: res.email || '',
          address: res.address || ''
        };
        this.loading = false;
        this.loadLedger();
      },
      error: () => this.loading = false
    });
  }

  loadLedger(): void {
    if (!this.id) return;
    this.loadingLedger = true;
    this.businessPartnerService.getLedger(this.id, this.ledgerFilters).subscribe({
      next: (res) => {
        this.ledgerData = res.items;
        this.totalLedgerRecords = res.totalRecords;
        this.loadingLedger = false;
      },
      error: () => {
        this.loadingLedger = false;
      }
    });
  }

  onLedgerPageChange(pageNumber: number): void {
    this.ledgerFilters.pageNumber = pageNumber;
    this.loadLedger();
  }

  applyLedgerFilter(): void {
    this.ledgerFilters.pageNumber = 1;
    this.loadLedger();
  }

  clearLedgerFilter(): void {
    this.ledgerFilters = {
      pageNumber: 1,
      pageSize: 10,
      from: undefined,
      to: undefined,
      entryType: undefined
    };
    this.loadLedger();
  }

  setTab(tab: 'basic' | 'ledger'): void {
    this.activeTab = tab;
  }

  getNextCode(): void {
    this.businessPartnerService.getNextCode().subscribe(res => {
      this.model.code = res.nextCode;
    });
  }

  validate(): boolean {
    this.validationErrors = [];
    let isValid = true;

    if (!this.model.code) {
      this.validationErrors.push(`${this.translate.instant('businessPartners.fields.code')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }
    if (!this.model.aName) {
      this.validationErrors.push(`${this.translate.instant('businessPartners.fields.aName')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.mode === 'view' || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    const observer = {
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
      },
      error: (err: any) => {
        this.saving = false;
        if (err?.error?.message) {
          this.validationErrors = [err.error.message];
        } else if (err?.error?.errors) {
          if (Array.isArray(err.error.errors)) {
            this.validationErrors = err.error.errors.map((e: any) => e.description || e.errorMessage || (typeof e === 'string' ? e : JSON.stringify(e)));
          } else {
            this.validationErrors = Object.values(err.error.errors).flat() as string[];
          }
        } else {
          this.validationErrors = [this.translate.instant('errors.generic')];
        }
      }
    };

    if (this.mode === 'add') {
      this.businessPartnerService.create(this.model).subscribe(observer);
    } else {
      this.businessPartnerService.update(this.id!, this.model).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/master-data/business-partners']);
  }

  private initializeLedgerFiltersEntryType(): void {
    this.ledgerFiltersEntryType = [
      // { value: 'All', label: this.translate.instant('Common.All') },
      { value: LedgerEntryType.Payment, label: this.translate.instant('ledger.typeEnum.Payment') },
      { value: LedgerEntryType.Adjustment, label: this.translate.instant('ledger.typeEnum.Adjustment') },
      { value: LedgerEntryType.Invoice, label: this.translate.instant('ledger.typeEnum.Invoice') },
      { value: LedgerEntryType.Return, label: this.translate.instant('ledger.typeEnum.Return') },
    ];
  }

}
