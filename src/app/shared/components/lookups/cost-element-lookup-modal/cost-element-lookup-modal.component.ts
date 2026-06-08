import { Component, EventEmitter, inject, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { InvoiceCostElementDropdown } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-cost-element-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './cost-element-lookup-modal.component.html',
})
export class CostElementLookupModalComponent implements OnChanges {
  private lookupService = inject(LookupService);

  @Input() isOpen = false;
  // Allows selecting whether to fetch sales or purchase cost elements
  @Input() type: 'sales' | 'purchase' = 'sales'; 
  @Output() close = new EventEmitter<void>();
  @Output() selectElement = new EventEmitter<InvoiceCostElementDropdown>();

  elements: InvoiceCostElementDropdown[] = [];
  loading = false;
  searchTerm = '';

  ngOnChanges() {
    if (this.isOpen) {
      this.searchTerm = '';
      this.loadElements();
    }
  }

  loadElements() {
    this.loading = true;
    const request = this.type === 'sales'
      ? this.lookupService.getInvoiceCostElementsSalesDropdown({ searchValue: this.searchTerm })
      : this.lookupService.getInvoiceCostElementsPurchaseDropdown({ searchValue: this.searchTerm });

    request.subscribe({
      next: (res) => {
        this.elements = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch() {
    this.loadElements();
  }

  onSelect(element: InvoiceCostElementDropdown) {
    this.selectElement.emit(element);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
