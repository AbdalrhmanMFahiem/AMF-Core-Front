import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

import { BranchService } from '../../../../core/services/branch.service';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent } from '../../../../shared/components/form/searchable-select/searchable-select.component';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule, PageBreadcrumbComponent, SearchableSelectComponent],
  templateUrl: './branch-form.component.html'
})
export class BranchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private branchService = inject(BranchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  form: FormGroup;
  id: number | null = null;
  mode: 'add' | 'edit' | 'view' = 'add';
  loading = false;
  saving = false;
  branches: { value: any, label: string }[] = [];

  constructor() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      aName: ['', [Validators.required, Validators.maxLength(100)]],
      eName: ['', [Validators.maxLength(100)]],
      parentBranchId: [null],
      isDefault: [false],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const path = this.route.snapshot.url[0].path;
    this.id = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;

    if (path === 'view') {
      this.mode = 'view';
      this.form.disable();
    } else if (path === 'edit') {
      this.mode = 'edit';
    } else {
      this.mode = 'add';
      this.loadNextCode();
    }

    this.loadDropdowns();

    if (this.id) {
      this.loadData();
    }
  }

  loadDropdowns(): void {
    this.branchService.getDropdown().subscribe({
      next: (res) => {
        this.branches = res
          .filter(x => x.id !== this.id)
          .map(x => ({ value: x.id, label: x.name }));
      }
    });
  }

  get breadcrumbTitle(): string {
    if (this.mode === 'add') return this.translate.instant('common.addBranch');
    if (this.mode === 'edit') return this.translate.instant('common.editBranch');
    return this.translate.instant('common.viewBranch');
  }

  loadNextCode(): void {
    this.branchService.getNextCode().subscribe({
      next: (res) => {
        this.form.patchValue({ code: res.nextCode });
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.branchService.getById(this.id!).subscribe({
      next: (res) => {
        this.form.patchValue({
          code: res.code,
          aName: res.aName,
          eName: res.eName,
          parentBranchId: res.parentBranchId,
          isDefault: res.isDefault,
          notes: res.notes
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.loadDataError'));
        this.router.navigate(['/administration/branches']);
        this.loading = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.isDefault) {
      try {
        const defaultExists = await firstValueFrom(this.branchService.checkDefaultExists(this.id || 0));
        if (defaultExists) {
          const result = await Swal.fire({
            title: this.translate.instant('common.defaultExistsTitle'),
            text: this.translate.instant('common.defaultExistsMessage'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('common.yes'),
            cancelButtonText: this.translate.instant('common.no'),
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
          });

          if (!result.isConfirmed) {
            return;
          }
        }
      } catch (error) {
        this.toastr.error(this.translate.instant('errors.generic'));
        return;
      }
    }

    this.saving = true;
    const request = { ...this.form.value, id: this.id || 0 };

    const observer = {
      next: () => {
        this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        this.router.navigate(['/administration/branches']);
      },
      error: () => {
        this.saving = false;
      }
    };

    if (this.mode === 'add') {
      this.branchService.add(request).subscribe(observer);
    } else {
      this.branchService.update(this.id!, request).subscribe(observer);
    }
  }

  onCancel(): void {
    this.router.navigate(['/administration/branches']);
  }
}
