import { Component, EventEmitter, inject, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';

@Component({
  selector: 'app-item-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './item-lookup-modal.component.html',
})
export class ItemLookupModalComponent implements OnChanges {
  private lookupService = inject(LookupService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<ItemLookupResponse>();

  items: ItemLookupResponse[] = [];
  loading = false;
  searchTerm = '';

  ngOnChanges() {
    if (this.isOpen) {
      this.searchTerm = '';
      this.loadItems();
    }
  }

  loadItems() {
    this.loading = true;
    // Uses the sales-items endpoint. Can be abstracted later if needed for other types.
    this.lookupService.getSalesItemsLookup({ searchValue: this.searchTerm }).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch() {
    this.loadItems();
  }

  onSelect(item: ItemLookupResponse) {
    this.selectItem.emit(item);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
