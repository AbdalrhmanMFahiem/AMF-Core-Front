import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { UserService } from '../../../../core/services/user.service';
import { UserBasicResponse } from '../../../../core/models/user.model';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent, ErrorBannerComponent],
  templateUrl: './reset-password-modal.component.html'
})
export class ResetPasswordModalComponent {
  @Input() isOpen: boolean = false;
  @Input() user: UserBasicResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private userService = inject(UserService);
  private translate = inject(TranslateService);

  newPassword = '';
  confirmPassword = '';
  mustChangePasswordOnNextLogin = true;
  showNewPassword = false;
  showConfirmPassword = false;
  saving = false;
  validationErrors: string[] = [];

  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let result = '';
    // Ensure at least 1 uppercase, 1 lowercase, 1 number, 1 special
    result += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    result += 'abcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 24)];
    result += '23456789'[Math.floor(Math.random() * 8)];
    result += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle characters
    result = result.split('').sort(() => 0.5 - Math.random()).join('');

    this.newPassword = result;
    this.confirmPassword = result;
    this.showNewPassword = true;
    this.showConfirmPassword = true;
  }

  validate(): boolean {
    this.validationErrors = [];
    if (!this.newPassword) {
      const field = this.translate.instant('users.resetPasswordModal.newPassword') || 'New Password';
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field }) || `${field} is required`);
    } else if (this.newPassword.length < 6) {
      this.validationErrors.push(this.translate.instant('users.errors.passwordMinLength') || 'Password must be at least 6 characters');
    }

    if (!this.confirmPassword) {
      const field = this.translate.instant('users.resetPasswordModal.confirmPassword') || 'Confirm Password';
      this.validationErrors.push(this.translate.instant('common.fieldRequired', { field }) || `${field} is required`);
    } else if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
      this.validationErrors.push(this.translate.instant('users.errors.passwordMismatch') || 'Passwords do not match');
    }

    return this.validationErrors.length === 0;
  }

  private handleError(err: any): void {
    this.saving = false;
    const mapErrorItem = (e: any) => {
      if (typeof e === 'object' && e !== null) {
        const codeStr = e.code ? `[${e.code}] ` : '';
        const msgStr = e.description || e.errorMessage || e.message || JSON.stringify(e);
        return `${codeStr}${msgStr}`;
      }
      return typeof e === 'string' ? e : JSON.stringify(e);
    };

    if (err?.status === 403) {
      this.validationErrors = [
        `[AUTH.403] ${this.translate.instant('errors.forbiddenAction') || 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء (إعادة تعيين كلمة المرور).'}`
      ];
      return;
    }

    if (err?.error?.errors) {
      this.validationErrors = Array.isArray(err.error.errors)
        ? err.error.errors.map(mapErrorItem)
        : Object.values(err.error.errors).flat().map(mapErrorItem);
    } else if (err?.error?.message) {
      const codeStr = err.error.code ? `[${err.error.code}] ` : '';
      this.validationErrors = [`${codeStr}${err.error.message}`];
    } else if (err?.error?.title) {
      const codeStr = err.error.code ? `[${err.error.code}] ` : '';
      this.validationErrors = [`${codeStr}${err.error.title}`];
    } else {
      this.validationErrors = [this.translate.instant('errors.generic') || 'An unexpected error occurred.'];
    }
  }

  onSubmit(): void {
    if (!this.user || !this.validate()) return;

    this.saving = true;
    this.validationErrors = [];

    this.userService.adminResetPassword(this.user.id, {
      newPassword: this.newPassword,
      mustChangePasswordOnNextLogin: this.mustChangePasswordOnNextLogin
    }).subscribe({
      next: () => {
        this.saving = false;
        this.resetState();
        this.success.emit();
        this.close.emit();
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  onClose(): void {
    this.resetState();
    this.close.emit();
  }

  private resetState(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.mustChangePasswordOnNextLogin = true;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.saving = false;
    this.validationErrors = [];
  }
}
