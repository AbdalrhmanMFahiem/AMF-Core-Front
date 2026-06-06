import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { ItemPropertyService } from '../../../../core/services/item-property.service';
import { PaginatedList, RequestFilters } from '../../../../core/models/pagination.model';
import { ItemPropertyResponse } from '../../../../core/models/item-property.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-properties-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent
  ],
  templateUrl: './item-properties-list.component.html',
  styles: ``
})
export class ItemPropertiesListComponent implements OnInit {
  private readonly itemPropertyService = inject(ItemPropertyService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<ItemPropertyResponse> | null = null;
  includeDisabled: boolean = false;
  
  filters: RequestFilters = {
    pageNumber: 1,
    pageSize: 10,
    searchValue: '',
    sortColumn: 'Id',
    sortDirection: 'DESC'
  };

  columns: CrudColumn[] = [
    { field: 'code', header: 'Common.Code', type: 'code' },
    { field: 'name', header: 'Common.Name', type: 'text' },
    { field: 'isActive', header: 'Common.Status', type: 'badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.itemPropertyService.getAll(this.filters, this.includeDisabled).subscribe({
      next: (res) => {
        this.data = res;
      },
      error: (err) => {
        this.toastr.error('Failed to load properties', 'Error');
        console.error(err);
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/dashboard/inventory/item-properties/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/dashboard/inventory/item-properties/view', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/inventory/item-properties/edit', id]);
  }

  onToggleStatus(id: number): void {
    this.itemPropertyService.toggleStatus(id).subscribe({
      next: () => {
        this.toastr.success('Status updated successfully', 'Success');
        this.loadData();
      },
      error: (err) => {
        this.toastr.error('Failed to update status', 'Error');
        console.error(err);
      }
    });
  }

  onPageChange(pageIndex: number): void {
    this.filters.pageNumber = pageIndex;
    this.loadData();
  }
}
