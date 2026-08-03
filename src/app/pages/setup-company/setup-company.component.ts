import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { SetupCompanyAdminRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-setup-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './setup-company.component.html'
})
export class SetupCompanyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form!: FormGroup;
  currentStep = 1;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  adminEmail = '';
  adminPassword = '';

  constructor() {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    if (navState) {
      this.adminEmail = navState['adminEmail'] || '';
      this.adminPassword = navState['adminPassword'] || '';
    } else if (history.state) {
      this.adminEmail = history.state['adminEmail'] || '';
      this.adminPassword = history.state['adminPassword'] || '';
    }
  }

  ngOnInit() {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const defaultExpiry = nextYear.toISOString().split('T')[0];

    this.form = this.fb.group({
      companyCode: ['COMP-001', [Validators.required, Validators.maxLength(50)]],
      companyAName: ['', [Validators.required, Validators.maxLength(250)]],
      companyEName: ['', [Validators.maxLength(250)]],
      supportExpiryDate: [defaultExpiry, [Validators.required]],
      maxUsers: [10, [Validators.required, Validators.min(1), Validators.max(100000)]],
      branches: this.fb.array([])
    });

    // Add initial default branch and warehouse
    this.addBranch('BR-01', 'الفرع الرئيسي - القاهرة', 'Main Branch - Cairo');
  }

  get branches(): FormArray {
    return this.form.get('branches') as FormArray;
  }

  getWarehouses(branchIndex: number): FormArray {
    return this.branches.at(branchIndex).get('warehouses') as FormArray;
  }

  addBranch(code = '', aName = '', eName = '') {
    const branchIndex = this.branches.length + 1;
    const newCode = code || `BR-0${branchIndex}`;
    const branchGroup = this.fb.group({
      code: [newCode, [Validators.required, Validators.maxLength(50)]],
      aName: [aName || `الفرع رقم ${branchIndex}`, [Validators.required, Validators.maxLength(250)]],
      eName: [eName || `Branch ${branchIndex}`, [Validators.maxLength(250)]],
      warehouses: this.fb.array([])
    });
    this.branches.push(branchGroup);
    this.addWarehouse(this.branches.length - 1, `${newCode}-W1`, `المخزن الرئيسي للفرع`, `Main Warehouse`);
  }

  removeBranch(index: number) {
    if (this.branches.length > 1) {
      this.branches.removeAt(index);
    }
  }

  addWarehouse(branchIndex: number, code = '', aName = '', eName = '') {
    const warehouses = this.getWarehouses(branchIndex);
    const wIndex = warehouses.length + 1;
    const branchCode = this.branches.at(branchIndex).get('code')?.value || `BR${branchIndex + 1}`;
    const warehouseGroup = this.fb.group({
      code: [code || `${branchCode}-W${wIndex}`, [Validators.required, Validators.maxLength(50)]],
      aName: [aName || `مخزن رقم ${wIndex}`, [Validators.required, Validators.maxLength(250)]],
      eName: [eName || `Warehouse ${wIndex}`, [Validators.maxLength(250)]]
    });
    warehouses.push(warehouseGroup);
  }

  removeWarehouse(branchIndex: number, warehouseIndex: number) {
    const warehouses = this.getWarehouses(branchIndex);
    if (warehouses.length > 1) {
      warehouses.removeAt(warehouseIndex);
    }
  }

  getTotalWarehouses(): number {
    let total = 0;
    for (let i = 0; i < this.branches.length; i++) {
      total += this.getWarehouses(i).length;
    }
    return total;
  }

  nextStep() {
    this.errorMsg = '';
    if (this.currentStep === 1) {
      const controls = ['companyCode', 'companyAName', 'supportExpiryDate', 'maxUsers'];
      let valid = true;
      controls.forEach(ctrl => {
        if (this.form.get(ctrl)?.invalid) {
          this.form.get(ctrl)?.markAsTouched();
          valid = false;
        }
      });
      if (!valid) return;
    } else if (this.currentStep === 2) {
      if (this.branches.invalid || this.branches.length === 0) {
        this.branches.markAllAsTouched();
        return;
      }
    } else if (this.currentStep === 3) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
    }

    if (this.currentStep < 4) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    this.errorMsg = '';
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSubmit() {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formVal = this.form.value;
    const request: SetupCompanyAdminRequest = {
      adminEmail: this.adminEmail || undefined,
      adminPassword: this.adminPassword || undefined,
      companyCode: formVal.companyCode,
      companyAName: formVal.companyAName,
      companyEName: formVal.companyEName || undefined,
      supportExpiryDate: new Date(formVal.supportExpiryDate).toISOString(),
      maxUsers: Number(formVal.maxUsers),
      branches: formVal.branches.map((b: any) => ({
        code: b.code,
        aName: b.aName,
        eName: b.eName || undefined,
        warehouses: b.warehouses.map((w: any) => ({
          code: w.code,
          aName: w.aName,
          eName: w.eName || undefined
        }))
      }))
    };

    this.authService.setupCompanyAdmin(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'setupWizard.summary.successMessage';
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err.error?.title || err.error?.message || 'An error occurred during setup.';
        console.error('Setup wizard error:', err);
      }
    });
  }

  cancelSetup() {
    this.router.navigate(['/signin']);
  }
}
