import { Component, EventEmitter, inject, Input, Output, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { LookupService } from '../../../../core/services/lookup.service';
import { InvoiceCostElementDropdown } from '../../../../core/models/lookup.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-cost-element-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalComponent],
  templateUrl: './cost-element-lookup-modal.component.html',
})
export class CostElementLookupModalComponent implements OnChanges, OnInit, OnDestroy {
  private lookupService = inject(LookupService);

  @Input() isOpen = false;
  // Allows selecting whether to fetch sales or purchase cost elements
  @Input() type: 'sales' | 'purchase' = 'sales'; 
  @Output() close = new EventEmitter<void>();
  @Output() selectElement = new EventEmitter<InvoiceCostElementDropdown>();

  elements: InvoiceCostElementDropdown[] = [];
  filteredElements: InvoiceCostElementDropdown[] = [];
  loading = false;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  selectedElementToConfirm: InvoiceCostElementDropdown | null = null;

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterElementsLocally();
    });
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.searchTerm = '';
      this.loadElements();
    }
  }

  onSearchTermChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  loadElements() {
    this.loading = true;
    const mappedType = this.type === 'sales' ? 'Sales' : 'Purchases';
    const request = this.lookupService.getInvoiceCostElementsDropdown(mappedType);

    request.subscribe({
      next: (res) => {
        this.elements = res || [];
        this.filterElementsLocally();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterElementsLocally() {
    if (!this.searchTerm) {
      this.filteredElements = [...this.elements];
    } else {
      const lowerTerm = this.searchTerm.toLowerCase();
      this.filteredElements = this.elements.filter(e => 
        (e.code && e.code.toLowerCase().includes(lowerTerm)) || 
        (e.name && e.name.toLowerCase().includes(lowerTerm))
      );
    }
  }

  onSearch() {
    this.filterElementsLocally();
  }

  onSelect(element: InvoiceCostElementDropdown) {
    this.selectedElementToConfirm = element;
  }

  confirmSelection() {
    if (this.selectedElementToConfirm) {
      this.selectElement.emit(this.selectedElementToConfirm);
      this.close.emit();
      this.selectedElementToConfirm = null;
    }
  }

  cancelSelection() {
    this.selectedElementToConfirm = null;
  }

  onClose() {
    this.selectedElementToConfirm = null;
    this.close.emit();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
