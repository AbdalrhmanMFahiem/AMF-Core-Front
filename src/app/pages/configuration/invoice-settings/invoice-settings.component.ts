import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigInvoiceService } from '../../../core/services/config-invoice.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';

@Component({
  selector: 'app-invoice-settings',
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
  templateUrl: './invoice-settings.component.html'
})
export class InvoiceSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configInvoiceService = inject(ConfigInvoiceService);
  private translate = inject(TranslateService);

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';

  isOpen = false;

  settings = {
    allowSaveInvoiceWithoutPayment: false,
    requireCostElementPercentage: true,
    notes: ''
  };

  constructor() {
    this.form = this.fb.group({
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
    this.configInvoiceService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          this.settings = {
            allowSaveInvoiceWithoutPayment: res.allowSaveInvoiceWithoutPayment,
            requireCostElementPercentage: res.requireCostElementPercentage,
            notes: res.notes || ''
          };
          this.form.patchValue(res);
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
    
    this.configInvoiceService.updateSettings(this.form.value).subscribe({
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
