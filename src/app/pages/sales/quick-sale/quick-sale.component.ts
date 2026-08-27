import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { SalesRepService } from '../../../core/services/sales-rep.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import {
  SalesRepCustomerResponse,
  SalesRepWarehouseResponse,
  QuickSaleItemResponse
} from '../../../core/models/sales-rep.model';
import { PrintPreviewModalComponent } from '../../../shared/components/common/print-preview-modal/print-preview-modal.component';

export interface QuickSaleCartItem {
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  availableQuantity: number;
  salesUomId?: number;
  salesUomName?: string;
}

export interface RecentInvoiceItem {
  id: number;
  code: string;
  customerName: string;
  totalAmount: number;
  date: Date;
}

@Component({
  selector: 'app-quick-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    PrintPreviewModalComponent
  ],
  templateUrl: './quick-sale.component.html',
  styleUrls: ['./quick-sale.component.css']
})
export class QuickSaleComponent implements OnInit {
  private salesRepService = inject(SalesRepService);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  customers: SalesRepCustomerResponse[] = [];
  warehouses: SalesRepWarehouseResponse[] = [];

  selectedCustomerId: number | null = null;
  selectedWarehouseId: number | null = null;
  paymentMethod: string = 'cash';
  paidAmount: number = 0;
  notes: string = '';

  searchQuery: string = '';
  selectedCategory: string = 'all';
  availableCategories: string[] = [];

  availableItems: QuickSaleItemResponse[] = [];
  filteredItems: QuickSaleItemResponse[] = [];
  loadingItems: boolean = false;

  cart: QuickSaleCartItem[] = [];
  recentInvoices: RecentInvoiceItem[] = [];

  loadingCustomers: boolean = false;
  loadingWarehouses: boolean = false;
  submitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Print & Post-Sale Actions Modal
  isSuccessModalOpen: boolean = false;
  lastCreatedInvoice: RecentInvoiceItem | null = null;

  // PDF Print Preview Modal
  isPrintPreviewOpen: boolean = false;
  pdfBlobUrl: string | null = null;
  pdfLoading: boolean = false;
  printPreviewTitle: string = '';

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWarehouses();
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar' || !this.translate.currentLang;
  }

  loadCustomers(): void {
    this.loadingCustomers = true;
    this.salesRepService.getMyCustomers().subscribe({
      next: (res: SalesRepCustomerResponse[]) => {
        this.customers = res || [];
        this.loadingCustomers = false;
        if (this.customers.length > 0 && !this.selectedCustomerId) {
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
      next: (res: SalesRepWarehouseResponse[]) => {
        this.warehouses = res || [];
        this.loadingWarehouses = false;
        const defaultWh = this.warehouses.find(w => w.isDefault) || this.warehouses[0];
        if (defaultWh) {
          this.selectedWarehouseId = defaultWh.id;
          this.loadItemsForWarehouse(defaultWh.id);
        }
      },
      error: () => {
        this.loadingWarehouses = false;
      }
    });
  }

  onWarehouseChange(newWarehouseIdValue: any): void {
    const newId = newWarehouseIdValue ? Number(newWarehouseIdValue) : null;
    if (newId === this.selectedWarehouseId) {
      return;
    }

    if (this.cart.length > 0) {
      Swal.fire({
        title: this.translate.instant('quickSale.confirmChangeWarehouseTitle'),
        text: this.translate.instant('quickSale.confirmChangeWarehouseText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('quickSale.confirmChangeWarehouseBtn'),
        cancelButtonText: this.translate.instant('common.cancel'),
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        customClass: { popup: this.isRtl ? 'swal-rtl' : '' }
      }).then((result) => {
        if (result.isConfirmed) {
          this.cart = [];
          this.selectedWarehouseId = newId;
          this.updatePaidAmountDefault();
          if (newId) {
            this.loadItemsForWarehouse(newId);
          } else {
            this.availableItems = [];
            this.filteredItems = [];
          }
        } else {
          // Revert dropdown UI selection
          const elem = document.getElementById('warehouseSelect') as HTMLSelectElement;
          if (elem && this.selectedWarehouseId !== null) {
            elem.value = this.selectedWarehouseId.toString();
          }
        }
      });
    } else {
      this.selectedWarehouseId = newId;
      if (newId) {
        this.loadItemsForWarehouse(newId);
      } else {
        this.availableItems = [];
        this.filteredItems = [];
      }
    }
  }

  loadItemsForWarehouse(warehouseId: number): void {
    this.loadingItems = true;
    this.salesRepService.getQuickSaleItemsByWarehouse(warehouseId).subscribe({
      next: (res: QuickSaleItemResponse[]) => {
        this.availableItems = res || [];
        this.extractCategories();
        this.filterItems();
        this.loadingItems = false;
      },
      error: () => {
        this.loadingItems = false;
        this.availableItems = [];
        this.filteredItems = [];
      }
    });
  }

  extractCategories(): void {
    const categories = new Set<string>();
    this.availableItems.forEach(item => {
      if (item.itemGroupName && item.itemGroupName.trim()) {
        categories.add(item.itemGroupName.trim());
      }
    });
    this.availableCategories = Array.from(categories);
    if (!this.availableCategories.includes(this.selectedCategory) && this.selectedCategory !== 'all') {
      this.selectedCategory = 'all';
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterItems();
  }

  filterItems(): void {
    let result = [...this.availableItems];

    if (this.selectedCategory !== 'all') {
      result = result.filter(item => item.itemGroupName === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.aName && item.aName.toLowerCase().includes(q)) ||
        (item.eName && item.eName.toLowerCase().includes(q)) ||
        (item.barcode && item.barcode.toLowerCase().includes(q))
      );
    }

    this.filteredItems = result;
  }

  getItemDisplayName(item: QuickSaleItemResponse): string {
    if (this.translate.currentLang === 'en') {
      return item.eName || item.aName || item.code;
    }
    return item.aName || item.eName || item.code;
  }

  addToCart(item: QuickSaleItemResponse): void {
    if (!item.isActive) {
      return;
    }

    if (item.availableQuantity <= 0) {
      this.toastr.warning(
        this.translate.instant('quickSale.itemOutOfStockError', {
          name: this.getItemDisplayName(item)
        })
      );
      return;
    }

    const existing = this.cart.find(c => c.itemId === item.id);
    if (existing) {
      if (existing.quantity + 1 > item.availableQuantity) {
        this.toastr.warning(
          this.translate.instant('quickSale.maxStockExceeded', {
            stock: item.availableQuantity,
            uom: item.salesUomName || ''
          })
        );
        return;
      }
      existing.quantity += 1;
      this.recalculateLine(existing);
    } else {
      const cartItem: QuickSaleCartItem = {
        itemId: item.id,
        code: item.code,
        name: this.getItemDisplayName(item),
        quantity: 1,
        unitPrice: item.price || 0,
        discountAmount: 0,
        subtotal: item.price || 0,
        availableQuantity: item.availableQuantity,
        salesUomId: item.salesUomId,
        salesUomName: item.salesUomName
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
    if (change > 0 && item.quantity + change > item.availableQuantity) {
      this.toastr.warning(
        this.translate.instant('quickSale.maxStockExceeded', {
          stock: item.availableQuantity,
          uom: item.salesUomName || ''
        })
      );
      return;
    }

    item.quantity += change;
    if (item.quantity <= 0) {
      const idx = this.cart.indexOf(item);
      if (idx > -1) {
        this.cart.splice(idx, 1);
      }
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

  onDiscountChange(item: QuickSaleCartItem): void {
    if (item.discountAmount < 0 || item.discountAmount === null || item.discountAmount === undefined) {
      item.discountAmount = 0;
    }
    const maxDiscount = item.quantity * item.unitPrice;
    if (item.discountAmount > maxDiscount) {
      item.discountAmount = maxDiscount;
    }
    this.recalculateLine(item);
    this.updatePaidAmountDefault();
  }

  recalculateLine(item: QuickSaleCartItem): void {
    const gross = item.quantity * item.unitPrice;
    item.subtotal = Math.max(0, gross - (item.discountAmount || 0));
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
      const msg = this.translate.instant('quickSale.customerRequired');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      return;
    }
    if (!this.selectedWarehouseId) {
      const msg = this.translate.instant('quickSale.warehouseRequired');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      return;
    }
    if (this.cart.length === 0) {
      const msg = this.translate.instant('quickSale.cartEmptyError');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      return;
    }

    const zeroPriced = this.cart.find(c => c.unitPrice <= 0);
    if (zeroPriced) {
      const msg = this.translate.instant('quickSale.zeroPriceError', {
        name: zeroPriced.name
      });
      this.errorMessage = msg;
      this.toastr.warning(msg);
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
        discountAmount: c.discountAmount,
        uomId: c.salesUomId
      }))
    };

    this.submitting = true;
    this.salesRepService.quickSale(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        const invoiceCode = res.code || res.id;
        const msg = this.translate.instant('quickSale.saleSuccess', {
          code: invoiceCode
        });
        this.successMessage = msg;
        this.toastr.success(msg);

        const customerName = res.businessPartnerName
          || (this.customers.find(c => c.id === this.selectedCustomerId)?.name ?? '');

        const newInvoiceRecord: RecentInvoiceItem = {
          id: res.id,
          code: res.code || `INV-${res.id}`,
          customerName: customerName,
          totalAmount: res.totalAmount || this.grandTotal,
          date: new Date()
        };

        this.lastCreatedInvoice = newInvoiceRecord;
        this.recentInvoices.unshift(newInvoiceRecord);
        if (this.recentInvoices.length > 8) {
          this.recentInvoices.pop();
        }

        // Open print options dialog immediately
        this.isSuccessModalOpen = true;

        // Reset cart and reload warehouse items to refresh real-time stock balances
        this.cart = [];
        this.notes = '';
        this.updatePaidAmountDefault();
        if (this.selectedWarehouseId) {
          this.loadItemsForWarehouse(this.selectedWarehouseId);
        }
      },
      error: (err: any) => {
        this.submitting = false;
        const msg =
          err?.error?.detail ||
          err?.error?.message ||
          this.translate.instant('errors.generic');
        this.errorMessage = msg;
        this.toastr.error(msg);
      }
    });
  }

  // ── Printing Methods ──────────────────────────────────────────────────────────

  openStandardPrint(invoiceId: number, invoiceCode: string): void {
    this.pdfLoading = true;
    this.isPrintPreviewOpen = true;
    this.printPreviewTitle = `${this.translate.instant('quickSale.printStandard')} - ${invoiceCode}`;

    this.invoiceService.printPdf(invoiceId).subscribe({
      next: (blob: Blob) => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
        }
        this.pdfBlobUrl = window.URL.createObjectURL(blob);
        this.pdfLoading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
        this.pdfLoading = false;
        this.isPrintPreviewOpen = false;
      }
    });
  }

  openReceiptPrint(invoiceId: number, invoiceCode: string): void {
    this.pdfLoading = true;
    this.isPrintPreviewOpen = true;
    this.printPreviewTitle = `${this.translate.instant('quickSale.printReceipt')} - ${invoiceCode}`;

    this.invoiceService.printReceiptPdf(invoiceId).subscribe({
      next: (blob: Blob) => {
        if (this.pdfBlobUrl) {
          window.URL.revokeObjectURL(this.pdfBlobUrl);
        }
        this.pdfBlobUrl = window.URL.createObjectURL(blob);
        this.pdfLoading = false;
      },
      error: () => {
        this.toastr.error(this.translate.instant('errors.generic'));
        this.pdfLoading = false;
        this.isPrintPreviewOpen = false;
      }
    });
  }

  closePrintPreview(): void {
    this.isPrintPreviewOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  viewInvoiceDetails(invoiceId: number): void {
    this.isSuccessModalOpen = false;
    this.router.navigate(['/invoices/sales/view', invoiceId]);
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }

  startNewSale(): void {
    this.isSuccessModalOpen = false;
    this.cart = [];
    this.notes = '';
    this.updatePaidAmountDefault();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterItems();
  }

  getItemQuantityInCart(itemId: number): number {
    const item = this.cart.find(c => c.itemId === itemId);
    return item ? item.quantity : 0;
  }

  clearCart(): void {
    this.cart = [];
    this.paidAmount = 0;
  }
}
