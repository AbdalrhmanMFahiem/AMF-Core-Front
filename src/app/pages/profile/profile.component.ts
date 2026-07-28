import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UserPreferencesCardComponent } from '../../shared/components/user-profile/user-preferences-card/user-preferences-card.component';
import { ProfileService, UserProfileData } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
    UserPreferencesCardComponent,
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);

  profileData: UserProfileData | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profileData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load user profile data', err);
        this.error = 'فشل تحميل بيانات الملف الشخصي من السيرفر';
      }
    });
  }
}
