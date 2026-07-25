import { Component, EventEmitter, inject, Input, Output, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SalesQuotationService } from '../../../../core/services/sales-quotation.service';
import { OpenSalesQuotationLineResponse } from '../../../../core/models/sales-quotation.model';

@Component({
  selector: 'app-sq-lines-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './sq-lines-import-modal.component.html',
})
export class SqLinesImportModalComponent implements OnChanges {
  private sqService = inject(SalesQuotationService);

  @Input() isOpen = false;
  @Input() customerId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() importLines = new EventEmitter<OpenSalesQuotationLineResponse[]>();

  lines: OpenSalesQuotationLineResponse[] = [];
  selectedLines: Set<number> = new Set<number>();
  loading = false;
  searchTerm = '';

  get filteredLines(): OpenSalesQuotationLineResponse[] {
    if (!this.searchTerm) return this.lines;
    const term = this.searchTerm.toLowerCase();
    return this.lines.filter(l => 
      l.itemCode.toLowerCase().includes(term) ||
      l.itemName.toLowerCase().includes(term) ||
      l.salesQuotationCode.toLowerCase().includes(term)
    );
  }

  ngOnChanges() {
    if (this.isOpen && this.customerId) {
      this.searchTerm = '';
      this.selectedLines.clear();
      this.loadLines();
    }
  }

  loadLines() {
    this.loading = true;
    this.sqService.getOpenLines(this.customerId!).subscribe({
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
      this.filteredLines.forEach(l => this.selectedLines.add(l.salesQuotationLineId));
    }
  }

  confirmSelection() {
    const selected = this.lines.filter(l => this.selectedLines.has(l.salesQuotationLineId));
    this.importLines.emit(selected);
    this.onClose();
  }

  onClose() {
    this.selectedLines.clear();
    this.close.emit();
  }
}

