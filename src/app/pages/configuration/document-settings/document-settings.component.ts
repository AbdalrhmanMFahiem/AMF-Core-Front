import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigDocumentService, ConfigDocumentResponse } from '../../../core/services/config-document.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';

@Component({
  selector: 'app-document-settings',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule,
    PageBreadcrumbComponent,
    ModalComponent,
    ButtonComponent,
    LabelComponent
  ],
  templateUrl: './document-settings.component.html'
})
export class DocumentSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configDocumentService = inject(ConfigDocumentService);
  private translate = inject(TranslateService);

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  isOpen = false;

  settings: ConfigDocumentResponse = {
    id: 0,
    autoApprovePurchaseOrders: false,
    autoApprovePurchaseInvoices: false,
    autoApproveSalesOrders: false,
    autoApproveSalesInvoices: false,
    requireStockBeforeConfirm: true,
    allowSaveInvoiceWithoutPayment: false,
    requireCostElementPercentage: true,
    notes: ''
  };

  constructor() {
    this.form = this.fb.group({
      autoApprovePurchaseOrders: [false],
      autoApprovePurchaseInvoices: [false],
      autoApproveSalesOrders: [false],
      autoApproveSalesInvoices: [false],
      requireStockBeforeConfirm: [true],
      allowSaveInvoiceWithoutPayment: [false],
      requireCostElementPercentage: [true],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  openModal() { 
    this.form.patchValue(this.settings);
    this.isOpen = true; 
  }
  
  closeModal() { 
    this.isOpen = false; 
    this.successMessage = '';
  }

  loadSettings() {
    this.isLoading = true;
    this.configDocumentService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          const data = (res as any).value || res;
          this.settings = {
            id: data.id || 0,
            autoApprovePurchaseOrders: data.autoApprovePurchaseOrders ?? false,
            autoApprovePurchaseInvoices: data.autoApprovePurchaseInvoices ?? false,
            autoApproveSalesOrders: data.autoApproveSalesOrders ?? false,
            autoApproveSalesInvoices: data.autoApproveSalesInvoices ?? false,
            requireStockBeforeConfirm: data.requireStockBeforeConfirm ?? true,
            allowSaveInvoiceWithoutPayment: data.allowSaveInvoiceWithoutPayment ?? false,
            requireCostElementPercentage: data.requireCostElementPercentage ?? true,
            defaultWarehouseId: data.defaultWarehouseId,
            notes: data.notes || ''
          };
          this.form.patchValue(this.settings);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.successMessage = '';
    
    this.configDocumentService.updateSettings(this.form.value).subscribe({
      next: () => {
        this.settings = { ...this.settings, ...this.form.value, notes: this.form.value.notes || '' };
        this.isSaving = false;
        this.successMessage = this.translate.instant('common.savedSuccessfully');
        setTimeout(() => {
          this.successMessage = '';
          this.closeModal();
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }
}
