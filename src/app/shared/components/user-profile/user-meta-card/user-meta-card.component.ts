import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileService, UserProfileData } from '../../../../core/services/profile.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-meta-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './user-meta-card.component.html'
})
export class UserMetaCardComponent {
  private profileService = inject(ProfileService);

  @Input() profile: UserProfileData | null = null;
  @Output() profileUpdated = new EventEmitter<void>();

  isUploading = false;
  uploadError: string | null = null;

  get photoUrl(): string {
    if (this.profile?.photoPath) {
      if (this.profile.photoPath.startsWith('http')) {
        return this.profile.photoPath;
      }
      return `${environment.apiUrl.replace('/api/v1', '')}/${this.profile.photoPath}`;
    }
    return '/images/user/owner.jpg';
  }

  get fullName(): string {
    if (!this.profile) return '';
    const arName = `${this.profile.firstAName || ''} ${this.profile.lastAName || ''}`.trim();
    if (arName) return arName;
    return `${this.profile.firstEName || ''} ${this.profile.lastEName || ''}`.trim();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    this.isUploading = true;
    this.uploadError = null;

    this.profileService.uploadPhoto(file).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (this.profile) {
          this.profile.photoPath = res.photoPath;
        }
        this.profileUpdated.emit();
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Failed to upload photo', err);
        this.uploadError = 'فشل رفع الصورة الشخصية';
      }
    });
  }
}
