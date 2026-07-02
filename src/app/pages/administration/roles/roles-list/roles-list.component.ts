import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { RoleResponse } from '../../../../core/models/role.model';
import { RequestFilters, PaginatedList } from '../../../../core/models/pagination.model';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, CrudListComponent, PageBreadcrumbComponent, TranslateModule],
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

  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'name', header: 'roles.fields.name', type: 'text' },
    { field: 'aName', header: 'roles.fields.aName', type: 'text' },
    { field: 'eName', header: 'roles.fields.eName', type: 'text' },
    { field: 'notes', header: 'roles.fields.notes', type: 'text' },
    { field: 'isActive', header: 'Common.Status', type: 'badge' }
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
}
