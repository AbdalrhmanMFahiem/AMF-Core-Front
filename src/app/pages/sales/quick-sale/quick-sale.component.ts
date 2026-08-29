import { Component, OnInit, OnDestroy, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { SalesRepService } from '../../../core/services/sales-rep.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  SalesRepCustomerResponse,
  SalesRepWarehouseResponse,
  QuickSaleItemResponse,
  QuickSaleUomOption
} from '../../../core/models/sales-rep.model';
import { BusinessPartnerResponse } from '../../../core/models/business-partner.model';
import { InvoiceResponse } from '../../../core/models/invoice.model';
import { PrintSettingService } from '../../../core/services/print-setting.service';
import { PrintSettingRequest } from '../../../core/models/print-setting.model';
import { PrintPreviewModalComponent } from '../../../shared/components/common/print-preview-modal/print-preview-modal.component';
import { QuickCustomerModalComponent } from '../../../shared/components/quick-customer-modal/quick-customer-modal.component';
import { PaymentModalComponent } from '../invoices/payment-modal/payment-modal.component';

export interface PosPrintPreferences {
  enableThermal58: boolean;
  enableThermal80: boolean;
  enableA4: boolean;
  autoPreviewSingleMethod: boolean;
}

export interface QuickSaleCartItem {
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  discountAmount: number;
  subtotal: number;
  availableQuantity: number;
  salesUomId?: number;
  salesUomName?: string;
  salesUomConversionFactor: number;
  availableUoms?: QuickSaleUomOption[];
  barcode?: string;
}

export interface RecentInvoiceItem {
  id: number;
  code: string;
  customerName: string;
  totalAmount: number;
  date: Date;
  linesCount?: number;
  paymentMethod?: string;
  paymentStatus?: string | number;
  remainingAmount?: number;
  businessPartnerId?: number;
}

export interface HeldOrder {
  id: string;
  heldAt: Date;
  customerId: number | null;
  customerName: string;
  warehouseId: number | null;
  warehouseName: string;
  cart: QuickSaleCartItem[];
  notes: string;
  paymentMethod: string;
  paidAmount: number;
  totalAmount: number;
}

export interface ShiftInfo {
  cashierName: string;
  startTime: Date;
  totalSalesCount: number;
  totalCashSales: number;
  totalNonCashSales: number;
  grandTotal: number;
}

export interface LastSaleReceiptData {
  invoiceId: number;
  invoiceCode: string;
  customerName: string;
  warehouseName: string;
  cashierName: string;
  date: Date;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  changeDue: number;
  notes: string;
  lines: Array<{
    name: string;
    code: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    subtotal: number;
    uomName?: string;
  }>;
}

@Component({
  selector: 'app-quick-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    PrintPreviewModalComponent,
    QuickCustomerModalComponent,
    PaymentModalComponent
  ],
  templateUrl: './quick-sale.component.html',
  styleUrls: ['./quick-sale.component.css']
})
export class QuickSaleComponent implements OnInit, OnDestroy {
  private salesRepService = inject(SalesRepService);
  private invoiceService = inject(InvoiceService);
  private printSettingService = inject(PrintSettingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('paidAmountInput') paidAmountInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraVideo') cameraVideoElement?: ElementRef<HTMLVideoElement>;

  // Data sources
  customers: SalesRepCustomerResponse[] = [];
  warehouses: SalesRepWarehouseResponse[] = [];

  selectedCustomerId: number | null = null;
  selectedWarehouseId: number | null = null;
  paymentMethod: string = 'cash';
  paidAmount: number = 0;
  notes: string = '';

  // Search and Filtering
  searchQuery: string = '';
  selectedCategory: string = 'all';
  availableCategories: string[] = [];

  availableItems: QuickSaleItemResponse[] = [];
  filteredItems: QuickSaleItemResponse[] = [];
  loadingItems: boolean = false;

  // Active Cart & Invoices
  cart: QuickSaleCartItem[] = [];
  recentInvoices: RecentInvoiceItem[] = [];

  // Loading States & Messages
  loadingCustomers: boolean = false;
  loadingWarehouses: boolean = false;
  submitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Payment Modal Integration (Same as Sales Invoices)
  isPaymentModalOpen: boolean = false;
  selectedInvoiceForPayment: any = null;

  // Print & Post-Sale Actions Modal
  isSuccessModalOpen: boolean = false;
  lastCreatedInvoice: RecentInvoiceItem | null = null;
  lastSaleReceiptData: LastSaleReceiptData | null = null;

  // PDF Print Preview Modal
  isPrintPreviewOpen: boolean = false;
  pdfBlobUrl: string | null = null;
  pdfLoading: boolean = false;
  printPreviewTitle: string = '';

  // Thermal Receipt Direct Printing Format
  receiptPrintFormat: '58mm' | '80mm' = '80mm';

  // Mobile & Handheld Flow Controls
  isMobileCartOpen: boolean = false;
  isMobileCheckoutOpen: boolean = false;
  isMobileOrHandheld: boolean = false;
  isLaserScanning: boolean = false;
  isOnline: boolean = navigator.onLine;

  // Touch On-Screen Numpad for Touch POS Terminals
  showTouchNumpad: boolean = false;
  selectedCartIndex: number = -1;
  numpadTarget: 'qty' | 'disc' | 'price' = 'qty';
  numpadBuffer: string = '';

  // Camera Barcode Scanner
  isCameraScannerOpen: boolean = false;
  private cameraStream: MediaStream | null = null;
  private cameraScanInterval: any = null;

  // Quick Customer Creation Modal
  isQuickCustomerModalOpen: boolean = false;

  // Held Orders (Hold & Resume)
  heldOrders: HeldOrder[] = [];
  isHeldOrdersModalOpen: boolean = false;

  // Shift & Cash Drawer Tracking
  isShiftModalOpen: boolean = false;
  shiftInfo: ShiftInfo = {
    cashierName: '',
    startTime: new Date(),
    totalSalesCount: 0,
    totalCashSales: 0,
    totalNonCashSales: 0,
    grandTotal: 0
  };

  // Keyboard Shortcuts Help Modal
  isShortcutsModalOpen: boolean = false;

  // POS Print Preferences & Settings Modal
  isPrintSettingsModalOpen: boolean = false;
  posPrintPreferences: PosPrintPreferences = {
    enableThermal58: true,
    enableThermal80: true,
    enableA4: true,
    autoPreviewSingleMethod: true
  };

  // Dedicated POS Invoice Details Modal
  isInvoiceDetailsModalOpen: boolean = false;
  viewingInvoice: InvoiceResponse | null = null;
  loadingViewingInvoice: boolean = false;

  // Sound Feedback
  soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  // Barcode Laser Scanner Buffer
  private barcodeBuffer: string = '';
  private lastKeyTime: number = 0;
  private laserScanTimeout: any = null;

  // Quick Cash Denominations
  readonly quickCashDenominations: number[] = [50, 100, 200, 500];

  // Fullscreen state
  isFullscreen: boolean = false;

  // Event Listeners references
  private onlineHandler = () => (this.isOnline = true);
  private offlineHandler = () => (this.isOnline = false);
  private resizeHandler = () => this.checkDeviceDimensions();

  ngOnInit(): void {
    this.checkDeviceDimensions();
    this.initAudio();
    this.initShift();
    this.loadHeldOrders();
    this.loadPrintPreferences();
    this.loadCustomers();
    this.loadWarehouses();

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
    window.addEventListener('resize', this.resizeHandler);

    const savedSound = localStorage.getItem('pos_sound_enabled');
    if (savedSound !== null) {
      this.soundEnabled = savedSound === 'true';
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.stopCameraScan();
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar' || !this.translate.currentLang;
  }

  get isSystemAdmin(): boolean {
    return this.authService.isSystemAdmin();
  }

  get canExitToDashboard(): boolean {
    if (this.authService.isPosOnlyUser()) {
      return false;
    }
    return this.authService.hasDashboardPermission();
  }

  private checkDeviceDimensions(): void {
    this.isMobileOrHandheld = window.innerWidth < 1024;
  }

  // ── Audio Feedback Synthesis ───────────────────────────────────────────────

  private initAudio(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch {
      this.audioCtx = null;
    }
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('pos_sound_enabled', String(this.soundEnabled));
    if (this.soundEnabled) {
      this.playAudio('success');
    }
  }

  playAudio(type: 'beep' | 'success' | 'warning' | 'remove'): void {
    if (!this.soundEnabled || !this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'beep') {
        // Quick scan tone (880Hz -> 1200Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        // Double success chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'warning') {
        // Low buzz (220Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'remove') {
        // Descending click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // Audio playback failed silently
    }
  }

  // ── Global Hardware & Laser Barcode Scanner Listener ───────────────────────

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeyboard(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isInputFocused =
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

    // Shortcut handlers
    if (event.key === 'F1') {
      event.preventDefault();
      this.isShortcutsModalOpen = !this.isShortcutsModalOpen;
      return;
    }
    if (event.key === 'F2') {
      event.preventDefault();
      this.focusSearch();
      return;
    }
    if (event.key === 'F4') {
      event.preventDefault();
      this.openQuickCustomerModal();
      return;
    }
    if (event.key === 'F8') {
      event.preventDefault();
      this.holdCurrentOrder();
      return;
    }
    if (event.key === 'F9') {
      event.preventDefault();
      this.isHeldOrdersModalOpen = true;
      return;
    }
    if (event.key === 'F10') {
      event.preventDefault();
      this.openCheckout();
      return;
    }
    if (event.key === 'Escape') {
      if (this.isCameraScannerOpen) {
        this.stopCameraScan();
        return;
      }
      if (this.isPaymentModalOpen) {
        this.isPaymentModalOpen = false;
        return;
      }
      if (this.isShortcutsModalOpen) {
        this.isShortcutsModalOpen = false;
        return;
      }
      if (this.isHeldOrdersModalOpen) {
        this.isHeldOrdersModalOpen = false;
        return;
      }
      if (this.isShiftModalOpen) {
        this.isShiftModalOpen = false;
        return;
      }
      if (this.isQuickCustomerModalOpen) {
        this.isQuickCustomerModalOpen = false;
        return;
      }
      if (this.isSuccessModalOpen) {
        this.isSuccessModalOpen = false;
        return;
      }
      if (this.isMobileCheckoutOpen) {
        this.isMobileCheckoutOpen = false;
        return;
      }
      if (this.isMobileCartOpen) {
        this.isMobileCartOpen = false;
        return;
      }
    }

    // Capture Barcode Laser Scanner stream
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastKeyTime;
    this.lastKeyTime = currentTime;

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length >= 3) {
        const scannedCode = this.barcodeBuffer.trim();
        this.barcodeBuffer = '';
        this.onBarcodeScanned(scannedCode);
        if (isInputFocused && target.id !== 'barcodeSearchInput') {
          event.preventDefault();
        }
        return;
      } else {
        this.barcodeBuffer = '';
      }
    } else if (event.key.length === 1) {
      if (timeDiff > 60 && this.barcodeBuffer.length > 0) {
        this.barcodeBuffer = '';
      }
      this.barcodeBuffer += event.key;

      clearTimeout(this.laserScanTimeout);
      this.laserScanTimeout = setTimeout(() => {
        if (this.barcodeBuffer.length >= 3 && !isInputFocused) {
          this.onBarcodeScanned(this.barcodeBuffer.trim());
        }
        this.barcodeBuffer = '';
      }, 100);
    }
  }

  // ── Weighed / Scale Barcode Parser (EAN-13 Prefix 20-24) ────────────────────

  parseScaleBarcode(barcode: string): { itemCode: string; weight: number } | null {
    if (
      barcode &&
      barcode.length === 13 &&
      (barcode.startsWith('20') ||
        barcode.startsWith('21') ||
        barcode.startsWith('22') ||
        barcode.startsWith('23') ||
        barcode.startsWith('24'))
    ) {
      const itemCodeDigits = barcode.substring(2, 7);
      const weightDigits = barcode.substring(7, 12);
      const weightInKg = parseFloat(weightDigits) / 1000.0;
      if (!isNaN(weightInKg) && weightInKg > 0) {
        return {
          itemCode: itemCodeDigits,
          weight: weightInKg
        };
      }
    }
    return null;
  }

  onBarcodeScanned(barcode: string): void {
    if (!barcode || !this.selectedWarehouseId) {
      if (!this.selectedWarehouseId) {
        this.toastr.warning(this.translate.instant('quickSale.warehouseRequiredFirst'));
      }
      return;
    }

    this.isLaserScanning = true;
    setTimeout(() => (this.isLaserScanning = false), 600);

    // 1. Check if it is a weighed scale barcode (EAN-13 prefix 20/21/22/23/24)
    const scaleParsed = this.parseScaleBarcode(barcode);
    if (scaleParsed) {
      const matchedItem = this.availableItems.find(
        i =>
          (i.code && i.code.includes(scaleParsed.itemCode)) ||
          (i.barcode && i.barcode.includes(scaleParsed.itemCode))
      );
      if (matchedItem) {
        this.addScaleItemToCart(matchedItem, scaleParsed.weight);
        this.playAudio('beep');
        this.toastr.success(
          this.translate.instant('quickSale.scaleBarcodeDetected', { weight: scaleParsed.weight })
        );
        return;
      }
    }

    // 2. Standard direct barcode / item code lookup
    const cleanCode = barcode.toLowerCase().trim();
    const matchedItem = this.availableItems.find(
      i =>
        (i.barcode && i.barcode.toLowerCase() === cleanCode) ||
        (i.code && i.code.toLowerCase() === cleanCode)
    );

    if (matchedItem) {
      this.addToCart(matchedItem);
      this.playAudio('beep');
    } else {
      this.playAudio('warning');
      this.toastr.info(`صنف غير مسجل بالباركود: ${barcode}`);
    }
  }

  addScaleItemToCart(item: QuickSaleItemResponse, weight: number): void {
    if (!item.isActive || item.availableQuantity <= 0) {
      this.playAudio('warning');
      this.toastr.warning(
        this.translate.instant('quickSale.itemOutOfStockError', {
          name: this.getItemDisplayName(item)
        })
      );
      return;
    }

    const existing = this.cart.find(c => c.itemId === item.id);
    if (existing) {
      existing.quantity += weight;
      this.recalculateLine(existing);
    } else {
      const salesFactor = item.salesUomConversionFactor || 1;
      const basePrice = item.basePrice || (salesFactor > 0 ? (item.price / salesFactor) : item.price) || item.price || 0;
      const cartItem: QuickSaleCartItem = {
        itemId: item.id,
        code: item.code,
        name: this.getItemDisplayName(item),
        quantity: weight,
        unitPrice: item.price || 0,
        basePrice: basePrice,
        discountAmount: 0,
        subtotal: (item.price || 0) * weight,
        availableQuantity: item.availableQuantity,
        salesUomId: item.salesUomId,
        salesUomName: item.salesUomName || 'كجم',
        salesUomConversionFactor: salesFactor,
        availableUoms: item.availableUoms || [],
        barcode: item.barcode
      };
      this.cart.push(cartItem);
      this.selectedCartIndex = this.cart.length - 1;
    }
    this.updatePaidAmountDefault();
  }

  onSearchKeyEnter(): void {
    if (!this.searchQuery.trim()) return;
    const q = this.searchQuery.toLowerCase().trim();

    const exactMatch = this.availableItems.find(
      i => (i.code && i.code.toLowerCase() === q) || (i.barcode && i.barcode.toLowerCase() === q)
    );
    if (exactMatch) {
      this.addToCart(exactMatch);
      this.clearSearch();
    } else if (this.filteredItems.length === 1) {
      this.addToCart(this.filteredItems[0]);
      this.clearSearch();
    }
  }

  // ── Camera Barcode Scanner ─────────────────────────────────────────────────

  startCameraScan(): void {
    this.isCameraScannerOpen = true;
    setTimeout(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            this.cameraStream = stream;
            if (this.cameraVideoElement && this.cameraVideoElement.nativeElement) {
              this.cameraVideoElement.nativeElement.srcObject = stream;
              this.cameraVideoElement.nativeElement.play();
              this.initBarcodeDetector();
            }
          })
          .catch(() => {
            this.toastr.warning('تعذر الوصول لكاميرا الجهاز');
            this.isCameraScannerOpen = false;
          });
      }
    }, 100);
  }

  private initBarcodeDetector(): void {
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e']
        });
        this.cameraScanInterval = setInterval(async () => {
          if (this.cameraVideoElement && this.cameraVideoElement.nativeElement) {
            try {
              const barcodes = await detector.detect(this.cameraVideoElement.nativeElement);
              if (barcodes && barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                this.stopCameraScan();
                this.onBarcodeScanned(code);
              }
            } catch {
              // Frame parse skip
            }
          }
        }, 250);
      } catch {
        // Fallback
      }
    }
  }

  stopCameraScan(): void {
    this.isCameraScannerOpen = false;
    if (this.cameraScanInterval) {
      clearInterval(this.cameraScanInterval);
      this.cameraScanInterval = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  // ── On-Screen Touch Numpad (Desktop / Touch Screen Mode) ───────────────────

  toggleTouchNumpad(): void {
    this.showTouchNumpad = !this.showTouchNumpad;
    if (this.showTouchNumpad && this.cart.length > 0 && this.selectedCartIndex < 0) {
      this.selectedCartIndex = this.cart.length - 1;
    }
  }

  selectCartItemForNumpad(index: number): void {
    this.selectedCartIndex = index;
    this.numpadBuffer = '';
  }

  setNumpadTarget(target: 'qty' | 'disc' | 'price'): void {
    this.numpadTarget = target;
    this.numpadBuffer = '';
  }

  handleNumpadKey(key: string): void {
    if (this.selectedCartIndex < 0 || this.selectedCartIndex >= this.cart.length) {
      if (this.cart.length > 0) {
        this.selectedCartIndex = this.cart.length - 1;
      } else {
        return;
      }
    }

    const item = this.cart[this.selectedCartIndex];

    if (key === 'backspace') {
      if (this.numpadBuffer.length > 0) {
        this.numpadBuffer = this.numpadBuffer.slice(0, -1);
      }
      const val = parseFloat(this.numpadBuffer) || 0;
      this.applyNumpadValue(item, val);
      return;
    }

    if (key === '+1') {
      this.updateQuantity(item, 1);
      return;
    }

    if (key === '-1') {
      this.updateQuantity(item, -1);
      return;
    }

    if (key === '+5') {
      this.updateQuantity(item, 5);
      return;
    }

    if (key === '.' && this.numpadBuffer.includes('.')) {
      return;
    }

    this.numpadBuffer += key;
    const val = parseFloat(this.numpadBuffer);
    if (!isNaN(val)) {
      this.applyNumpadValue(item, val);
    }
  }

  private applyNumpadValue(item: QuickSaleCartItem, val: number): void {
    if (this.numpadTarget === 'qty') {
      if (val > item.availableQuantity) {
        this.toastr.warning(
          this.translate.instant('quickSale.maxStockExceeded', {
            stock: item.availableQuantity,
            uom: item.salesUomName || ''
          })
        );
        return;
      }
      item.quantity = val <= 0 ? 1 : val;
    } else if (this.numpadTarget === 'disc') {
      item.discountAmount = val;
      const maxDiscount = item.quantity * item.unitPrice;
      if (item.discountAmount > maxDiscount) {
        item.discountAmount = maxDiscount;
      }
    } else if (this.numpadTarget === 'price') {
      item.unitPrice = val;
    }
    this.recalculateLine(item);
    this.updatePaidAmountDefault();
    this.playAudio('beep');
  }

  // ── Data Loading ───────────────────────────────────────────────────────────

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
      }).then(result => {
        if (result.isConfirmed) {
          this.cart = [];
          this.selectedWarehouseId = newId;
          this.selectedCartIndex = -1;
          this.updatePaidAmountDefault();
          if (newId) {
            this.loadItemsForWarehouse(newId);
          } else {
            this.availableItems = [];
            this.filteredItems = [];
          }
        } else {
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
      result = result.filter(
        item =>
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

  // ── Cart Operations ────────────────────────────────────────────────────────

  addToCart(item: QuickSaleItemResponse): void {
    if (!item.isActive) {
      return;
    }

    if (item.availableQuantity <= 0) {
      this.playAudio('warning');
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
        this.playAudio('warning');
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
      this.selectedCartIndex = this.cart.indexOf(existing);
      this.playAudio('beep');
    } else {
      const salesFactor = item.salesUomConversionFactor || 1;
      const basePrice = item.basePrice || (salesFactor > 0 ? (item.price / salesFactor) : item.price) || item.price || 0;
      const cartItem: QuickSaleCartItem = {
        itemId: item.id,
        code: item.code,
        name: this.getItemDisplayName(item),
        quantity: 1,
        unitPrice: item.price || 0,
        basePrice: basePrice,
        discountAmount: 0,
        subtotal: item.price || 0,
        availableQuantity: item.availableQuantity,
        salesUomId: item.salesUomId,
        salesUomName: item.salesUomName,
        salesUomConversionFactor: salesFactor,
        availableUoms: item.availableUoms || [],
        barcode: item.barcode
      };
      this.cart.push(cartItem);
      this.selectedCartIndex = this.cart.length - 1;
      this.playAudio('beep');
    }
    this.updatePaidAmountDefault();
  }

  onItemUomChange(item: QuickSaleCartItem, uomIdValue: any): void {
    const uomId = Number(uomIdValue);
    if (!item.availableUoms || item.availableUoms.length === 0) return;

    const targetUom = item.availableUoms.find(u => u.id === uomId);
    if (!targetUom) return;

    item.salesUomId = targetUom.id;
    item.salesUomName = targetUom.name;
    item.salesUomConversionFactor = targetUom.conversionFactor > 0 ? targetUom.conversionFactor : 1;

    // Dynamically calculate unit price: UnitPrice = BasePrice * Factor
    const newUnitPrice = Number((item.basePrice * item.salesUomConversionFactor).toFixed(2));
    item.unitPrice = newUnitPrice;
    this.recalculateLine(item);
    this.updatePaidAmountDefault();
    this.playAudio('beep');
    this.toastr.info(
      this.isRtl
        ? `تم تحويل الوحدة إلى: ${targetUom.name} (السعر: ${newUnitPrice.toFixed(2)} ج.م)`
        : `Unit changed to: ${targetUom.name} (Price: ${newUnitPrice.toFixed(2)})`
    );
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.playAudio('remove');
    if (this.selectedCartIndex >= this.cart.length) {
      this.selectedCartIndex = this.cart.length - 1;
    }
    this.updatePaidAmountDefault();
    if (this.cart.length === 0) {
      this.isMobileCartOpen = false;
      this.isMobileCheckoutOpen = false;
    }
  }

  updateQuantity(item: QuickSaleCartItem, change: number): void {
    if (change > 0 && item.quantity + change > item.availableQuantity) {
      this.playAudio('warning');
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
        this.removeFromCart(idx);
      }
    } else {
      this.recalculateLine(item);
      this.playAudio('beep');
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
    return this.cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }

  get totalDiscount(): number {
    return this.cart.reduce((sum, i) => sum + (i.discountAmount || 0), 0);
  }

  get grandTotal(): number {
    return Math.max(0, this.totalSubtotal - this.totalDiscount);
  }

  get totalItemsCount(): number {
    return this.cart.reduce((sum, i) => sum + i.quantity, 0);
  }

  get changeDue(): number {
    if (this.paymentMethod === 'credit') return 0;
    return Math.max(0, (this.paidAmount || 0) - this.grandTotal);
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

  selectQuickCash(amount: number): void {
    this.paidAmount = amount;
  }

  addQuickCash(extra: number): void {
    this.paidAmount = (this.paidAmount || 0) + extra;
  }

  setExactCash(): void {
    this.paidAmount = this.grandTotal;
  }

  clearCart(): void {
    this.cart = [];
    this.paidAmount = 0;
    this.selectedCartIndex = -1;
    this.isMobileCartOpen = false;
    this.isMobileCheckoutOpen = false;
  }

  // ── Mobile / Handheld Drawer Controls ─────────────────────────────────────

  openMobileCart(): void {
    if (this.cart.length > 0) {
      this.isMobileCartOpen = true;
    }
  }

  closeMobileCart(): void {
    this.isMobileCartOpen = false;
  }

  openCheckout(): void {
    if (this.cart.length === 0) {
      this.toastr.warning(this.translate.instant('quickSale.cartEmptyError'));
      return;
    }
    this.isMobileCartOpen = false;
    this.isMobileCheckoutOpen = true;
    this.updatePaidAmountDefault();
    setTimeout(() => {
      if (this.paidAmountInputElement) {
        this.paidAmountInputElement.nativeElement.select();
      }
    }, 150);
  }

  closeCheckout(): void {
    this.isMobileCheckoutOpen = false;
  }

  focusSearch(): void {
    if (this.searchInputElement) {
      this.searchInputElement.nativeElement.focus();
      this.searchInputElement.nativeElement.select();
    }
  }

  // ── Shift & Cash Drawer Management ────────────────────────────────────────

  private initShift(): void {
    const authData = this.authService.getAuthResponse();
    const cashierName = authData
      ? [authData.firstName, authData.lastName].filter(Boolean).join(' ') || authData.email || 'كاشير'
      : 'كاشير';

    const savedShift = localStorage.getItem('pos_active_shift');
    if (savedShift) {
      try {
        const parsed = JSON.parse(savedShift);
        this.shiftInfo = {
          ...parsed,
          startTime: new Date(parsed.startTime)
        };
        return;
      } catch {
        // Fallback to fresh shift
      }
    }

    this.shiftInfo = {
      cashierName: cashierName,
      startTime: new Date(),
      totalSalesCount: 0,
      totalCashSales: 0,
      totalNonCashSales: 0,
      grandTotal: 0
    };
    this.saveShift();
  }

  private saveShift(): void {
    localStorage.setItem('pos_active_shift', JSON.stringify(this.shiftInfo));
  }

  private updateShiftWithSale(amount: number, method: string): void {
    this.shiftInfo.totalSalesCount += 1;
    if (method === 'cash') {
      this.shiftInfo.totalCashSales += amount;
    } else {
      this.shiftInfo.totalNonCashSales += amount;
    }
    this.shiftInfo.grandTotal += amount;
    this.saveShift();
  }

  openShiftModal(): void {
    this.isShiftModalOpen = true;
  }

  closeShiftModal(): void {
    this.isShiftModalOpen = false;
  }

  closeShiftAndReset(): void {
    Swal.fire({
      title: 'إغلاق الوردية الحالية',
      text: 'هل أنت متأكد من رغبتك في تقفيل الوردية الحالية وبدء وردية جديدة؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، تقفيل الوردية',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    }).then(result => {
      if (result.isConfirmed) {
        const authData = this.authService.getAuthResponse();
        const cashierName = authData
          ? [authData.firstName, authData.lastName].filter(Boolean).join(' ') || authData.email || 'كاشير'
          : 'كاشير';
        this.shiftInfo = {
          cashierName: cashierName,
          startTime: new Date(),
          totalSalesCount: 0,
          totalCashSales: 0,
          totalNonCashSales: 0,
          grandTotal: 0
        };
        this.saveShift();
        this.isShiftModalOpen = false;
        this.toastr.success('تم إغلاق الوردية وبدء وردية جديدة بنجاح');
      }
    });
  }

  // ── Hold & Resume Orders ───────────────────────────────────────────────────

  loadHeldOrders(): void {
    const saved = localStorage.getItem('pos_held_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.heldOrders = parsed.map((o: any) => ({
          ...o,
          heldAt: new Date(o.heldAt)
        }));
      } catch {
        this.heldOrders = [];
      }
    }
  }

  saveHeldOrders(): void {
    localStorage.setItem('pos_held_orders', JSON.stringify(this.heldOrders));
  }

  holdCurrentOrder(): void {
    if (this.cart.length === 0) {
      this.toastr.warning(this.translate.instant('quickSale.cartEmptyError'));
      return;
    }

    const customerName =
      this.customers.find(c => c.id === this.selectedCustomerId)?.name || 'عميل نقدي';
    const warehouseName =
      this.warehouses.find(w => w.id === this.selectedWarehouseId)?.name || 'المخزن الافتراضي';

    const orderToHold: HeldOrder = {
      id: 'HOLD-' + Date.now().toString().slice(-6),
      heldAt: new Date(),
      customerId: this.selectedCustomerId,
      customerName: customerName,
      warehouseId: this.selectedWarehouseId,
      warehouseName: warehouseName,
      cart: [...this.cart],
      notes: this.notes,
      paymentMethod: this.paymentMethod,
      paidAmount: this.paidAmount,
      totalAmount: this.grandTotal
    };

    this.heldOrders.unshift(orderToHold);
    this.saveHeldOrders();

    this.cart = [];
    this.notes = '';
    this.selectedCartIndex = -1;
    this.updatePaidAmountDefault();
    this.isMobileCartOpen = false;
    this.isMobileCheckoutOpen = false;

    this.playAudio('success');
    this.toastr.success(this.translate.instant('quickSale.holdOrderSuccess'));
  }

  resumeHeldOrder(order: HeldOrder): void {
    if (this.cart.length > 0) {
      Swal.fire({
        title: 'استبدال السلة الحالية',
        text: 'يوجد أصناف في السلة الحالية. هل ترغب في استبدالها بالفاتورة المعلقة؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، استرجاع',
        cancelButtonText: 'إلغاء'
      }).then(res => {
        if (res.isConfirmed) {
          this.applyResumedOrder(order);
        }
      });
    } else {
      this.applyResumedOrder(order);
    }
  }

  private applyResumedOrder(order: HeldOrder): void {
    this.cart = [...order.cart];
    this.selectedCustomerId = order.customerId;
    this.selectedWarehouseId = order.warehouseId;
    this.notes = order.notes;
    this.paymentMethod = order.paymentMethod;
    this.paidAmount = order.paidAmount;
    this.selectedCartIndex = this.cart.length - 1;

    this.heldOrders = this.heldOrders.filter(o => o.id !== order.id);
    this.saveHeldOrders();
    this.isHeldOrdersModalOpen = false;

    this.playAudio('success');
    this.toastr.success(this.translate.instant('quickSale.resumeOrderSuccess'));
  }

  discardHeldOrder(orderId: string, event: Event): void {
    event.stopPropagation();
    this.heldOrders = this.heldOrders.filter(o => o.id !== orderId);
    this.saveHeldOrders();
    this.toastr.info('تم حذف الفاتورة المعلقة');
  }

  // ── Quick Customer Creation ────────────────────────────────────────────────

  openQuickCustomerModal(): void {
    this.isQuickCustomerModalOpen = true;
  }

  onCustomerCreated(newCustomer: BusinessPartnerResponse): void {
    const mappedCustomer: SalesRepCustomerResponse = {
      id: newCustomer.id,
      code: newCustomer.code || `CUST-${newCustomer.id}`,
      name: newCustomer.name || newCustomer.aName || newCustomer.eName || 'عميل جديد',
      phone: newCustomer.phone,
      isPrimary: false,
      assignmentDate: new Date().toISOString()
    };
    this.customers.unshift(mappedCustomer);
    this.selectedCustomerId = mappedCustomer.id;
    this.isQuickCustomerModalOpen = false;
    this.playAudio('success');
    this.toastr.success(`تم إنشاء العميل ${mappedCustomer.name} واختياره بنجاح`);
  }

  // ── Fullscreen & Navigation ────────────────────────────────────────────────

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => (this.isFullscreen = true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => (this.isFullscreen = false));
      }
    }
  }

  exitToDashboard(): void {
    if (!this.canExitToDashboard) {
      this.playAudio('warning');
      this.toastr.warning(
        this.isRtl
          ? 'تم تقييد حساب الكاشير لشاشة نقطة البيع فقط ولا يمكن الخروج للوحة التحكم'
          : 'Cashier account is restricted to POS Terminal only'
      );
      return;
    }
    this.router.navigate(['/']);
  }

  // ── Submit Sale / Checkout ─────────────────────────────────────────────────

  submitQuickCashSale(): void {
    this.submitSale(true);
  }

  submitSale(instantCash: boolean = false): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.selectedCustomerId) {
      const msg = this.translate.instant('quickSale.customerRequired');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      this.playAudio('warning');
      return;
    }
    if (!this.selectedWarehouseId) {
      const msg = this.translate.instant('quickSale.warehouseRequired');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      this.playAudio('warning');
      return;
    }
    if (this.cart.length === 0) {
      const msg = this.translate.instant('quickSale.cartEmptyError');
      this.errorMessage = msg;
      this.toastr.warning(msg);
      this.playAudio('warning');
      return;
    }

    const zeroPriced = this.cart.find(c => c.unitPrice <= 0);
    if (zeroPriced) {
      const msg = this.translate.instant('quickSale.zeroPriceError', {
        name: zeroPriced.name
      });
      this.errorMessage = msg;
      this.toastr.warning(msg);
      this.playAudio('warning');
      return;
    }

    const saleTotal = this.grandTotal;
    const saleSubtotal = this.totalSubtotal;
    const saleDiscount = this.totalDiscount;
    const salePaid = instantCash ? saleTotal : 0;
    const salePaymentMethod = instantCash ? 'cash' : 'credit';
    const saleChange = 0;
    const saleNotes = this.notes;
    const currentLines = this.cart.map(c => ({
      name: c.name,
      code: c.code,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      discountAmount: c.discountAmount,
      subtotal: c.subtotal,
      uomName: c.salesUomName
    }));

    const customerName =
      this.customers.find(c => c.id === this.selectedCustomerId)?.name ?? 'عميل نقدي';
    const warehouseName =
      this.warehouses.find(w => w.id === this.selectedWarehouseId)?.name ?? 'المخزن';

    const payload = {
      businessPartnerId: this.selectedCustomerId,
      warehouseId: this.selectedWarehouseId,
      paymentMethod: salePaymentMethod,
      paidAmount: salePaid,
      notes: this.notes,
      lines: this.cart.map(c => ({
        itemId: c.itemId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discountAmount: c.discountAmount,
        uomId: c.salesUomId,
        uomConversionFactor: c.salesUomConversionFactor || 1
      }))
    };

    this.submitting = true;
    this.salesRepService.quickSale(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        const invoiceCode = res.code || `INV-${res.id}`;
        
        const newInvoiceRecord: RecentInvoiceItem = {
          id: res.id,
          code: invoiceCode,
          customerName: customerName,
          totalAmount: res.totalAmount || saleTotal,
          date: new Date(),
          linesCount: currentLines.length,
          paymentMethod: salePaymentMethod,
          paymentStatus: instantCash ? 'FullyPaid' : ((res.paidStatus || res.paymentStatus || 'Unpaid') as any),
          remainingAmount: instantCash ? 0 : (res.remainingAmount || saleTotal),
          businessPartnerId: this.selectedCustomerId || res.businessPartnerId
        };

        this.lastCreatedInvoice = newInvoiceRecord;
        this.recentInvoices.unshift(newInvoiceRecord);
        if (this.recentInvoices.length > 10) {
          this.recentInvoices.pop();
        }

        this.lastSaleReceiptData = {
          invoiceId: res.id,
          invoiceCode: invoiceCode,
          customerName: customerName,
          warehouseName: warehouseName,
          cashierName: this.shiftInfo.cashierName || 'كاشير',
          date: new Date(),
          paymentMethod: salePaymentMethod,
          subtotal: saleSubtotal,
          discount: saleDiscount,
          grandTotal: saleTotal,
          paidAmount: salePaid,
          changeDue: saleChange,
          notes: saleNotes,
          lines: currentLines
        };

        this.cart = [];
        this.notes = '';
        this.selectedCartIndex = -1;
        this.isMobileCartOpen = false;
        this.isMobileCheckoutOpen = false;

        if (this.selectedWarehouseId) {
          this.loadItemsForWarehouse(this.selectedWarehouseId);
        }

        if (instantCash) {
          this.updateShiftWithSale(saleTotal, 'cash');
          const msg = this.translate.instant('quickSale.saleSuccess', {
            code: invoiceCode
          });
          this.successMessage = msg;
          this.toastr.success(msg);
          this.playAudio('success');
          this.isSuccessModalOpen = true;
          this.triggerAutoPrintIfEnabled(res.id, invoiceCode);
        } else {
          // Open the approved Payment Modal for this created invoice
          this.selectedInvoiceForPayment = res;
          this.isPaymentModalOpen = true;
        }
      },
      error: (err: any) => {
        this.submitting = false;
        this.playAudio('warning');
        const msg =
          err?.error?.detail ||
          err?.error?.message ||
          this.translate.instant('errors.generic');
        this.errorMessage = msg;
        this.toastr.error(msg);
      }
    });
  }

  // ── POS Payment Modal Handlers ───────────────────────────────────────────────

  openPaymentModalForInvoice(inv: any): void {
    this.selectedInvoiceForPayment = inv;
    this.isPaymentModalOpen = true;
  }

  onPosPaymentSaved(): void {
    this.isPaymentModalOpen = false;
    this.playAudio('success');
    this.toastr.success(this.translate.instant('quickSale.paymentCompleted'));

    if (this.selectedInvoiceForPayment) {
      const invId = this.selectedInvoiceForPayment.id;
      const invCode = this.selectedInvoiceForPayment.code || `INV-${invId}`;
      const total = Number(this.selectedInvoiceForPayment.totalAmount) || Number(this.selectedInvoiceForPayment.remainingAmount) || 0;

      // Update in recent invoices
      const rec = this.recentInvoices.find(r => r.id === invId);
      if (rec) {
        rec.paymentStatus = 'FullyPaid';
        rec.remainingAmount = 0;
      }

      // Update shift
      this.updateShiftWithSale(total, 'cash');

      // If viewing in details modal, reload it
      if (this.isInvoiceDetailsModalOpen && this.viewingInvoice?.id === invId) {
        this.viewInvoiceDetails(invId);
      } else {
        // Show success modal & auto-print
        this.isSuccessModalOpen = true;
        this.triggerAutoPrintIfEnabled(invId, invCode);
      }
    }
  }

  onPaymentModalClosed(): void {
    this.isPaymentModalOpen = false;
    if (this.selectedInvoiceForPayment && !this.isInvoiceDetailsModalOpen) {
      const code = this.selectedInvoiceForPayment.code || `INV-${this.selectedInvoiceForPayment.id}`;
      this.toastr.info(this.translate.instant('quickSale.invoiceCreatedPendingPayment', { code }));
      this.isSuccessModalOpen = true;
    }
  }

  triggerAutoPrintIfEnabled(invoiceId: number, invoiceCode: string): void {
    if (this.activePrintMethodsCount === 1 && this.posPrintPreferences.autoPreviewSingleMethod) {
      const single = this.singleActivePrintMethod;
      if (single === '80mm') {
        this.openReceiptPrint(invoiceId, invoiceCode);
      } else if (single === 'a4') {
        this.openStandardPrint(invoiceId, invoiceCode);
      } else if (single === '58mm') {
        this.printDirectThermal('58mm');
      }
    }
  }

  // ── Printing Methods ───────────────────────────────────────────────────────

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

  printDirectThermal(format: '58mm' | '80mm'): void {
    this.receiptPrintFormat = format;
    setTimeout(() => {
      window.print();
    }, 100);
  }

  closePrintPreview(): void {
    this.isPrintPreviewOpen = false;
    if (this.pdfBlobUrl) {
      window.URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  // ── POS Print Preferences & Settings ────────────────────────────────────────

  savingPrintPreferences: boolean = false;

  loadPrintPreferences(): void {
    // 1. Immediate local cache fallback
    const saved = localStorage.getItem('pos_print_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.posPrintPreferences = {
          enableThermal58: parsed.enableThermal58 ?? true,
          enableThermal80: parsed.enableThermal80 ?? true,
          enableA4: parsed.enableA4 ?? true,
          autoPreviewSingleMethod: parsed.autoPreviewSingleMethod ?? true
        };
      } catch {
        // default
      }
    }

    // 2. Fetch official configuration from Database
    this.printSettingService.getSettings().subscribe({
      next: (setting) => {
        if (setting) {
          this.posPrintPreferences = {
            enableThermal58: setting.posEnableThermal58 ?? true,
            enableThermal80: setting.posEnableThermal80 ?? true,
            enableA4: setting.posEnableA4 ?? true,
            autoPreviewSingleMethod: setting.posAutoPreviewSingleMethod ?? true
          };
          localStorage.setItem('pos_print_preferences', JSON.stringify(this.posPrintPreferences));
        }
      },
      error: () => {
        // Continue with local cache fallback
      }
    });
  }

  savePrintPreferences(): void {
    if (
      !this.posPrintPreferences.enableThermal58 &&
      !this.posPrintPreferences.enableThermal80 &&
      !this.posPrintPreferences.enableA4
    ) {
      this.playAudio('warning');
      this.toastr.warning(this.translate.instant('quickSale.atLeastOneMethodWarning'));
      return;
    }

    // Save to local cache for instant UI feedback
    localStorage.setItem('pos_print_preferences', JSON.stringify(this.posPrintPreferences));

    // Persist to Database
    this.savingPrintPreferences = true;
    this.printSettingService.getSettings().subscribe({
      next: (currentSetting) => {
        const payload: PrintSettingRequest = {
          ...currentSetting,
          posEnableThermal58: this.posPrintPreferences.enableThermal58,
          posEnableThermal80: this.posPrintPreferences.enableThermal80,
          posEnableA4: this.posPrintPreferences.enableA4,
          posAutoPreviewSingleMethod: this.posPrintPreferences.autoPreviewSingleMethod
        };

        this.printSettingService.updateSettings(payload).subscribe({
          next: () => {
            this.savingPrintPreferences = false;
            this.playAudio('success');
            this.toastr.success(this.translate.instant('quickSale.printSettingsSaved'));
            this.isPrintSettingsModalOpen = false;
          },
          error: () => {
            this.savingPrintPreferences = false;
            this.playAudio('success');
            this.toastr.success(this.translate.instant('quickSale.printSettingsSaved'));
            this.isPrintSettingsModalOpen = false;
          }
        });
      },
      error: () => {
        this.savingPrintPreferences = false;
        this.playAudio('success');
        this.toastr.success(this.translate.instant('quickSale.printSettingsSaved'));
        this.isPrintSettingsModalOpen = false;
      }
    });
  }

  get activePrintMethodsCount(): number {
    let count = 0;
    if (this.posPrintPreferences.enableThermal58) count++;
    if (this.posPrintPreferences.enableThermal80) count++;
    if (this.posPrintPreferences.enableA4) count++;
    return count;
  }

  get singleActivePrintMethod(): '58mm' | '80mm' | 'a4' | null {
    if (this.activePrintMethodsCount !== 1) return null;
    if (this.posPrintPreferences.enableThermal58) return '58mm';
    if (this.posPrintPreferences.enableThermal80) return '80mm';
    if (this.posPrintPreferences.enableA4) return 'a4';
    return null;
  }

  openPrintSettingsModal(): void {
    this.loadPrintPreferences();
    this.isPrintSettingsModalOpen = true;
  }

  closePrintSettingsModal(): void {
    this.isPrintSettingsModalOpen = false;
  }

  // ── Dedicated POS Invoice Details Modal ─────────────────────────────────────

  viewInvoiceDetails(invoiceId: number): void {
    this.isInvoiceDetailsModalOpen = true;
    this.loadingViewingInvoice = true;
    this.viewingInvoice = null;

    this.invoiceService.get(invoiceId, 'sales').subscribe({
      next: (res: InvoiceResponse) => {
        this.viewingInvoice = res;
        this.loadingViewingInvoice = false;
      },
      error: () => {
        this.loadingViewingInvoice = false;
        this.toastr.error(this.translate.instant('errors.generic'));
      }
    });
  }

  closeInvoiceDetailsModal(): void {
    this.isInvoiceDetailsModalOpen = false;
    this.viewingInvoice = null;
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }

  startNewSale(): void {
    this.isSuccessModalOpen = false;
    this.isInvoiceDetailsModalOpen = false;
    this.cart = [];
    this.notes = '';
    this.selectedCartIndex = -1;
    this.updatePaidAmountDefault();
    this.focusSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterItems();
    this.focusSearch();
  }

  getItemQuantityInCart(itemId: number): number {
    const item = this.cart.find(c => c.itemId === itemId);
    return item ? item.quantity : 0;
  }
}
