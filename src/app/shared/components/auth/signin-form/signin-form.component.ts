import { Component, inject } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { AdminTenantResponse, TenantBranchResponse } from '../../../../core/models/auth.models';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
    TranslateModule,
    ModalComponent
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

  isSetupModalOpen = false;
  isSettingUpCompany = false;
  setupError = '';
  setupCompanyData = {
    companyName: '',
    mainBranchName: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onVerifyCredentials() {
    if (!this.email || !this.password) {
      alert('Please enter email and password');
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
        } else {
          // If there's only one branch, auto-select it
          if (this.branches.length === 1) {
             this.selectedBranchId = this.branches[0].id;
             this.selectedTenantId = this.branches[0].tenantId;
          }
        }
        
        this.step = 'branch_selection';
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Verify error', err);
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
    this.authService.getTenantBranches({ email: this.email, password: this.password, tenantId }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.branches = res || [];
        if (this.branches.length === 1) {
           this.selectedBranchId = this.branches[0].id;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load branches', err);
      }
    });
  }

  onSignIn() {
    if (this.step === 'credentials') {
      this.onVerifyCredentials();
      return;
    }

    if (!this.selectedBranchId) {
      alert('Please select a branch before signing in');
      return;
    }
    
    if (this.isAdmin && !this.selectedTenantId) {
      alert('Please select a company before signing in');
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
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error', err);
      }
    });
  }
  
  goBack() {
    this.step = 'credentials';
    this.selectedTenantId = null;
    this.selectedBranchId = null;
  }

  openSetupModal() {
    this.isSetupModalOpen = true;
    this.setupError = '';
    this.setupCompanyData = { companyName: '', mainBranchName: '' };
  }

  closeSetupModal() {
    this.isSetupModalOpen = false;
  }

  onSetupCompany() {
    if (!this.setupCompanyData.companyName || !this.setupCompanyData.mainBranchName) {
      this.setupError = 'Please fill all required fields';
      return;
    }

    this.isSettingUpCompany = true;
    this.setupError = '';

    const adminRequest = {
      ...this.setupCompanyData,
      adminEmail: this.email,
      adminPassword: this.password
    };

    this.authService.setupCompanyAdmin(adminRequest).subscribe({
      next: () => {
        this.isSettingUpCompany = false;
        this.closeSetupModal();
        // Since setupCompanyAdmin doesn't return a token, re-verify to refresh the tenants list
        this.onVerifyCredentials();
      },
      error: (err) => {
        this.isSettingUpCompany = false;
        this.setupError = err.error?.title || err.error?.message || 'An error occurred during setup.';
        console.error('Setup error', err);
      }
    });
  }
}
