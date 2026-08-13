import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ReportService } from '../../../core/services/report.service';
import { LookupService } from '../../../core/services/lookup.service';
import { PaginatedList } from '../../../core/models/pagination.model';
import { IdNameResponse } from '../../../core/models/lookup.model';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { SearchableSelectComponent, SearchableOption } from '../../../shared/components/form/searchable-select/searchable-select.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

import { ExportLoadingService } from '../../../core/services/export-loading.service';
import { ItemDetailsModalService } from '../../../core/services/item-details-modal.service';

import { ToastrService } from 'ngx-toastr';

export interface UnpricedItem {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemGroupName: string | null;
  isPurchased: boolean;
  isManufactured: boolean;
  initialPrice: number;
  lastPurchasePrice: number;
  warehouseAvgCost: number;
  hasBom: boolean;
  latestBomCost: number | null;
  onHandQuantity: number;
  baseUomType?: string;
  baseUomName?: string | null;
  purchaseUomName?: string | null;
  unpricedReasonKey: string;
  unpricedReasonText: string;
}

@Component({
  selector: 'app-unpriced-items-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageBreadcrumbComponent,
    SearchableSelectComponent,
    ModalComponent
  ],
  templateUrl: './unpriced-items-report.component.html'
})
export class UnpricedItemsReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private lookupService = inject(LookupService);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);
  private exportLoadingService = inject(ExportLoadingService);
  public itemDetailsModalService = inject(ItemDetailsModalService);

  openItemDetails(item: UnpricedItem): void {
    if (item?.itemId) {
      this.itemDetailsModalService.open(item.itemId);
    }
  }

  data: PaginatedList<UnpricedItem> | null = null;
  loading = false;

  filters = {
    pageNumber: 1,
    pageSize: 10,
    search: '',
    itemGroupId: undefined as number | undefined,
    reasonFilter: 'All'
  };

  // Stats
  totalUnpricedCount = 0;
  missingPurchaseCount = 0;
  missingBomCount = 0;
  zeroWarehouseCostCount = 0;

  itemGroupOptions: SearchableOption[] = [];
  reasonOptions: SearchableOption[] = [];

  // Update Initial Cost Modal
  isModalOpen = false;
  selectedItem: UnpricedItem | null = null;
  newInitialPrice: number = 0;
  savingPrice = false;

  ngOnInit(): void {
    this.initOptions();
    this.loadLookups();
    this.loadData();
  }

  private initOptions(): void {
    this.reasonOptions = [
      { value: 'All', label: this.translate.instant('reports.unpricedItems.reasons.All') },
      { value: 'MissingPurchaseAndInitialPrice', label: this.translate.instant('reports.unpricedItems.reasons.MissingPurchaseAndInitialPrice') },
      { value: 'MissingBomCost', label: this.translate.instant('reports.unpricedItems.reasons.MissingBomCost') },
      { value: 'ZeroWarehouseAvgCost', label: this.translate.instant('reports.unpricedItems.reasons.ZeroWarehouseAvgCost') }
    ];
  }

  private loadLookups(): void {
    this.lookupService.getItemGroups().subscribe({
      next: (res: IdNameResponse[]) => {
        this.itemGroupOptions = (res || []).map((x) => ({
          value: x.id,
          label: x.name
        }));
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.reportService.getUnpricedItemsReport(this.filters).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.calculateStats();
      },
      error: () => {
        this.loading = false;
        this.toastr.error(this.translate.instant('common.errorLoadingData'));
      }
    });
  }

  private calculateStats(): void {
    if (!this.data) return;
    this.totalUnpricedCount = this.data.totalRecords || 0;

    const items = this.data.items || [];
    this.missingPurchaseCount = items.filter(x => x.unpricedReasonKey === 'MissingPurchaseAndInitialPrice').length;
    this.missingBomCount = items.filter(x => x.unpricedReasonKey === 'MissingBomCost').length;
    this.zeroWarehouseCostCount = items.filter(x => x.unpricedReasonKey === 'ZeroWarehouseAvgCost').length;
  }

  onFilterChange(): void {
    this.filters.pageNumber = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    this.filters.pageNumber = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.filters.pageSize = size;
    this.filters.pageNumber = 1;
    this.loadData();
  }

  openPriceModal(item: UnpricedItem): void {
    this.selectedItem = item;
    this.newInitialPrice = item.initialPrice > 0 ? item.initialPrice : 0;
    this.isModalOpen = true;
  }

  closePriceModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.newInitialPrice = 0;
  }

  saveInitialPrice(): void {
    if (!this.selectedItem || this.newInitialPrice <= 0) {
      this.toastr.warning(this.translate.instant('common.invalidPrice'));
      return;
    }

    this.savingPrice = true;
    this.reportService.updateItemInitialCost({
      itemId: this.selectedItem.itemId,
      initialPrice: this.newInitialPrice
    }).subscribe({
      next: (res) => {
        this.savingPrice = false;
        this.toastr.success(this.translate.instant('reports.unpricedItems.updateSuccess'));
        this.closePriceModal();
        this.loadData();
      },
      error: (err) => {
        this.savingPrice = false;
        this.toastr.error(err?.error?.detail || this.translate.instant('common.errorSaving'));
      }
    });
  }

  exportExcel(): void {
    this.exportLoadingService.show({ fileType: 'excel' });
    this.reportService.exportUnpricedItemsExcel(this.filters).subscribe({
      next: (blob) => {
        this.exportLoadingService.hide();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Unpriced_Items_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportLoadingService.hide();
        this.toastr.error(this.translate.instant('common.exportError'));
      }
    });
  }
}
