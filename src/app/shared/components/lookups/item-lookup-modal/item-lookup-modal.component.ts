import { Component, EventEmitter, inject, Input, Output, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { ItemLookupResponse } from '../../../../core/models/lookup.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-item-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './item-lookup-modal.component.html',
})
export class ItemLookupModalComponent implements OnChanges, OnInit, OnDestroy {
  private lookupService = inject(LookupService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<ItemLookupResponse>();

  items: ItemLookupResponse[] = [];
  loading = false;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.pageNumber = 1;
      this.loadItems();
    });
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.searchTerm = '';
      this.pageNumber = 1;
      this.loadItems();
    }
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  loadItems() {
    this.loading = true;
    this.lookupService.getSalesItemsLookup({ 
      searchValue: this.searchTerm,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.pageNumber = res.pageIndex || 1;
        this.totalPages = res.totalPages || 1;
        this.totalRecords = res.totalRecords || 0;
        this.hasPreviousPage = res.hasPreviousPage || false;
        this.hasNextPage = res.hasNextPage || false;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch() {
    this.pageNumber = 1;
    this.loadItems();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadItems();
    }
  }

  selectedItemToConfirm: ItemLookupResponse | null = null;

  onSelect(item: ItemLookupResponse) {
    // Temporarily disabled confirmation without deleting code
    // this.selectedItemToConfirm = item;
    this.selectItem.emit(item);
    this.close.emit();
  }

  confirmSelection() {
    if (this.selectedItemToConfirm) {
      this.selectItem.emit(this.selectedItemToConfirm);
      this.close.emit();
      this.selectedItemToConfirm = null;
    }
  }

  cancelSelection() {
    this.selectedItemToConfirm = null;
  }

  onClose() {
    this.selectedItemToConfirm = null;
    this.close.emit();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
