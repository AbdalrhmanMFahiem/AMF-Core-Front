import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService, UserProfileData } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './user-info-card.component.html'
})
export class UserInfoCardComponent implements OnChanges {
  private profileService = inject(ProfileService);
  private translate = inject(TranslateService);

  @Input() profile: UserProfileData | null = null;
  @Output() profileUpdated = new EventEmitter<void>();

  isOpen = false;
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = {
    firstAName: '',
    lastAName: '',
    firstEName: '',
    lastEName: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile) {
      this.populateForm();
    }
  }

  populateForm() {
    if (!this.profile) return;
    this.form = {
      firstAName: this.profile.firstAName || '',
      lastAName: this.profile.lastAName || '',
      firstEName: this.profile.firstEName || '',
      lastEName: this.profile.lastEName || ''
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
    if (!this.form.firstAName || !this.form.lastAName) {
      this.errorMessage = 'يرجى إدخال الاسم الأول واسم العائلة بالعربي';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const payload = {
      firstAName: this.form.firstAName,
      lastAName: this.form.lastAName,
      firstEName: this.form.firstEName,
      lastEName: this.form.lastEName,
      addressLine1: this.profile?.addressLine1,
      addressLine2: this.profile?.addressLine2,
      city: this.profile?.city,
      governorate: this.profile?.governorate,
      country: this.profile?.country,
      postalCode: this.profile?.postalCode
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'تم تحديث الاسم بنجاح';
        this.closeModal();
        this.profileUpdated.emit();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Failed to update profile names', err);
        this.errorMessage = 'حدث خطأ أثناء حفظ التغيرات';
      }
    });
  }
}
