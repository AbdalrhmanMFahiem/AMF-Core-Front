import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-setup-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup-company.component.html'
})
export class SetupCompanyComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  isLoading = false;
  errorMsg = '';

  constructor() {
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      mainBranchName: ['Main Branch', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.setupCompany(this.form.value).subscribe({
      next: (res: AuthResponse) => {
        this.authService.setAuthResponse(res);
        this.router.navigate(['/']); // Redirect to dashboard
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err.error?.title || 'An error occurred during setup.';
        console.error(err);
      }
    });
  }
}
