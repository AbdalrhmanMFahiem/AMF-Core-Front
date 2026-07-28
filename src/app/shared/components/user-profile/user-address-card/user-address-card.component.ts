import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileService, UserProfileData } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-user-address-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './user-address-card.component.html'
})
export class UserAddressCardComponent implements OnChanges {
  private profileService = inject(ProfileService);

  @Input() profile: UserProfileData | null = null;
  @Output() profileUpdated = new EventEmitter<void>();

  isOpen = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    governorate: '',
    country: '',
    postalCode: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile) {
      this.populateForm();
    }
  }

  populateForm() {
    if (!this.profile) return;
    this.form = {
      addressLine1: this.profile.addressLine1 || '',
      addressLine2: this.profile.addressLine2 || '',
      city: this.profile.city || '',
      governorate: this.profile.governorate || '',
      country: this.profile.country || 'مصر',
      postalCode: this.profile.postalCode || ''
    };
  }

  openModal() {
    this.populateForm();
    this.isOpen = true;
    this.errorMessage = null;
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave() {
    this.isSaving = true;
    this.errorMessage = null;

    const payload = {
      firstAName: this.profile?.firstAName || '',
      lastAName: this.profile?.lastAName || '',
      firstEName: this.profile?.firstEName,
      lastEName: this.profile?.lastEName,
      addressLine1: this.form.addressLine1,
      addressLine2: this.form.addressLine2,
      city: this.form.city,
      governorate: this.form.governorate,
      country: this.form.country,
      postalCode: this.form.postalCode
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'تم تحديث بيانات العنوان بنجاح';
        this.closeModal();
        this.profileUpdated.emit();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Failed to update address', err);
        this.errorMessage = 'حدث خطأ أثناء حفظ العنوان';
      }
    });
  }
}
