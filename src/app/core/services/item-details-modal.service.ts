import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItemService } from './item.service';
import { ItemBasicResponse, ItemWarehouseStockResponse } from '../models/item.model';
import { ItemBomLineResponse } from '../models/item-bom.model';

export interface ItemDetailsState {
  isOpen: boolean;
  loading: boolean;
  itemId?: number;
  item?: ItemBasicResponse | null;
  stock?: ItemWarehouseStockResponse | null;
  bomComponents?: ItemBomLineResponse[] | null;
  error?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ItemDetailsModalService {
  private itemService = inject(ItemService);

  private stateSubject = new BehaviorSubject<ItemDetailsState>({
    isOpen: false,
    loading: false,
    item: null,
    stock: null,
    bomComponents: null
  });

  public readonly state$: Observable<ItemDetailsState> = this.stateSubject.asObservable();

  open(itemId: number): void {
    this.stateSubject.next({
      isOpen: true,
      loading: true,
      itemId,
      item: null,
      stock: null,
      bomComponents: null,
      error: null
    });

    forkJoin({
      item: this.itemService.get(itemId).pipe(catchError(() => of(null))),
      stock: this.itemService.getWarehouseStock(itemId).pipe(catchError(() => of(null))),
      bomComponents: this.itemService.getBomComponents(itemId).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.stateSubject.next({
          isOpen: true,
          loading: false,
          itemId,
          item: res.item,
          stock: res.stock,
          bomComponents: res.bomComponents,
          error: res.item ? null : 'Failed to load item details'
        });
      },
      error: () => {
        this.stateSubject.next({
          isOpen: true,
          loading: false,
          itemId,
          item: null,
          stock: null,
          bomComponents: null,
          error: 'Error loading item data'
        });
      }
    });
  }

  close(): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      isOpen: false
    });
  }
}
