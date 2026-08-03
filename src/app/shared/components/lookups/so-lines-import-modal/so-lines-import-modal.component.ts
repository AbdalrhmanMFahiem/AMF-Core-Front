import { Component, EventEmitter, inject, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SalesOrderService } from '../../../../core/services/sales-order.service';
import { OpenSalesOrderLineResponse } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-so-lines-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './so-lines-import-modal.component.html',
})
export class SoLinesImportModalComponent implements OnChanges {
  private soService = inject(SalesOrderService);

  @Input() isOpen = false;
  @Input() customerId?: number;
  @Input() existingItemIds: number[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() importLines = new EventEmitter<OpenSalesOrderLineResponse[]>();

  lines: OpenSalesOrderLineResponse[] = [];
  selectedLines: Set<number> = new Set<number>();
  loading = false;
  searchTerm = '';

  get filteredLines(): OpenSalesOrderLineResponse[] {
    if (!this.searchTerm) return this.lines;
    const term = this.searchTerm.toLowerCase();
    return this.lines.filter(l => 
      l.itemCode.toLowerCase().includes(term) ||
      l.itemName.toLowerCase().includes(term) ||
      l.salesOrderCode.toLowerCase().includes(term)
    );
  }

  get selectableLines(): OpenSalesOrderLineResponse[] {
    return this.filteredLines.filter(l => !this.isItemDisabled(l.itemId));
  }

  isItemDisabled(itemId: number): boolean {
    return !!this.existingItemIds && this.existingItemIds.includes(itemId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['isOpen'] || changes['customerId']) && this.isOpen && this.customerId) {
      this.searchTerm = '';
      this.selectedLines.clear();
      this.loadLines();
    }
  }

  loadLines() {
    this.loading = true;
    this.soService.getOpenLinesForInvoice(this.customerId!).subscribe({
      next: (res: any[]) => {
        this.lines = (res || []).map(l => ({
          ...l,
          salesOrderLineId: l.salesOrderLineId || l.id,
          salesOrderCode: l.salesOrderCode || l.baseDocumentCode || l.baseDocumentId || l.code || '',
          importQuantity: l.openQuantity
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleSelection(line: OpenSalesOrderLineResponse) {
    if (this.isItemDisabled(line.itemId)) return;
    if (this.selectedLines.has(line.salesOrderLineId)) {
      this.selectedLines.delete(line.salesOrderLineId);
    } else {
      this.selectedLines.add(line.salesOrderLineId);
    }
  }

  isAllSelected(): boolean {
    return this.selectableLines.length > 0 && this.selectableLines.every(l => this.selectedLines.has(l.salesOrderLineId));
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedLines.clear();
    } else {
      this.selectableLines.forEach(l => this.selectedLines.add(l.salesOrderLineId));
    }
  }

  confirmSelection() {
    const selected = this.lines
      .filter(l => this.selectedLines.has(l.salesOrderLineId))
      .map(l => ({
        ...l,
        quantity: Math.min(Math.max(1, l.importQuantity || l.openQuantity), l.openQuantity)
      }));
    this.importLines.emit(selected);
    this.onClose();
  }

  onClose() {
    this.selectedLines.clear();
    this.close.emit();
  }
}
