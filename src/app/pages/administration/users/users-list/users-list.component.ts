import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserBasicResponse } from '../../../../core/models/user.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  data: PaginatedList<UserBasicResponse> | null = null;
  loading = false;
  includeDisabled = false;

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
}
