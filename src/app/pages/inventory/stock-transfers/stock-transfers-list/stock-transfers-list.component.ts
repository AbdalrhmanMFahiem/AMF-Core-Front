import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockTransferService } from '../../../../core/services/stock-transfer.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { StockTransferResponse } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-stock-transfers-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule,
    ConfirmationModalComponent
  ],
  templateUrl: './stock-transfers-list.component.html'
})
export class StockTransfersListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockTransferService = inject(StockTransferService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<StockTransferResponse> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  showConfirmationModal = false;
  confirmationActionId: string | null = null;
  itemToConfirm: any = null;
  confirmTitle = 'common.confirm';
  confirmMessage = 'common.confirmTransaction';
  confirmType: 'warning' | 'danger' | 'info' | 'success' = 'warning';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'fromWarehouseName', header: 'stockTransfers.fromWarehouse', type: 'text' },
    { field: 'toWarehouseName', header: 'stockTransfers.toWarehouse', type: 'text' },
    { field: 'transferDate', header: 'common.date', type: 'date' },
    { field: 'status', header: 'common.status', type: 'document-status' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockTransferService.getAll(this.pageNumber, this.pageSize, this.searchValue).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock transfers', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/stock-transfers/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/stock-transfers/view', id]);
  }

  customActions = [
    { 
      id: 'confirm', 
      label: 'stockTransfers.confirm', 
      icon: '<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>', 
      visible: (item: any) => item.status === 0 || item.status === '0' || item.status === 'Draft'
    },
    { 
      id: 'cancel', 
      label: 'stockTransfers.cancelTransfer', 
      icon: '<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>', 
      visible: (item: any) => item.status === 0 || item.status === '0' || item.status === 'Draft'
    }
  ];

  onCustomAction(event: { actionId: string, item: any }): void {
    this.itemToConfirm = event.item;
    this.confirmationActionId = event.actionId;
    if (event.actionId === 'confirm') {
      this.confirmTitle = 'stockTransfers.confirm';
      this.confirmMessage = 'common.confirmTransaction';
      this.confirmType = 'info';
      this.showConfirmationModal = true;
    } else if (event.actionId === 'cancel') {
      this.confirmTitle = this.translate.instant('stockTransfers.cancelWarningTitle') || 'Cancel Warning';
      this.confirmMessage = this.translate.instant('stockTransfers.cancelWarningText') || 'Are you sure you want to cancel?';
      this.confirmType = 'danger';
      this.showConfirmationModal = true;
    }
  }

  onProceedConfirm(): void {
    if (!this.itemToConfirm || !this.confirmationActionId) return;

    if (this.confirmationActionId === 'confirm') {
      this.stockTransferService.confirm(this.itemToConfirm.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('common.updatedSuccessfully') || 'Updated successfully');
          this.loadData();
          this.showConfirmationModal = false;
        },
        error: (err) => {
          this.toastr.error('Error', 'Error');
          console.error(err);
          this.showConfirmationModal = false;
        }
      });
    } else if (this.confirmationActionId === 'cancel') {
      this.stockTransferService.cancel(this.itemToConfirm.id).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('common.updatedSuccessfully') || 'Updated successfully');
          this.loadData();
          this.showConfirmationModal = false;
        },
        error: (err) => {
          this.toastr.error('Error', 'Error');
          console.error(err);
          this.showConfirmationModal = false;
        }
      });
    }
  }

  onCancelConfirm(): void {
    this.showConfirmationModal = false;
    this.itemToConfirm = null;
    this.confirmationActionId = null;
  }

  onPageChange(pageIndex: number): void {
    this.pageNumber = pageIndex;
    this.loadData();
  }
}
