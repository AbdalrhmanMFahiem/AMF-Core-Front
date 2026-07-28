import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService, UserProfileData } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-user-preferences-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './user-preferences-card.component.html'
})
export class UserPreferencesCardComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private translate = inject(TranslateService);

  @Input() profile: UserProfileData | null = null;
  @Output() profileUpdated = new EventEmitter<void>();

  selectedPage: 'dashboard' | 'home' = 'dashboard';
  savedMessage: string | null = null;
  landingErrorMessage: string | null = null;

  // Change Password Form State
  showPasswordForm = false;
  isChangingPassword = false;
  passwordError: string | null = null;
  passwordSuccess: string | null = null;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.selectedPage = this.authService.getLandingPagePreference();
  }

  selectPage(page: 'dashboard' | 'home') {
    this.selectedPage = page;
    this.saveLandingPreference();
  }

  saveLandingPreference() {
    this.authService.updateLandingPageOnServer(this.selectedPage).subscribe({
      next: () => {
        this.savedMessage = this.translate.instant('profile.preferenceSaved') || 'تم حفظ تفضيلات صفحة البداية في قاعدة البيانات بنجاح';
        setTimeout(() => this.savedMessage = null, 3000);
      },
      error: (err) => {
        console.error('Failed to persist landing page in database', err);
        this.authService.setLandingPagePreference(this.selectedPage);
      }
    });
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordError = null;
    this.passwordSuccess = null;
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  handleChangePassword() {
    if (!this.passwordForm.currentPassword) {
      this.passwordError = 'يرجى إدخال كلمة المرور الحالية';
      return;
    }
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أكثر';
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'كلمة المرور الجديدة وتأكيدها غير متطابقين';
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = null;
    this.passwordSuccess = null;

    this.profileService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'تم تغيير كلمة المرور بنجاح';
        this.showPasswordForm = false;
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.profileUpdated.emit();
        setTimeout(() => this.passwordSuccess = null, 4000);
      },
      error: (err) => {
        this.isChangingPassword = false;
        console.error('Failed to change password', err);
        this.passwordError = err.error?.detail || err.error?.message || 'فشل تغيير كلمة المرور. تأكد من كلمة المرور الحالية.';
      }
    });
  }
}
