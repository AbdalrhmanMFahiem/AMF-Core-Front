import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { BomComponentLookupResponse } from '../../../../core/models/item-bom.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-component-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './component-lookup-modal.component.html',
})
export class ComponentLookupModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() fetchFn?: (headerItemId: number, lineType: string) => Observable<BomComponentLookupResponse[]>;
  @Input() headerItemId?: number;
  @Input() lineType?: string;
  @Output() close = new EventEmitter<void>();
  @Output() selectComponent = new EventEmitter<BomComponentLookupResponse>();

  allItems: BomComponentLookupResponse[] = [];
  loading = false;
  searchTerm = '';

  get filteredItems(): BomComponentLookupResponse[] {
    if (!this.searchTerm) return this.allItems;
    const lower = this.searchTerm.toLowerCase();
    return this.allItems.filter(
      item => (item.code && item.code.toLowerCase().includes(lower)) ||
              (item.name && item.name.toLowerCase().includes(lower))
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true && changes['isOpen'].previousValue !== true) {
      this.searchTerm = '';
      this.loadItems();
    }
  }

  loadItems() {
    if (!this.fetchFn || !this.headerItemId || !this.lineType) return;
    this.loading = true;
    this.fetchFn(this.headerItemId, this.lineType).subscribe({
      next: (res) => {
        this.allItems = res || [];
        this.loading = false;
      },
      error: () => {
        this.allItems = [];
        this.loading = false;
      }
    });
  }

  onSelect(item: BomComponentLookupResponse) {
    this.selectComponent.emit(item);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
