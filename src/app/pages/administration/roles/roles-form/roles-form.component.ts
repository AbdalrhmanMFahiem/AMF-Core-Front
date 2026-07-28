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
import { Observable } from 'rxjs';
import { SuccessRedirectBannerComponent } from '../../../../shared/components/common/success-redirect-banner/success-redirect-banner.component';
import { ErrorBannerComponent } from '../../../../shared/components/common/error-banner/error-banner.component';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageBreadcrumbComponent,
    TranslateModule,
    SuccessRedirectBannerComponent,
    ErrorBannerComponent,
    ComponentCardComponent
  ],
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
  validationErrors: string[] = [];

  permissionsTree: PermissionNodeResponse[] = [];
  filteredTree: PermissionNodeResponse[] = [];
  selectedPermissions: Set<string> = new Set<string>();
  searchTerm = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isViewMode = this.route.snapshot.url.some(segment => segment.path === 'view') || this.router.url.includes('/view/');

    this.initForm();

    if (this.id) {
      this.loadRole();
    } else {
      this.roleService.getNextCode().subscribe(res => {
        this.form.patchValue({ code: res.nextCode });
      });
      this.loadAvailablePermissions();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }], // Auto-generated & non-editable
      aName: [{ value: '', disabled: this.isViewMode }, [Validators.required]],
      eName: [{ value: '', disabled: this.isViewMode }],
      notes: [{ value: '', disabled: this.isViewMode }]
    });

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  loadRole(): void {
    this.loading = true;
    this.roleService.get(this.id!).subscribe({
      next: (role: RoleWithPermissionsResponse) => {
        this.form.patchValue({
          code: role.code || '',
          aName: role.aName,
          eName: role.eName,
          notes: role.notes
        });
        this.permissionsTree = role.tree || [];
        this.filteredTree = [...this.permissionsTree];
        this.selectedPermissions.clear();
        this.extractSelectedPermissions(this.permissionsTree);

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
        this.filteredTree = [...this.permissionsTree];
        this.selectedPermissions.clear();
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

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value ? target.value.trim().toLowerCase() : '';
    this.filterTree();
  }

  filterTree(): void {
    if (!this.searchTerm) {
      this.filteredTree = [...this.permissionsTree];
      return;
    }
    this.filteredTree = this.filterNodes(this.permissionsTree, this.searchTerm);
  }

  private filterNodes(nodes: PermissionNodeResponse[], term: string): PermissionNodeResponse[] {
    const result: PermissionNodeResponse[] = [];
    for (const node of nodes) {
      const nodeTitleMatches = node.displayName?.toLowerCase().includes(term) ||
                               node.key?.toLowerCase().includes(term) ||
                               node.module?.toLowerCase().includes(term);

      const matchingPermissions = (node.permissions || []).filter(p =>
        p.displayName?.toLowerCase().includes(term) || p.key?.toLowerCase().includes(term)
      );

      const matchingChildren = node.children ? this.filterNodes(node.children, term) : [];

      if (nodeTitleMatches || matchingPermissions.length > 0 || matchingChildren.length > 0) {
        const clonedNode: PermissionNodeResponse = {
          ...node,
          collapsed: false,
          permissions: nodeTitleMatches ? node.permissions : matchingPermissions,
          children: nodeTitleMatches ? node.children : matchingChildren
        };
        result.push(clonedNode);
      }
    }
    return result;
  }

  get totalPermissionsCount(): number {
    return this.countPermissionsInNodes(this.permissionsTree);
  }

  get totalSelectedCount(): number {
    const allKeys = this.getAllPermissionKeysFromNodes(this.permissionsTree);
    return allKeys.filter(key => this.selectedPermissions.has(key)).length;
  }

  private countPermissionsInNodes(nodes: PermissionNodeResponse[]): number {
    let count = 0;
    for (const n of nodes) {
      if (n.permissions) {
        count += n.permissions.length;
      }
      if (n.children) {
        count += this.countPermissionsInNodes(n.children);
      }
    }
    return count;
  }

  getNodeStats(node: PermissionNodeResponse): { selected: number; total: number } {
    const keys = this.getAllPermissionKeys(node);
    const selected = keys.filter(k => this.selectedPermissions.has(k)).length;
    return { selected, total: keys.length };
  }

  getModuleBadgeClass(module?: string | null): string {
    if (!module) {
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
    const mod = module.toLowerCase();
    if (mod.includes('core') || mod.includes('admin')) {
      return 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20';
    }
    if (mod.includes('inv') || mod.includes('stock') || mod.includes('ware') || mod.includes('item')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    }
    if (mod.includes('sale') || mod.includes('cust') || mod.includes('pos')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    }
    if (mod.includes('purch') || mod.includes('vend') || mod.includes('supp')) {
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
    }
    if (mod.includes('prod') || mod.includes('mfg') || mod.includes('plan')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
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

  selectAllPermissions(): void {
    if (this.isViewMode) return;
    const allKeys = this.getAllPermissionKeysFromNodes(this.permissionsTree);
    allKeys.forEach(key => this.selectedPermissions.add(key));
    this.form.markAsDirty();
  }

  deselectAllPermissions(): void {
    if (this.isViewMode) return;
    this.selectedPermissions.clear();
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

  private getAllPermissionKeysFromNodes(nodes: PermissionNodeResponse[]): string[] {
    let keys: string[] = [];
    nodes.forEach(node => {
      keys = keys.concat(this.getAllPermissionKeys(node));
    });
    return keys;
  }

  expandAll(): void {
    this.setAllNodesCollapsed(this.permissionsTree, false);
    if (this.searchTerm) {
      this.setAllNodesCollapsed(this.filteredTree, false);
    }
  }

  collapseAll(): void {
    this.setAllNodesCollapsed(this.permissionsTree, true);
    if (this.searchTerm) {
      this.setAllNodesCollapsed(this.filteredTree, true);
    }
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
      this.validationErrors = this.getFormValidationErrors();
      return;
    }

    if (this.selectedPermissions.size === 0) {
      this.validationErrors = [this.translate.instant('roles.errors.permissionsRequired') || 'At least one permission must be selected.'];
      this.toastr.warning(this.translate.instant('roles.errors.permissionsRequired') || 'At least one permission must be selected.');
      return;
    }

    this.saving = true;
    this.validationErrors = [];
    const request: RoleRequest = {
      code: this.form.get('code')?.value || '',
      aName: this.form.value.aName,
      eName: this.form.value.eName || '',
      notes: this.form.value.notes || '',
      permissions: Array.from(this.selectedPermissions)
    };

    if (this.id) {
      this.roleService.update(this.id, request).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: (err: any) => {
          this.saving = false;
          this.handleSaveError(err);
        }
      });
    } else {
      this.roleService.create(request).subscribe({
        next: () => {
          this.successMode = true;
          this.saving = false;
          this.toastr.success(this.translate.instant('common.savedSuccessfully'));
        },
        error: (err: any) => {
          this.saving = false;
          this.handleSaveError(err);
        }
      });
    }
  }

  private handleSaveError(err: any): void {
    if (err?.error?.errors) {
      this.validationErrors = Array.isArray(err.error.errors)
        ? err.error.errors.map((e: any) => e.errorMessage || e.description || JSON.stringify(e))
        : Object.values(err.error.errors).flat() as string[];
    } else if (err?.error?.message) {
      this.validationErrors = [err.error.message];
    } else {
      this.validationErrors = [this.translate.instant('common.errorSavingData') || 'An error occurred while saving data.'];
    }
    this.toastr.error(this.translate.instant('common.errorSavingData'));
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const controls = this.form.controls as any;

    Object.keys(controls).forEach(key => {
      const controlErrors = controls[key].errors;
      if (controlErrors != null && key !== 'code') {
        let fieldName = '';
        fieldName = this.translate.instant(`roles.fields.${key}`) || key;

        if (controlErrors['required']) {
          if (key === 'aName') {
            errors.push(this.translate.instant('roles.errors.aNameRequired') || 'Arabic Name is required.');
          } else {
            errors.push(this.translate.instant('common.fieldRequired', { field: fieldName }) || `The ${fieldName} field is required`);
          }
        } else {
          errors.push(this.translate.instant('common.invalidField', { field: fieldName }) || `The ${fieldName} field is invalid`);
        }
      }
    });

    if (this.selectedPermissions.size === 0) {
      errors.push(this.translate.instant('roles.errors.permissionsRequired') || 'At least one permission must be selected.');
    }

    return errors;
  }

  onCancel(): void {
    this.router.navigate(['/administration/roles']);
  }
}
