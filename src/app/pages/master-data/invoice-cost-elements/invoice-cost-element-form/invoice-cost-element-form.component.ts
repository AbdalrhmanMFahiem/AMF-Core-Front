import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoiceCostElementService } from '../../../../core/services/invoice-cost-element.service';
import {
  InvoiceCostElementRequest,
  InvoiceCostElementResponse,
  InvoiceCostElementType,
  InvoiceCostOperation
} from '../../../../core/models/invoice-cost-element.model';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { SearchableSelectComponent, SearchableOption } from '../../../../shared/components/form/searchable-select/searchable-select.component';

@Component({
  selector: 'app-invoice-cost-element-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent,
    SearchableSelectComponent
  ],
  templateUrl: './invoice-cost-element-form.component.html',
  styleUrls: ['./invoice-cost-element-form.component.css']
})
export class InvoiceCostElementFormComponent implements OnInit {
  private invoiceCostElementService = inject(InvoiceCostElementService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  saveSuccess = false;
  validationErrors: string[] = [];

  model: InvoiceCostElementRequest = {
    id: 0,
    code: '',
    aName: '',
    eName: '',
    type: InvoiceCostElementType.Both,
    operationType: InvoiceCostOperation.Addition,
    defaultPercentage: undefined,
    notes: '',
    isActive: true
  };

  costElementTypes = Object.values(InvoiceCostElementType);
  operationTypes = Object.values(InvoiceCostOperation);

  typeOptions: SearchableOption[] = [];
  operationTypeOptions: SearchableOption[] = [];

  ngOnInit(): void {
    this.initOptions();
    this.translate.onLangChange.subscribe(() => {
      this.initOptions();
    });

    this.route.url.subscribe(url => {
      const path = url[url.length - (this.route.snapshot.paramMap.has('id') ? 2 : 1)]?.path;
      if (path === 'edit') this.mode = 'edit';
      else if (path === 'view') this.mode = 'view';
      else this.mode = 'add';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadRecord(this.id);
    } else if (this.mode === 'add') {
      this.getNextCode();
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.invoiceCostElementService.get(id).subscribe({
      next: (res: InvoiceCostElementResponse) => {
        this.model = {
          id: res.id,
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          type: res.type,
          operationType: res.operationType,
          defaultPercentage: res.defaultPercentage,
          notes: res.notes,
          isActive: res.isActive
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading record', err);
        this.loading = false;
      }
    });
  }

  getNextCode(): void {
    this.invoiceCostElementService.getNextCode().subscribe({
      next: (res) => {
        this.model.code = res.nextCode;
      },
      error: (err) => console.error('Error fetching next code', err)
    });
  }

  initOptions() {
    this.typeOptions = this.costElementTypes.map(t => ({
      value: t,
      label: this.translate.instant('invoiceCostElements.type.' + t)
    }));
    this.operationTypeOptions = this.operationTypes.map(o => ({
      value: o,
      label: this.translate.instant('invoiceCostElements.operationType.' + o)
    }));
  }

  validate(): boolean {
    this.validationErrors = [];
    let isValid = true;

    if (!this.model.code) {
      this.validationErrors.push(`${this.translate.instant('common.code')}: ${this.translate.instant('validation.required')}`);
      isValid = false;
    }
    if (!this.model.aName) {
      this.validationErrors.push(`${this.translate.instant('common.arabicName')}: ${this.translate.instant('validation.required')}`);
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
      this.invoiceCostElementService.create(this.model).subscribe(observer);
    } else {
      this.invoiceCostElementService.update(this.id!, this.model).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory/invoice-cost-elements']);
  }
}
