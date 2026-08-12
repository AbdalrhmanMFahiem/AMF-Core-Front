import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-footer.component.html',
})
export class AppFooterComponent implements OnInit {
  private authService = inject(AuthService);
  userData: AuthResponse | null = null;
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.userData = this.authService.getAuthResponse();
  }

  get logoUrl(): string | null {
    if (!this.userData?.companyLogoPath) return null;
    const path = this.userData.companyLogoPath;
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const baseUrl = this.userData.backendUrl || '';
    return `${baseUrl}${path}`;
  }
}
