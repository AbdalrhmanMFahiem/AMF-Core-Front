import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesRepService } from '../../../core/services/sales-rep.service';
import { ItemService } from '../../../core/services/item.service';
import { SalesRepCustomerResponse, SalesRepWarehouseResponse } from '../../../core/models/sales-rep.model';

export interface QuickSaleCartItem {
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  maxStock?: number;
}

@Component({
  selector: 'app-quick-sale',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './quick-sale.component.html',
  styleUrls: ['./quick-sale.component.css']
})
export class QuickSaleComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  private itemService = inject(ItemService);
  public translate = inject(TranslateService);

  customers: SalesRepCustomerResponse[] = [];
  warehouses: SalesRepWarehouseResponse[] = [];

  selectedCustomerId: number | null = null;
  selectedWarehouseId: number | null = null;
  paymentMethod: string = 'cash';
  paidAmount: number = 0;
  notes: string = '';

  searchQuery: string = '';
  availableItems: any[] = [];
  filteredItems: any[] = [];
  loadingItems: boolean = false;

  cart: QuickSaleCartItem[] = [];
  recentInvoices: any[] = [];

  loadingCustomers: boolean = false;
  loadingWarehouses: boolean = false;
  submitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWarehouses();
    this.loadItems();
  }

  loadCustomers(): void {
    this.loadingCustomers = true;
    this.salesRepService.getMyCustomers().subscribe({
      next: (res: any) => {
        this.customers = res;
        this.loadingCustomers = false;
        if (this.customers.length > 0) {
          this.selectedCustomerId = this.customers[0].id;
        }
      },
      error: () => {
        this.loadingCustomers = false;
      }
    });
  }

  loadWarehouses(): void {
    this.loadingWarehouses = true;
    this.salesRepService.getMyWarehouses().subscribe({
      next: (res: any) => {
        this.warehouses = res;
        this.loadingWarehouses = false;
        const defaultWh = this.warehouses.find(w => w.isDefault) || this.warehouses[0];
        if (defaultWh) {
          this.selectedWarehouseId = defaultWh.id;
        }
      },
      error: () => {
        this.loadingWarehouses = false;
      }
    });
  }

  loadItems(): void {
    this.loadingItems = true;
    this.itemService.getAll({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (res: any) => {
        this.availableItems = res.items || res;
        this.filteredItems = [...this.availableItems];
        this.loadingItems = false;
      },
      error: () => {
        this.loadingItems = false;
      }
    });
  }

  filterItems(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.availableItems];
      return;
    }
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredItems = this.availableItems.filter(item =>
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.aName && item.aName.toLowerCase().includes(q)) ||
      (item.eName && item.eName.toLowerCase().includes(q)) ||
      (item.barcode && item.barcode.toLowerCase().includes(q))
    );
  }

  getItemPrice(item: any): number {
    return item.salesPrice || item.initialPrice || item.price || 0;
  }

  addToCart(item: any): void {
    const existing = this.cart.find(c => c.itemId === item.id);
    if (existing) {
      existing.quantity += 1;
      this.recalculateLine(existing);
    } else {
      const price = this.getItemPrice(item);
      const cartItem: QuickSaleCartItem = {
        itemId: item.id,
        code: item.code,
        name: item.aName || item.name,
        quantity: 1,
        unitPrice: price,
        discountAmount: 0,
        subtotal: price
      };
      this.cart.push(cartItem);
    }
    this.updatePaidAmountDefault();
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.updatePaidAmountDefault();
  }

  updateQuantity(item: QuickSaleCartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      const idx = this.cart.indexOf(item);
      if (idx > -1) this.cart.splice(idx, 1);
    } else {
      this.recalculateLine(item);
    }
    this.updatePaidAmountDefault();
  }

  onUnitPriceChange(item: QuickSaleCartItem): void {
    if (item.unitPrice < 0 || item.unitPrice === null || item.unitPrice === undefined) {
      item.unitPrice = 0;
    }
    this.recalculateLine(item);
    this.updatePaidAmountDefault();
  }

  recalculateLine(item: QuickSaleCartItem): void {
    item.subtotal = (item.quantity * item.unitPrice) - (item.discountAmount || 0);
  }

  get totalSubtotal(): number {
    return this.cart.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  }

  get totalDiscount(): number {
    return this.cart.reduce((sum, i) => sum + (i.discountAmount || 0), 0);
  }

  get grandTotal(): number {
    return Math.max(0, this.totalSubtotal - this.totalDiscount);
  }

  updatePaidAmountDefault(): void {
    if (this.paymentMethod !== 'credit') {
      this.paidAmount = this.grandTotal;
    }
  }

  onPaymentMethodChange(): void {
    if (this.paymentMethod === 'credit') {
      this.paidAmount = 0;
    } else {
      this.paidAmount = this.grandTotal;
    }
  }

  submitSale(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.selectedCustomerId) {
      this.errorMessage = 'يرجى اختيار العميل أولاً';
      return;
    }
    if (!this.selectedWarehouseId) {
      this.errorMessage = 'يرجى اختيار المخزن أولاً';
      return;
    }
    if (this.cart.length === 0) {
      this.errorMessage = 'سلة المشتريات فارغة!';
      return;
    }

    const zeroPriced = this.cart.find(c => c.unitPrice <= 0);
    if (zeroPriced) {
      this.errorMessage = `الصنف "${zeroPriced.name}" ليس له سعر بيع (0 ج.م). يرجى أدخال السعر في السلة أولاً.`;
      return;
    }

    const payload = {
      businessPartnerId: this.selectedCustomerId,
      warehouseId: this.selectedWarehouseId,
      paymentMethod: this.paymentMethod,
      paidAmount: this.paidAmount,
      notes: this.notes,
      lines: this.cart.map(c => ({
        itemId: c.itemId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discountAmount: c.discountAmount
      }))
    };

    this.submitting = true;
    this.salesRepService.quickSale(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMessage = `تمت عملية البيع بنجاح! رقم الفاتورة: ${res.code || res.id}`;
        this.recentInvoices.unshift({
          id: res.id,
          code: res.code,
          customerName: res.businessPartnerName,
          totalAmount: res.totalAmount,
          date: new Date()
        });
        if (this.recentInvoices.length > 5) this.recentInvoices.pop();

        // Reset cart
        this.cart = [];
        this.notes = '';
        this.updatePaidAmountDefault();
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || err?.error?.message || 'حدث خطأ أثناء تنفيذ عملية البيع.';
      }
    });
  }

  clearCart(): void {
    this.cart = [];
    this.paidAmount = 0;
  }
}
