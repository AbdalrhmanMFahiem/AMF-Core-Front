import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { InventoryCountService } from '../../../../core/services/inventory-count.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inventory-counts-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule
  ],
  templateUrl: './inventory-counts-list.component.html'
})
export class InventoryCountsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly inventoryCountService = inject(InventoryCountService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<any> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'warehouseName', header: 'stockVouchers.fields.warehouse', type: 'text' },
    { field: 'countDate', header: 'inventoryCounts.fields.countDate', type: 'date' },
    { field: 'description', header: 'inventoryCounts.fields.description', type: 'text' },
    { field: 'status', header: 'common.status', type: 'document-status' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.inventoryCountService.getAll(this.pageNumber, this.pageSize, this.searchValue).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load inventory counts', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/inventory-counts/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/inventory-counts/view', id]);
  }

  onPageChange(pageIndex: number): void {
    this.pageNumber = pageIndex;
    this.loadData();
  }
}
