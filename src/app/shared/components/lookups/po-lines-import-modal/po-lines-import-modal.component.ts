import { Component, EventEmitter, inject, Input, Output, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { PurchaseOrderService } from '../../../../core/services/purchase-order.service';
import { OpenPurchaseOrderLineResponse } from '../../../../core/models/purchase-order.model';

@Component({
  selector: 'app-po-lines-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './po-lines-import-modal.component.html',
})
export class PoLinesImportModalComponent implements OnChanges {
  private poService = inject(PurchaseOrderService);

  @Input() isOpen = false;
  @Input() vendorId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() importLines = new EventEmitter<OpenPurchaseOrderLineResponse[]>();

  lines: OpenPurchaseOrderLineResponse[] = [];
  selectedLines: Set<number> = new Set<number>();
  loading = false;
  searchTerm = '';

  get filteredLines(): OpenPurchaseOrderLineResponse[] {
    if (!this.searchTerm) return this.lines;
    const term = this.searchTerm.toLowerCase();
    return this.lines.filter(l => 
      l.itemCode.toLowerCase().includes(term) ||
      l.itemName.toLowerCase().includes(term) ||
      l.purchaseOrderCode.toLowerCase().includes(term)
    );
  }

  ngOnChanges() {
    if (this.isOpen && this.vendorId) {
      this.searchTerm = '';
      this.selectedLines.clear();
      this.loadLines();
    }
  }

  loadLines() {
    this.loading = true;
    this.poService.getOpenLines(this.vendorId!).subscribe({
      next: (res) => {
        this.lines = res || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleSelection(lineId: number) {
    if (this.selectedLines.has(lineId)) {
      this.selectedLines.delete(lineId);
    } else {
      this.selectedLines.add(lineId);
    }
  }

  isAllSelected(): boolean {
    return this.filteredLines.length > 0 && this.selectedLines.size === this.filteredLines.length;
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedLines.clear();
    } else {
      this.filteredLines.forEach(l => this.selectedLines.add(l.purchaseOrderLineId));
    }
  }

  confirmSelection() {
    const selected = this.lines.filter(l => this.selectedLines.has(l.purchaseOrderLineId));
    this.importLines.emit(selected);
    this.onClose();
  }

  onClose() {
    this.selectedLines.clear();
    this.close.emit();
  }
}
