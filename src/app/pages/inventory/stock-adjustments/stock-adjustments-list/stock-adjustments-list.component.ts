import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CrudListComponent, CrudColumn } from '../../../../shared/components/common/crud-list/crud-list.component';
import { StockAdjustmentService } from '../../../../core/services/stock-adjustment.service';
import { PaginatedList } from '../../../../core/models/pagination.model';
import { StockAdjustmentResponse } from '../../../../core/models/inventory.model';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../../shared/components/common/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-stock-adjustments-list',
  standalone: true,
  imports: [
    CommonModule, 
    PageBreadcrumbComponent, 
    CrudListComponent,
    TranslateModule,
    ConfirmationModalComponent
  ],
  templateUrl: './stock-adjustments-list.component.html'
})
export class StockAdjustmentsListComponent implements OnInit {
  public translate = inject(TranslateService);
  private readonly stockAdjustmentService = inject(StockAdjustmentService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  data: PaginatedList<StockAdjustmentResponse> | null = null;
  loading: boolean = false;
  
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  showConfirmationModal = false;
  confirmationActionId: string | null = null;
  itemToConfirm: any = null;
  confirmTitle = 'common.confirm';
  confirmMessage = 'common.confirmStatusChange';
  confirmType: 'warning' | 'danger' | 'info' | 'success' = 'warning';

  columns: CrudColumn[] = [
    { field: 'code', header: 'common.code', type: 'code' },
    { field: 'warehouseName', header: 'stockAdjustments.warehouse', type: 'text' },
    { field: 'adjustmentType', header: 'stockAdjustments.type', type: 'adjustment-type' },
    { field: 'adjustmentDate', header: 'common.date', type: 'date' },
    { field: 'status', header: 'common.status', type: 'document-status' },
    { field: 'approvalStatusDisplay', header: 'common.approvalStatus', type: 'dynamic-badge' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.stockAdjustmentService.getAll(this.pageNumber, this.pageSize, this.searchValue).subscribe({
      next: (res) => {
        const getApprovalStatusColor = (status?: string) => {
          switch (status) {
            case 'Pending': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            default: return 'light';
          }
        };

        const mappedItems = (res.items || []).map((item: StockAdjustmentResponse) => ({
          ...item,
          approvalStatusDisplay: item.approvalStatus ? this.translate.instant('common.approvalStatusEnum.' + item.approvalStatus) : '-',
          approvalStatusDisplayColor: getApprovalStatusColor(item.approvalStatus)
        }));

        this.data = { ...res, items: mappedItems };
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load stock adjustments', 'Error');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/inventory/stock-adjustments/add']);
  }

  onView(id: number): void {
    this.router.navigate(['/inventory/stock-adjustments/view', id]);
  }

  hideEditFn = (item: any): boolean => {
    return item.status !== 0 && item.status !== '0' && item.status !== 'Draft'; // Hide edit if not draft
  };

  customActions = [
    { 
      id: 'confirm', 
      label: 'stockAdjustments.confirm', 
      icon: '<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>', 
      visible: (item: any) => item.status === 0 || item.status === '0' || item.status === 'Draft'
    },
    { 
      id: 'cancel', 
      label: 'stockAdjustments.cancelDocument', 
      icon: '<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>', 
      visible: (item: any) => item.status !== 2 && item.status !== '2' && item.status !== 'Cancelled'
    }
  ];

  onCustomAction(event: { actionId: string, item: any }): void {
    this.itemToConfirm = event.item;
    this.confirmationActionId = event.actionId;
    
    if (event.actionId === 'confirm') {
      this.confirmTitle = 'stockAdjustments.confirm';
      this.confirmMessage = 'common.confirmStatusChange';
      this.confirmType = 'info';
      this.showConfirmationModal = true;
    } else if (event.actionId === 'cancel') {
      this.confirmTitle = this.translate.instant('stockAdjustments.cancelWarningTitle') || 'Cancel Warning';
      this.confirmMessage = this.translate.instant('stockAdjustments.cancelWarningText') || 'Are you sure you want to cancel?';
      this.confirmType = 'danger';
      this.showConfirmationModal = true;
    }
  }

  onProceedConfirm(): void {
    if (!this.itemToConfirm || !this.confirmationActionId) return;

    if (this.confirmationActionId === 'confirm') {
      this.stockAdjustmentService.confirm(this.itemToConfirm.id).subscribe({
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
      this.stockAdjustmentService.cancel(this.itemToConfirm.id).subscribe({
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
