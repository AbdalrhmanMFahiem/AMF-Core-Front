import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfigGeneralService } from '../../../core/services/config-general.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';

@Component({
  selector: 'app-general-settings',
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
  templateUrl: './general-settings.component.html'
})
export class GeneralSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configGeneralService = inject(ConfigGeneralService);
  private translate = inject(TranslateService);

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';

  isOpen = false;

  settings = {
    enableSapIntegration: false,
    defaultActivationOnCreate: true,
    allowManualWorkorders: false,
    addingWorkordersToSAP: false,
    enableLocalization: false,
    autoFillEnglishName: false,
    notes: ''
  };

  constructor() {
    this.form = this.fb.group({
      defaultActivationOnCreate: [true],
      enableLocalization: [false],
      autoFillEnglishName: [false],
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
    this.configGeneralService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          const data = (res as any).data || (res as any).value || res;
          this.settings = {
            enableSapIntegration: data.enableSapIntegration ?? data.EnableSapIntegration ?? false,
            defaultActivationOnCreate: data.defaultActivationOnCreate ?? data.DefaultActivationOnCreate ?? true,
            allowManualWorkorders: data.allowManualWorkorders ?? data.AllowManualWorkorders ?? false,
            addingWorkordersToSAP: data.addingWorkordersToSAP ?? data.AddingWorkordersToSAP ?? false,
            enableLocalization: data.enableLocalization ?? data.EnableLocalization ?? false,
            autoFillEnglishName: data.autoFillEnglishName ?? data.AutoFillEnglishName ?? false,
            notes: data.notes ?? data.Notes ?? ''
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
    
    // We send PascalCase properties to guarantee binding with the C# record constructor in case camelCase mapping isn't active
    const payload: any = {
      EnableSapIntegration: this.settings.enableSapIntegration,
      DefaultActivationOnCreate: this.form.value.defaultActivationOnCreate,
      AllowManualWorkorders: this.settings.allowManualWorkorders,
      AddingWorkordersToSAP: this.settings.addingWorkordersToSAP,
      EnableLocalization: this.form.value.enableLocalization,
      AutoFillEnglishName: this.form.value.autoFillEnglishName,
      Notes: this.form.value.notes
    };

    this.configGeneralService.updateSettings(payload).subscribe({
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
