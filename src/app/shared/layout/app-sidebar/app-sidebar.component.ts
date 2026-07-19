import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';

type NavItem = {
  name: string;
  translationKey?: string;
  icon?: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; translationKey?: string; path?: string; pro?: boolean; new?: boolean; icon?: string; subItems?: any[] }[];
};

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent,
    TranslateModule
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {

  // Main nav items
  navItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" stroke="currentColor"></path></svg>`,
      name: "Home Page",
      translationKey: "homePage.title",
      path: "/",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
      name: "Dashboard",
      translationKey: "pages.dashboard",
      path: "/dashboard"
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
      name: "User Profile",
      translationKey: "pages.userProfile",
      path: "/profile",
    },
    {
      name: "Administration",
      translationKey: "pages.administration",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16 15C16 14.4477 15.5523 14 15 14H9C8.44772 14 8 14.4477 8 15V16C8 17.6569 9.34315 19 11 19H13C14.6569 19 16 17.6569 16 16V15ZM6 15C6 13.3431 7.34315 12 9 12H15C16.6569 12 18 13.3431 18 15V16C18 18.7614 15.7614 21 13 21H11C8.23858 21 6 18.7614 6 16V15Z" fill="currentColor"></path></svg>`,
      subItems: [
        {
          name: "Users Management", translationKey: "pages.usersManagement",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
          subItems: [
            { name: "Users", translationKey: "pages.users", path: "/administration/users" },
            { name: "Roles", translationKey: "pages.roles", path: "/administration/roles" }
          ]
        },
        {
          name: "Configuration", translationKey: "pages.configuration",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
          subItems: [
            { name: "Company Settings", translationKey: "pages.companySettings", path: "/configuration/company-settings" },
            { name: "Inventory Settings", translationKey: "pages.inventorySettings", path: "/configuration/inventory-settings" },
            { name: "Invoice Settings", translationKey: "pages.invoiceSettings", path: "/configuration/invoice-settings" }
          ]
        },
        {
          name: "Master Data", translationKey: "pages.masterData",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>`,
          subItems: [
            { name: "Business Partners", translationKey: "pages.businessPartners", path: "/master-data/business-partners" },
            { name: "Invoice Cost Elements", translationKey: "pages.invoiceCostElements", path: "/inventory/invoice-cost-elements" }
          ]
        }
      ],
    },
    {
      name: "Inventory",
      translationKey: "pages.inventory",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 6V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V6H4ZM2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V19C22 21.2091 20.2091 23 18 23H6C3.79086 23 2 21.2091 2 19V6ZM7 9C7 8.44772 7.44772 8 8 8H16C16.5523 8 17 8.44772 17 9C17 9.55228 16.5523 10 16 10H8C7.44772 10 7 9.55228 7 9ZM7 13C7 12.4477 7.44772 12 8 12H12C12.5523 12 13 12.4477 13 13C13 13.5523 12.5523 14 12 14H8C7.44772 14 7 13.5523 7 13Z" fill="currentColor"></path></svg>`,
      subItems: [
        { name: "Item Properties", translationKey: "pages.itemProperties", path: "/inventory/item-properties" },
        { name: "Unit of Measures", translationKey: "pages.UnitOfMeasure.Title", path: "/inventory/unit-of-measure" },
        { name: "Item Groups", translationKey: "pages.itemGroups", path: "/inventory/item-groups" },
        { name: "Warehouses", translationKey: "warehouses.title", path: "/inventory/warehouses" },
        { name: "Locations", translationKey: "locations.title", path: "/inventory/locations" },
        { name: "Items", translationKey: "pages.items", path: "/inventory/items" },
        { name: "Stock Transfers", translationKey: "pages.stockTransfers", path: "/inventory/stock-transfers" },
        { name: "Stock Adjustments", translationKey: "pages.stockAdjustments", path: "/inventory/stock-adjustments" },
        { name: "Stock Issues", translationKey: "stockVouchers.issues.title", path: "/inventory/stock-issues" },
        { name: "Stock Receipts", translationKey: "stockVouchers.receipts.title", path: "/inventory/stock-receipts" },
        { name: "Inventory Counts", translationKey: "inventoryCounts.title", path: "/inventory/inventory-counts" },
        { name: "Stock Transactions", translationKey: "pages.stockTransactions", path: "/inventory/stock-transactions" }
      ],
    },
    {
      name: "Sales",
      translationKey: "pages.sales",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C1.44772 2 1 2.44772 1 3V21C1 22.1046 1.89543 23 3 23H21C22.1046 23 23 22.1046 23 21V3C23 2.44772 22.5523 2 22 2C21.4477 2 21 2.44772 21 3V21H3V3C3 2.44772 2.55228 2 2 2ZM5 5C4.44772 5 4 5.44772 4 6V14C4 15.1046 4.89543 16 6 16H18C19.1046 16 20 15.1046 20 14V6C20 5.44772 19.5523 5 19 5C18.4477 5 18 5.44772 18 6V14H6V6C6 5.44772 5.55228 5 5 5Z" fill="currentColor"></path></svg>`,
      subItems: [
        { name: "Sales Invoices", translationKey: "salesInvoices.title", path: "/invoices/sales" },
        { name: "Sales Returns", translationKey: "salesReturns.title", path: "/sales/returns" }
      ],
    },
    {
      name: "Purchases",
      translationKey: "pages.purchases",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 2C5.08579 2 4.75 2.33579 4.75 2.75C4.75 3.16421 5.08579 3.5 5.5 3.5H6.25L7.75 14.75H19.25C19.6642 14.75 20 14.4142 20 14C20 13.5858 19.6642 13.25 19.25 13.25H8.25L7 4H5.5C5.08579 4 4.75 4.33579 4.75 4.75C4.75 5.16421 5.08579 5.5 5.5 5.5H6.75L8.25 16.75C8.75 20.5 11.75 23.5 15.5 23.5C19.25 23.5 22.25 20.5 22.75 16.75H20.75C20.25 19.5 17.75 21.5 15.5 21.5C13.25 21.5 11 19.5 10.75 16.75H8.25L9.75 22.25C10 23 10.75 23.5 11.5 23.5H19.5C20.25 23.5 21 23 21.25 22.25L22.75 16.75C23.25 12.75 20.25 9.5 16.5 9.5H13.75L12.25 1.75C12 1 11.25 0.5 10.5 0.5H2.5C1.75 0.5 1 1 0.75 1.75L2.5 16.75C3 20.5 6 23.5 9.75 23.5C13.5 23.5 16.5 20.5 17 16.75H15C14.5 19.5 12 21.5 9.75 21.5C7.5 21.5 5.25 19.5 5 16.75L3.5 2.75C3.5 2.75 3.5 2.75 3.5 2.75Z" fill="currentColor"></path></svg>`,
      subItems: [
        { name: "Purchase Orders", translationKey: "purchaseOrders.title", path: "/purchases/purchase-orders" },
        { name: "Purchase Invoices", translationKey: "purchaseInvoices.title", path: "/purchases/invoices" },
        { name: "Purchase Returns", translationKey: "purchaseReturns.title", path: "/purchases/returns" }
      ],
    },
    {
      name: "Reports",
      translationKey: "pages.reports",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 5V19H19V5H5ZM7 11H9V17H7V11ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"></path></svg>`,
      subItems: [
        { name: "Business Partner Statement", translationKey: "pages.businessPartnerStatement", path: "/reports/business-partner-statement" },
        { name: "Sales Report", translationKey: "pages.salesReport", path: "/reports/sales" },
        { name: "Purchases Report", translationKey: "pages.purchasesReport", path: "/reports/purchases" },
        { name: "Warehouse Items Stock", translationKey: "reports.warehouseStock.title", path: "/reports/warehouse-items-stock" }
      ],
    },
    // {
    //   name: "Pages",
    //   translationKey: "pages.pages",
    //   icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.50391 4.25C8.50391 3.83579 8.83969 3.5 9.25391 3.5H15.2777C15.4766 3.5 15.6674 3.57902 15.8081 3.71967L18.2807 6.19234C18.4214 6.333 18.5004 6.52376 18.5004 6.72268V16.75C18.5004 17.1642 18.1646 17.5 17.7504 17.5H16.248V17.4993H14.748V17.5H9.25391C8.83969 17.5 8.50391 17.1642 8.50391 16.75V4.25ZM14.748 19H9.25391C8.01126 19 7.00391 17.9926 7.00391 16.75V6.49854H6.24805C5.83383 6.49854 5.49805 6.83432 5.49805 7.24854V19.75C5.49805 20.1642 5.83383 20.5 6.24805 20.5H13.998C14.4123 20.5 14.748 20.1642 14.748 19.75L14.748 19ZM7.00391 4.99854V4.25C7.00391 3.00736 8.01127 2 9.25391 2H15.2777C15.8745 2 16.4468 2.23705 16.8687 2.659L19.3414 5.13168C19.7634 5.55364 20.0004 6.12594 20.0004 6.72268V16.75C20.0004 17.9926 18.9931 19 17.7504 19H16.248L16.248 19.75C16.248 20.9926 15.2407 22 13.998 22H6.24805C5.00541 22 3.99805 20.9926 3.99805 19.75V7.24854C3.99805 6.00589 5.00541 4.99854 6.24805 4.99854H7.00391Z" fill="currentColor"></path></svg>`,
    //   subItems: [
    //     { name: "Blank Page", translationKey: "pages.blankPage", path: "/blank", pro: false },
    //     { name: "404 Error", translationKey: "pages.error404", path: "/error-404", pro: false },
    //   ],
    // },
  ];
  // Others nav items
  othersItems: NavItem[] = [];

  openSubmenu: string | null = null;
  openNestedSubmenu: string | null = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    // Initial active menu setup
    setTimeout(() => {
      this.setActiveMenuFromRoute(this.router.url);
    }, 100);

    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            // this.openSubmenu = null;
            // this.savedSubMenuHeights = { ...this.subMenuHeights };
            // this.subMenuHeights = {};
            this.cdr.detectChanges();
          } else {
            // Restore saved heights when reopening
            // this.subMenuHeights = { ...this.savedSubMenuHeights };
            // this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === path;
    }
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.openNestedSubmenu = null; // Close nested when main closes
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }

  toggleNestedSubmenu(section: string, index: number, nestedIndex: number) {
    const key = `${section}-${index}-${nestedIndex}`;
    const parentKey = `${section}-${index}`;

    if (this.openNestedSubmenu === key) {
      const el = document.getElementById(key);
      const childHeight = el ? el.scrollHeight : 0;

      this.openNestedSubmenu = null;
      this.subMenuHeights[key] = 0;

      const parentEl = document.getElementById(parentKey);
      if (parentEl) {
        this.subMenuHeights[parentKey] = Math.max(0, parentEl.scrollHeight - childHeight);
      }
    } else {
      let prevChildHeight = 0;
      if (this.openNestedSubmenu && this.openNestedSubmenu.startsWith(`${section}-${index}-`)) {
        const prevEl = document.getElementById(this.openNestedSubmenu);
        if (prevEl) prevChildHeight = prevEl.scrollHeight;
        this.subMenuHeights[this.openNestedSubmenu] = 0;
      } else if (this.openNestedSubmenu) {
        this.subMenuHeights[this.openNestedSubmenu] = 0;
      }

      this.openNestedSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          const childHeight = el.scrollHeight;
          this.subMenuHeights[key] = childHeight;

          const parentEl = document.getElementById(parentKey);
          if (parentEl) {
            const baseHeight = parentEl.scrollHeight - prevChildHeight;
            this.subMenuHeights[parentKey] = baseHeight + childHeight;
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem, j) => {
            // Check for nested subItems
            if (subItem.subItems) {
              subItem.subItems.forEach((nestedItem: any) => {
                if (currentUrl === nestedItem.path || (nestedItem.path !== '/' && currentUrl.startsWith(nestedItem.path + '/'))) {
                  const parentKey = `${group.prefix}-${i}`;
                  const nestedKey = `${group.prefix}-${i}-${j}`;

                  if (this.openSubmenu === parentKey && this.openNestedSubmenu === nestedKey) {
                    return;
                  }

                  let prevChildHeight = 0;
                  if (this.openNestedSubmenu && this.openNestedSubmenu.startsWith(`${group.prefix}-${i}-`)) {
                    const prevEl = document.getElementById(this.openNestedSubmenu);
                    if (prevEl) prevChildHeight = prevEl.scrollHeight;
                  }
                  if (this.openNestedSubmenu) {
                    this.subMenuHeights[this.openNestedSubmenu] = 0;
                  }

                  this.openSubmenu = parentKey;
                  this.openNestedSubmenu = nestedKey;

                  setTimeout(() => {
                    const nestedEl = document.getElementById(nestedKey);
                    let nestedHeight = 0;
                    if (nestedEl) {
                      nestedHeight = nestedEl.scrollHeight;
                      this.subMenuHeights[nestedKey] = nestedHeight;
                    }
                    const parentEl = document.getElementById(parentKey);
                    if (parentEl) {
                      const baseHeight = parentEl.scrollHeight - prevChildHeight;
                      this.subMenuHeights[parentKey] = baseHeight + nestedHeight;
                    }
                    this.cdr.detectChanges();
                  });
                }
              });
            } else {
              if (currentUrl === subItem.path || (subItem.path !== '/' && currentUrl.startsWith(subItem.path! + '/'))) {
                const key = `${group.prefix}-${i}`;

                if (this.openSubmenu === key && !this.openNestedSubmenu) {
                  return;
                }

                if (this.openNestedSubmenu) {
                  this.subMenuHeights[this.openNestedSubmenu] = 0;
                  this.openNestedSubmenu = null;
                }

                this.openSubmenu = key;

                setTimeout(() => {
                  const el = document.getElementById(key);
                  if (el) {
                    this.subMenuHeights[key] = el.scrollHeight;
                    this.cdr.detectChanges(); // Ensure UI updates
                  }
                });
              }
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    console.log('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }


}
