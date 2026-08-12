import { Component, inject, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthResponse } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, TranslateModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  isOpen = false;
  userData: AuthResponse | null = null;
  imageError = false;
  userImageUrl = '';

  ngOnInit() {
    this.userData = this.authService.getAuthResponse();
    if (this.userData) {
      if (this.userData.photoPath) {
        const baseUrl = this.userData.backendUrl || '';
        this.userImageUrl = `${baseUrl}${this.userData.photoPath}`;
      } else {
        import('../../../../../environments/environment').then(m => {
          this.userImageUrl = `${m.environment.apiUrl}/uploads/users/${this.userData?.id}.png`;
        });
      }
    }
  }

  onImageError() {
    this.imageError = true;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout(event: Event) {
    event.preventDefault();
    this.closeDropdown();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/signin']);
    });
  }
}