import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigInventoryService } from '../../../core/services/config-inventory.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';

@Component({
  selector: 'app-inventory-settings',
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
  templateUrl: './inventory-settings.component.html'
})
export class InventorySettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configInventoryService = inject(ConfigInventoryService);
  private translate = inject(TranslateService);

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';

  isOpen = false;

  settings = {
    allowNegativeStock: false,
    requireStockBeforeConfirm: true,
    valuationMethod: 'WeightedAverage',
    autoPostInventoryOnSave: false,
    invoicesDirectlyAffectInventory: false,
    notes: ''
  };

  constructor() {
    this.form = this.fb.group({
      allowNegativeStock: [false],
      requireStockBeforeConfirm: [true],
      valuationMethod: ['WeightedAverage'],
      autoPostInventoryOnSave: [false],
      invoicesDirectlyAffectInventory: [false],
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
    this.configInventoryService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          const data = (res as any).value || res;
          this.settings = {
            allowNegativeStock: data.allowNegativeStock || false,
            requireStockBeforeConfirm: data.requireStockBeforeConfirm || false,
            valuationMethod: data.valuationMethod || 'WeightedAverage',
            autoPostInventoryOnSave: data.autoPostInventoryOnSave || false,
            invoicesDirectlyAffectInventory: data.invoicesDirectlyAffectInventory || false,
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

    this.configInventoryService.updateSettings(this.form.value).subscribe({
      next: () => {
        this.settings = { ...this.settings, ...this.form.value };
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
