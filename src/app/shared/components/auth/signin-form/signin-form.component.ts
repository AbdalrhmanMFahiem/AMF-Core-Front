import { Component, inject } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ErrorBannerComponent } from '../../common/error-banner/error-banner.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminTenantResponse, TenantBranchResponse } from '../../../../core/models/auth.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    ErrorBannerComponent,
    RouterModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;
  isLoading = false;

  email = '';
  password = '';
  
  step: 'credentials' | 'branch_selection' = 'credentials';
  isAdmin = false;
  
  tenants: AdminTenantResponse[] = [];
  branches: TenantBranchResponse[] = [];
  
  selectedTenantId: string | null = null;
  selectedBranchId: number | null = null;

  validationErrors: string[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private permissionsService = inject(PermissionsService);
  private translate = inject(TranslateService);

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private handleError(err: any): void {
    this.isLoading = false;
    const mapErrorItem = (e: any) => {
      if (typeof e === 'object' && e !== null) {
        const codeStr = e.code ? `[${e.code}] ` : '';
        const msgStr = e.description || e.errorMessage || e.message || JSON.stringify(e);
        return `${codeStr}${msgStr}`;
      }
      return typeof e === 'string' ? e : JSON.stringify(e);
    };

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

  onVerifyCredentials() {
    this.validationErrors = [];
    if (!this.email || !this.password) {
      if (!this.email) {
        const emailLabel = this.translate.instant('login.emailLabel') || 'Email';
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: emailLabel }) || `${emailLabel} is required`);
      }
      if (!this.password) {
        const passwordLabel = this.translate.instant('login.passwordLabel') || 'Password';
        this.validationErrors.push(this.translate.instant('common.fieldRequired', { field: passwordLabel }) || `${passwordLabel} is required`);
      }
      return;
    }

    this.isLoading = true;
    this.authService.verifyCredentials({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isAdmin = res.isAdmin;
        this.tenants = res.tenants || [];
        this.branches = res.branches || [];
        
        if (this.isAdmin) {
          this.selectedTenantId = null;
          this.branches = []; // Reset branches until tenant is selected
          this.step = 'branch_selection';
        } else {
          // If there's only one branch, auto-select it
          if (this.branches.length === 1) {
             this.selectedBranchId = this.branches[0].id;
             this.selectedTenantId = this.branches[0].tenantId;
             this.step = 'branch_selection';
             this.onSignIn();
          } else {
             this.step = 'branch_selection';
          }
        }
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  onTenantChange(event: any) {
    const tenantId = event.target.value;
    this.selectedTenantId = tenantId;
    this.selectedBranchId = null;
    this.branches = [];
    
    if (!tenantId) return;

    this.isLoading = true;
    this.validationErrors = [];
    this.authService.getTenantBranches({ email: this.email, password: this.password, tenantId }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.branches = res || [];
        if (this.branches.length === 1) {
           this.selectedBranchId = this.branches[0].id;
           this.onSignIn();
        }
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  onSignIn() {
    if (this.step === 'credentials') {
      this.onVerifyCredentials();
      return;
    }

    this.validationErrors = [];
    if (!this.selectedBranchId) {
      this.validationErrors = [this.translate.instant('login.chooseBranch') || 'Please select a branch before signing in'];
      return;
    }
    
    if (this.isAdmin && !this.selectedTenantId) {
      this.validationErrors = [this.translate.instant('login.chooseCompany') || 'Please select a company before signing in'];
      return;
    }

    this.isLoading = true;
    this.authService.login({ 
      email: this.email, 
      password: this.password,
      tenantId: this.selectedTenantId || undefined,
      branchId: this.selectedBranchId
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.token) {
          this.authService.setAuthResponse(res);
          this.permissionsService.loadPermissions().subscribe(() => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'];
            if (returnUrl && returnUrl !== '/') {
              this.router.navigateByUrl(returnUrl);
            } else {
              const landingPref = this.authService.getLandingPagePreference();
              const hasDashboardPermission = this.authService.hasDashboardPermission();

              if (landingPref === 'dashboard' && hasDashboardPermission) {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/']);
              }
            }
          });
        }

      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }
  
  goBack() {
    this.validationErrors = [];
    this.step = 'credentials';
    this.selectedTenantId = null;
    this.selectedBranchId = null;
  }

  navigateToSetupWizard() {
    this.router.navigate(['/setup-company'], {
      state: {
        adminEmail: this.email,
        adminPassword: this.password
      }
    });
  }
}
