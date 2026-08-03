import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BusinessPartnerService } from '../../../core/services/business-partner.service';
import { BusinessPartnerResponse, QuickVendorRequest } from '../../../core/models/business-partner.model';

@Component({
  selector: 'app-quick-vendor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './quick-vendor-modal.component.html'
})
export class QuickVendorModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() vendorCreated = new EventEmitter<BusinessPartnerResponse>();

  private businessPartnerService = inject(BusinessPartnerService);

  saving = false;
  errorMessage = '';

  model: QuickVendorRequest = {
    code: '',
    aName: '',
    eName: '',
    phoneNumber: '',
    email: '',
    address: '',
    notes: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
      this.loadNextCode();
    }
  }

  resetForm(): void {
    this.errorMessage = '';
    this.model = {
      code: '',
      aName: '',
      eName: '',
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };
  }

  loadNextCode(): void {
    this.businessPartnerService.getNextCode(false, true).subscribe({
      next: (res) => {
        if (res && res.nextCode) {
          this.model.code = res.nextCode;
        }
      },
      error: () => {}
    });
  }

  closeModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onSubmit(): void {
    if (!this.model.aName || !this.model.aName.trim()) {
      this.errorMessage = 'الاسم العربي مطلوب';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.businessPartnerService.quickCreateVendor(this.model).subscribe({
      next: (response) => {
        this.saving = false;
        this.vendorCreated.emit(response);
        this.closeModal();
      },
      error: (err) => {
        this.saving = false;
        if (err.error?.detail) {
          this.errorMessage = err.error.detail;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'حدث خطأ أثناء حفظ المورد';
        }
      }
    });
  }
}
