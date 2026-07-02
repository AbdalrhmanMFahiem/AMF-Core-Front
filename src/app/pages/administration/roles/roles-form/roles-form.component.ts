import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { RoleWithPermissionsResponse, RoleRequest, PermissionNodeResponse, PermissionActionResponse } from '../../../../core/models/role.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageBreadcrumbComponent, TranslateModule, SuccessRedirectBannerComponent],
  templateUrl: './roles-form.component.html'
})
export class RolesFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  public translate = inject(TranslateService);

  form!: FormGroup;
  id: string | null = null;
  isViewMode = false;
  loading = false;
  saving = false;
  successMode = false;
  
  permissionsTree: PermissionNodeResponse[] = [];
  selectedPermissions: Set<string> = new Set<string>();

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isViewMode = this.route.snapshot.url[0].path === 'view';

    this.initForm();

    if (this.id) {
      this.loadRole();
    } else {
      this.loadAvailablePermissions();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      aName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
      eName: [{ value: '', disabled: this.isViewMode }],
      notes: [{ value: '', disabled: this.isViewMode }]
    });
  }

  loadRole(): void {
    this.loading = true;
    this.roleService.get(this.id!).subscribe({
      next: (role) => {
        this.form.patchValue({
          aName: role.aName,
          eName: role.eName,
          notes: role.notes
        });
        this.permissionsTree = role.tree || [];
        this.extractSelectedPermissions(this.permissionsTree);
        
        // Reset pristine state after loading data so the guard doesn't trigger unnecessarily
        setTimeout(() => this.form.markAsPristine(), 0);
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
        this.loading = false;
      }
    });
  }

  loadAvailablePermissions(): void {
    this.loading = true;
    this.roleService.getAllPermissions().subscribe({
      next: (res) => {
        this.permissionsTree = res.tree || [];
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
        this.loading = false;
      }
    });
  }

  extractSelectedPermissions(nodes: PermissionNodeResponse[]): void {
    nodes.forEach(node => {
      if (node.permissions) {
        node.permissions.forEach(p => {
          if (p.isAssigned) {
            this.selectedPermissions.add(p.key);
          }
        });
      }
      if (node.children && node.children.length > 0) {
        this.extractSelectedPermissions(node.children);
      }
    });
  }

  toggleNodeCollapse(node: PermissionNodeResponse): void {
    node.collapsed = !node.collapsed;
  }

  isPermissionSelected(key: string): boolean {
    return this.selectedPermissions.has(key);
  }

  onPermissionToggle(key: string, event: Event): void {
    if (this.isViewMode) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedPermissions.add(key);
    } else {
      this.selectedPermissions.delete(key);
    }
    this.form.markAsDirty();
  }

  isNodeFullySelected(node: PermissionNodeResponse): boolean {
    const allKeys = this.getAllPermissionKeys(node);
    if (allKeys.length === 0) return false;
    return allKeys.every(k => this.selectedPermissions.has(k));
  }

  isNodePartiallySelected(node: PermissionNodeResponse): boolean {
    const allKeys = this.getAllPermissionKeys(node);
    if (allKeys.length === 0) return false;
    const selectedCount = allKeys.filter(k => this.selectedPermissions.has(k)).length;
    return selectedCount > 0 && selectedCount < allKeys.length;
  }

  onNodeToggle(node: PermissionNodeResponse, event: Event): void {
    if (this.isViewMode) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    const allKeys = this.getAllPermissionKeys(node);
    
    if (isChecked) {
      allKeys.forEach(k => this.selectedPermissions.add(k));
    } else {
      allKeys.forEach(k => this.selectedPermissions.delete(k));
    }
    this.form.markAsDirty();
  }

  getAllPermissionKeys(node: PermissionNodeResponse): string[] {
    let keys: string[] = [];
    if (node.permissions) {
      keys = keys.concat(node.permissions.map(p => p.key));
    }
    if (node.children) {
      node.children.forEach(child => {
        keys = keys.concat(this.getAllPermissionKeys(child));
      });
    }
    return keys;
  }

  expandAll(): void {
    this.setAllNodesCollapsed(this.permissionsTree, false);
  }

  collapseAll(): void {
    this.setAllNodesCollapsed(this.permissionsTree, true);
  }

  private setAllNodesCollapsed(nodes: PermissionNodeResponse[], collapsed: boolean): void {
    nodes.forEach(node => {
      node.collapsed = collapsed;
      if (node.children) {
        this.setAllNodesCollapsed(node.children, collapsed);
      }
    });
  }

  hasUnsavedChanges(): Observable<boolean> | boolean {
    if (this.successMode || this.isViewMode) return false;
    return this.form.dirty;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const request: RoleRequest = {
      aName: this.form.value.aName,
      eName: this.form.value.eName,
      notes: this.form.value.notes,
      permissions: Array.from(this.selectedPermissions)
    };

    if (this.id) {
      this.roleService.update(this.id, request).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: () => {
          this.saving = false;
          this.toastr.error(this.translate.instant('common.errorSavingData'));
        }
      });
    } else {
      this.roleService.create(request).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: () => {
          this.saving = false;
          this.toastr.error(this.translate.instant('common.errorSavingData'));
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/administration/roles']);
  }
}
