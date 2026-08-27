import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { Permissions } from '../../../../core/constants/permissions';
import { UserBasicResponse } from '../../../../core/models/user.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn, CustomAction } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, ResetPasswordModalComponent, TranslateModule],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private permissionsService = inject(PermissionsService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<UserBasicResponse> | null = null;
  loading = false;
  includeDisabled = false;

  isResetPasswordModalOpen = false;
  selectedUserForReset: UserBasicResponse | null = null;

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
    { field: 'email', header: 'users.fields.email', type: 'text' },
    { field: 'isActive', header: 'common.status', type: 'badge' }
  ];

  customActions: CustomAction[] = [
    {
      id: 'resetPassword',
      label: 'users.actions.resetPassword',
      icon: `<svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`,
      visible: () => this.permissionsService.hasPermission(Permissions.ResetPasswordUsers)
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.getAll(this.filters, this.includeDisabled).subscribe({
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
    this.router.navigate(['/administration/users/add']);
  }

  onEdit(id: any): void {
    this.router.navigate(['/administration/users/edit', id]);
  }

  onView(id: any): void {
    this.router.navigate(['/administration/users/view', id]);
  }

  onToggleStatus(item: any): void {
    this.userService.toggleStatus(item.id).subscribe(() => {
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
    if (event.actionId === 'resetPassword') {
      this.selectedUserForReset = event.item;
      this.isResetPasswordModalOpen = true;
    }
  }

  onResetPasswordSuccess(): void {
    this.toastr.success(
      this.translate.instant('users.resetPasswordSuccess') || 'User password reset successfully.'
    );
    this.loadData();
  }
}
