import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { RoleResponse } from '../../../../core/models/role.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudListComponent,
    PageBreadcrumbComponent,
    ConfirmationModalComponent,
    TranslateModule
  ],
  templateUrl: './roles-list.component.html'
})
export class RolesListComponent implements OnInit {
  private roleService = inject(RoleService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<RoleResponse> | null = null;
  loading = false;
  includeDisabled = false;

  showConfirmationModal = false;
  isConfirming = false;
  itemToConfirm: any = null;

  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'name', header: 'common.name', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  hideEditFn = (item: RoleResponse): boolean => !!item.isAdminRole;
  hideToggleStatusFn = (item: RoleResponse): boolean => !!item.isAdminRole;

  customActions = [
    {
      id: 'reset',
      label: 'roles.resetAdminPermissions',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
      colorClass: 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10',
      visible: (item: RoleResponse) => !!item.isAdminRole
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.roleService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadData();
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }

  onIncludeDisabledChanged(include: boolean): void {
    this.includeDisabled = include;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onAdd(): void {
    this.router.navigate(['/administration/roles/add']);
  }

  onEdit(id: any): void {
    this.router.navigate(['/administration/roles/edit', id]);
  }

  onView(id: any): void {
    this.router.navigate(['/administration/roles/view', id]);
  }

  onToggleStatus(item: any): void {
    this.roleService.toggleStatus(item.id).subscribe(() => {
      if (this.data) {
        const msg = item.isActive ?
          this.translate.instant('common.statusChangedToInactive') :
          this.translate.instant('common.statusChangedToActive');
        this.toastr.success(msg);
        this.loadData();
      }
    });
  }

  onCustomAction(event: { actionId: string, item: any }): void {
    if (event.actionId === 'reset') {
      this.itemToConfirm = event.item;
      this.showConfirmationModal = true;
    }
  }

  onProceedConfirm(): void {
    if (!this.itemToConfirm) return;
    this.isConfirming = true;
    this.roleService.resetAdminPermissions().subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('roles.resetSuccess') || 'Admin permissions reset successfully.');
        this.loadData();
        this.showConfirmationModal = false;
        this.isConfirming = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('common.errorSavingData'));
        this.showConfirmationModal = false;
        this.isConfirming = false;
      }
    });
  }

  onCancelConfirm(): void {
    this.showConfirmationModal = false;
    this.itemToConfirm = null;
  }
}
