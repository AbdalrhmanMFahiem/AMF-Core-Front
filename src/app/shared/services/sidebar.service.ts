import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Permissions } from '../../core/constants/permissions';

export type NavItem = {
  name: string;
  translationKey?: string;
  icon?: string;
  path?: string;
  new?: boolean;
  pro?: boolean;
  permissionKey?: string;
  aliases?: string[];
  subItems?: {
    name: string;
    translationKey?: string;
    path?: string;
    pro?: boolean;
    new?: boolean;
    icon?: string;
    subItems?: any[];
    permissionKey?: string;
    aliases?: string[];
  }[];
};

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private getSavedExpandedState(): boolean {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('app_sidebar_expanded');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return true;
  }

  private isExpandedSubject = new BehaviorSubject<boolean>(this.getSavedExpandedState());
  private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
  private isHoveredSubject = new BehaviorSubject<boolean>(false);

  navItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" stroke="currentColor"></path></svg>`,
      name: "Home Page",
      translationKey: "homePage.title",
      path: "/",
      aliases: ['الرئيسية', 'الصفحة الرئيسية', 'home', 'main']
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
      name: "Dashboard",
      translationKey: "pages.dashboard",
      path: "/dashboard",
      aliases: ['لوحة التحكم', 'داشبورد', 'ملخص النواحي', 'dashboard']
    },
    {
      name: "Administration",
      translationKey: "pages.administration",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16 15C16 14.4477 15.5523 14 15 14H9C8.44772 14 8 14.4477 8 15V16C8 17.6569 9.34315 19 11 19H13C14.6569 19 16 17.6569 16 16V15ZM6 15C6 13.3431 7.34315 12 9 12H15C16.6569 12 18 13.3431 18 15V16C18 18.7614 15.7614 21 13 21H11C8.23858 21 6 18.7614 6 16V15Z" fill="currentColor"></path></svg>`,
      aliases: ['الإدارة', 'إدارة النظام', 'التهيئة', 'administration', 'admin', 'setup'],
      subItems: [
        {
          name: "Users Management",
          translationKey: "pages.usersManagement",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
          aliases: ['إدارة المستخدمين', 'المستخدمين والصلاحيات', 'users management'],
          subItems: [
            { name: "Users", translationKey: "pages.users", path: "/administration/users", permissionKey: Permissions.GetUsers, aliases: ['مستخدم', 'مستخدمين', 'المستخدمين', 'حسابات', 'user', 'users'] },
            { name: "Roles", translationKey: "pages.roles", path: "/administration/roles", permissionKey: Permissions.GetRoles, aliases: ['أدوار', 'الأدوار', 'صلاحيات', 'الصلاحيات', 'أذونات', 'role', 'roles', 'permissions'] },
            { name: "Sales Representatives", translationKey: "pages.salesReps", path: "/administration/sales-reps", aliases: ['مندوب', 'مندوبين', 'مندوب مبيعات', 'مندوبي المبيعات', 'المندوبين', 'sales rep', 'sales reps', 'representatives'] }
          ]
        },
        {
          name: "Configuration",
          translationKey: "pages.configuration",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
          aliases: ['إعدادات', 'تهيئة', 'تكوين', 'settings', 'config'],
          subItems: [
            { name: "Company Settings", translationKey: "pages.companySettings", path: "/configuration/company-settings", permissionKey: Permissions.GetCompanySettings, aliases: ['إعدادات الشركة', 'بيانات الشركة', 'company settings', 'company profile'] },
            { name: "General Settings", translationKey: "pages.generalSettings", path: "/configuration/general-settings", permissionKey: Permissions.UpdateGeneralSettings, aliases: ['إعدادات عامة', 'الإعدادات العامة', 'general settings'] },
            { name: "Inventory Settings", translationKey: "pages.inventorySettings", path: "/configuration/inventory-settings", aliases: ['إعدادات المخزون', 'تهيئة المخازن', 'inventory settings'] },
            { name: "Document Settings", translationKey: "pages.documentSettings", path: "/configuration/document-settings", aliases: ['إعدادات المستندات', 'إعدادات الفواتير', 'document settings', 'invoice settings'] },
            { name: "Payment Settings", translationKey: "pages.paymentSettings", path: "/configuration/payment-settings", aliases: ['إعدادات الدفع', 'تهيئة السداد', 'payment settings'] },
            { name: "Print & Receipt Settings", translationKey: "printSettings.title", path: "/configurations/print-settings", permissionKey: Permissions.GetPrintSettings, aliases: ['إعدادات الطباعة', 'طباعة الفواتير', 'إعدادات الإيصال', 'print settings', 'receipt settings', 'pos receipt'] }
          ]
        }
      ],
    },
    {
      name: "Master Data",
      translationKey: "pages.masterData",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>`,
      aliases: ['البيانات الأساسية', 'بيانات رئيسية', 'master data', 'basic data'],
      subItems: [
        {
          name: "Business Partners",
          translationKey: "pages.businessPartners",
          path: "/master-data/business-partners",
          permissionKey: Permissions.GetBusinessPartners,
          aliases: [
            'عميل', 'العميل', 'عملاء', 'العملاء', 'عملاء وموردين',
            'مورد', 'المورد', 'موردين', 'الموردين', 'موردون', 'الموردون', 'زبون', 'زبائن',
            'شركاء العمل', 'شركاء الأعمال', 'شركاء', 'شركاء التداول',
            'customer', 'customers', 'vendor', 'vendors', 'supplier', 'suppliers', 'bp', 'business partner', 'partners'
          ]
        },
        {
          name: "Invoice Cost Elements",
          translationKey: "pages.invoiceCostElements",
          path: "/inventory/invoice-cost-elements",
          permissionKey: Permissions.GetCostElements,
          aliases: ['عناصر تكلفة الفاتورة', 'مصاريف الفاتورة', 'تاريف التكلفة', 'cost elements', 'invoice costs']
        },
        {
          name: "Geographic Hierarchy",
          translationKey: "pages.geographicHierarchy",
          icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
          aliases: ['الهيكل الجغرافي', 'المناطق والدول', 'geographic hierarchy', 'geography'],
          subItems: [
            { name: "Country Groups", translationKey: "pages.countryGroups", path: "/master-data/country-groups", permissionKey: Permissions.GetCountryGroups, aliases: ['مجموعات الدول', 'اقاليم', 'country groups'] },
            { name: "Countries", translationKey: "pages.countries", path: "/master-data/countries", permissionKey: Permissions.GetCountries, aliases: ['دول', 'الدول', 'بلدان', 'countries', 'country'] },
            { name: "Governorates", translationKey: "pages.governorates", path: "/master-data/governorates", aliases: ['محافظات', 'المحافظات', 'governorates', 'states'] },
            { name: "Cities", translationKey: "pages.cities", path: "/master-data/cities", aliases: ['مدن', 'المدن', 'cities', 'city'] },
            { name: "Districts", translationKey: "pages.districts", path: "/master-data/districts", aliases: ['أحياء', 'المناطق', 'أحياء مدنية', 'districts', 'areas'] }
          ]
        }
      ]
    },
    {
      name: "Sales - A/R",
      translationKey: "pages.sales",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C1.44772 2 1 2.44772 1 3V21C1 22.1046 1.89543 23 3 23H21C22.1046 23 23 22.1046 23 21V3C23 2.44772 22.5523 2 22 2C21.4477 2 21 2.44772 21 3V21H3V3C3 2.44772 2.55228 2 2 2ZM5 5C4.44772 5 4 5.44772 4 6V14C4 15.1046 4.89543 16 6 16H18C19.1046 16 20 15.1046 20 14V6C20 5.44772 19.5523 5 19 5C18.4477 5 18 5.44772 18 6V14H6V6C6 5.44772 5.55228 5 5 5Z" fill="currentColor"></path></svg>`,
      aliases: ['المبيعات', 'البيع', 'حسابات العملاء', 'sales', 'ar', 'sales ar'],
      subItems: [
        { name: "Sales Dashboard", translationKey: "salesDashboard.title", path: "/sales/dashboard", aliases: ['لوحة مبيعات', 'مؤشرات المبيعات', 'sales dashboard'] },
        { name: "Quick Sale POS", translationKey: "quickSale.title", path: "/sales/quick-sale", aliases: ['نقطة بيع', 'نقاط البيع', 'كاشير', 'بيع سريع', 'pos', 'quick sale', 'cashier'] },
        { name: "My Invoices", translationKey: "salesRepInvoices.title", path: "/sales/my-invoices", aliases: ['فواتيري', 'فواتير المندوب', 'فواتير البيع السريع', 'my invoices', 'rep invoices'] },
        { name: "Sales Insights", translationKey: "salesInsights.title", path: "/sales/insights", aliases: ['تحليلات المبيعات', 'نظرة عامة على المبيعات', 'sales insights'] },
        { name: "Sales Quotations", translationKey: "salesQuotations.title", path: "/sales/sales-quotations", aliases: ['عرض سعر', 'عروض الأسعار', 'عرض أسعار مبيعات', 'sales quotation', 'sales quotations', 'quote'] },
        { name: "Sales Orders", translationKey: "salesOrders.title", path: "/sales/sales-orders", aliases: ['أمر بيع', 'أوامر البيع', 'طلب مبيعات', 'طلبات مبيعات', 'sales order', 'sales orders', 'so'] },
        { name: "Sales Invoices", translationKey: "salesInvoices.title", path: "/invoices/sales", permissionKey: Permissions.GetSalesInvoices, aliases: ['فاتورة مبيعات', 'فواتير المبيعات', 'فاتورة عميل', 'فواتير عملاء', 'فاتورة', 'فواتير', 'sales invoice', 'sales invoices', 'invoice', 'invoices'] },
        { name: "Sales Returns", translationKey: "salesReturns.title", path: "/sales/returns", aliases: ['مرتجع مبيعات', 'مردودات المبيعات', 'مرتجعات عملاء', 'sales return', 'sales returns'] }
      ],
    },
    {
      name: "Purchasing - A/P",
      translationKey: "pages.purchases",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 2C5.08579 2 4.75 2.33579 4.75 2.75C4.75 3.16421 5.08579 3.5 5.5 3.5H6.25L7.75 14.75H19.25C19.6642 14.75 20 14.4142 20 14C20 13.5858 19.6642 13.25 19.25 13.25H8.25L7 4H5.5C5.08579 4 4.75 4.33579 4.75 4.75C4.75 5.16421 5.08579 5.5 5.5 5.5H6.75L8.25 16.75C8.75 20.5 11.75 23.5 15.5 23.5C19.25 23.5 22.25 20.5 22.75 16.75H20.75C20.25 19.5 17.75 21.5 15.5 21.5C13.25 21.5 11 19.5 10.75 16.75H8.25L9.75 22.25C10 23 10.75 23.5 11.5 23.5H19.5C20.25 23.5 21 23 21.25 22.25L22.75 16.75C23.25 12.75 20.25 9.5 16.5 9.5H13.75L12.25 1.75C12 1 11.25 0.5 10.5 0.5H2.5C1.75 0.5 1 1 0.75 1.75L2.5 16.75C3 20.5 6 23.5 9.75 23.5C13.5 23.5 16.5 20.5 17 16.75H15C14.5 19.5 12 21.5 9.75 21.5C7.5 21.5 5.25 19.5 5 16.75L3.5 2.75C3.5 2.75 3.5 2.75 3.5 2.75Z" fill="currentColor"></path></svg>`,
      aliases: ['المشتريات', 'الشراء', 'حسابات الموردين', 'purchases', 'purchasing', 'ap'],
      subItems: [
        { name: "Purchase Orders", translationKey: "purchaseOrders.title", path: "/purchases/purchase-orders", permissionKey: Permissions.GetPurchaseOrders, aliases: ['أمر شراء', 'أوامر الشراء', 'طلب شراء', 'طلبات شراء', 'purchase order', 'purchase orders', 'po'] },
        { name: "Purchase Invoices", translationKey: "purchaseInvoices.title", path: "/purchases/invoices", permissionKey: Permissions.GetPurchaseInvoices, aliases: ['فاتورة مشتريات', 'فواتير المشتريات', 'فاتورة مورد', 'فواتير موردين', 'شراء', 'purchase invoice', 'purchase invoices'] },
        { name: "Purchase Returns", translationKey: "purchaseReturns.title", path: "/purchases/returns", aliases: ['مرتجع مشتريات', 'مردودات المشتريات', 'مرتجعات موردين', 'purchase return', 'purchase returns'] }
      ],
    },
    {
      name: "Inventory & Stock",
      translationKey: "pages.inventory",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 6V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V6H4ZM2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V19C22 21.2091 20.2091 23 18 23H6C3.79086 23 2 21.2091 2 19V6ZM7 9C7 8.44772 7.44772 8 8 8H16C16.5523 8 17 8.44772 17 9C17 9.55228 16.5523 10 16 10H8C7.44772 10 7 9.55228 7 9ZM7 13C7 12.4477 7.44772 12 8 12H12C12.5523 12 13 12.4477 13 13C13 13.5523 12.5523 14 12 14H8C7.44772 14 7 13.5523 7 13Z" fill="currentColor"></path></svg>`,
      aliases: ['المخزون', 'المخازن', 'إدارة المخزون', 'inventory', 'stock'],
      subItems: [
        {
          name: "Definitions",
          translationKey: "pages.definitions",
          aliases: ['تعريفات المخزون', 'بيانات تعريفية', 'inventory definitions'],
          subItems: [
            { name: "Items", translationKey: "pages.items", path: "/inventory/items", permissionKey: Permissions.GetItems, aliases: ['صنف', 'أصناف', 'الأصناف', 'منتج', 'منتجات', 'بضاعة', 'item', 'items', 'products'] },
            { name: "Item Groups", translationKey: "pages.itemGroups", path: "/inventory/item-groups", permissionKey: Permissions.GetItemGroups, aliases: ['مجموعات الأصناف', 'فئات الأصناف', 'مجموعة اصناف', 'item groups', 'categories'] },
            { name: "Unit of Measures", translationKey: "pages.UnitOfMeasure.Title", path: "/inventory/unit-of-measure", permissionKey: Permissions.GetUnitOfMeasures, aliases: ['وحدات القياس', 'وحدة قياس', 'وحدات', 'uom', 'units of measure'] },
            { name: "Warehouses", translationKey: "warehouses.title", path: "/inventory/warehouses", permissionKey: Permissions.GetWarehouses, aliases: ['مخزن', 'مخازن', 'المخازن', 'مستودع', 'مستودعات', 'warehouse', 'warehouses', 'store'] },
            { name: "Locations", translationKey: "locations.title", path: "/inventory/locations", permissionKey: Permissions.GetLocations, aliases: ['مواقع التخزين', 'أماكن التخزين', 'locations', 'bins'] },
            { name: "Resources", translationKey: "resources.title", path: "/inventory/resources", permissionKey: Permissions.GetResources, aliases: ['موارد التخزين', 'آلات وخامات', 'resources'] },
            { name: "Item Properties", translationKey: "pages.itemProperties", path: "/inventory/item-properties", permissionKey: Permissions.GetItemProperty, aliases: ['خصائص الأصناف', 'سمات الاصناف', 'item properties'] },
            { name: "Item BOMs", translationKey: "pages.itemBoms", path: "/inventory/item-boms", permissionKey: Permissions.GetItemBom, aliases: ['قائمة مكونات الصنف', 'تركيب الصنف', 'bom', 'bill of materials'] }
          ]
        },
        {
          name: "Transactions",
          translationKey: "pages.transactions",
          aliases: ['حركات المخزون', 'المستندات المخزنية', 'stock transactions', 'inventory vouchers'],
          subItems: [
            { name: "Stock Transfers", translationKey: "pages.stockTransfers", path: "/inventory/stock-transfers", aliases: ['تحويل مخزني', 'تحويل بين المخازن', 'نقل مخزون', 'stock transfer', 'transfers'] },
            { name: "Stock Adjustments", translationKey: "pages.stockAdjustments", path: "/inventory/stock-adjustments", aliases: ['تسوية مخزنية', 'تسويات المخزون', 'جرد مخزني', 'stock adjustment', 'adjustments'] },
            { name: "Stock Issues", translationKey: "stockVouchers.issues.title", path: "/inventory/stock-issues", aliases: ['إذن صرف', 'صرف مخزني', 'صرف مواد', 'مخرجات مخزون', 'stock issue', 'stock issues'] },
            { name: "Stock Receipts", translationKey: "stockVouchers.receipts.title", path: "/inventory/stock-receipts", aliases: ['إذن إضافة', 'إضافة مخزنية', 'توريد مخزني', 'مدخلات مخزون', 'stock receipt', 'stock receipts'] }
          ]
        },
        {
          name: "Reports",
          translationKey: "pages.reports",
          aliases: ['تقارير المخزون', 'inventory reports'],
          subItems: [
            { name: "Stock Transactions", translationKey: "pages.stockTransactions", path: "/inventory/stock-transactions", aliases: ['حركة الأصناف', 'تقرير حركات المخزون', 'stock movement', 'stock transactions'] }
          ]
        }
      ],
    },
    {
      name: "Financials & Banking",
      translationKey: "pages.finance",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
      aliases: ['المالية', 'الحسابات', 'الخزينة والبنك', 'finance', 'financials', 'banking'],
      subItems: [
        { name: "Partner Payments", translationKey: "pages.payments", path: "/finance/business-partner-payments", permissionKey: Permissions.GetBusinessPartnerPayments, aliases: ['سند قبض', 'سند صرف', 'سندات', 'دفعة', 'دفعات', 'تحصيل', 'سداد', 'مدفوعات الشركاء', 'payments', 'partner payment', 'receipts'] },
        { name: "E-Wallet Providers", translationKey: "pages.eWalletProviders", path: "/finance/e-wallet-providers", permissionKey: Permissions.GetEWalletProviders, aliases: ['المحافظ الإلكترونية', 'مزودي المحافظ', 'e-wallet', 'wallets'] }
      ],
    },
    {
      name: "Reports & Analytics",
      translationKey: "pages.reports",
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 5V19H19V5H5ZM7 11H9V17H7V11ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"></path></svg>`,
      aliases: ['التقارير', 'تقارير النظام', 'التحليلات', 'reports', 'analytics'],
      subItems: [
        { name: "Business Partner Statement", translationKey: "pages.businessPartnerStatement", path: "/reports/business-partner-statement", aliases: ['كشف حساب', 'كشف حساب عميل', 'كشف حساب مورد', 'كشف حساب شريك', 'statement', 'bp statement', 'partner statement'] },
        { name: "Sales Report", translationKey: "pages.salesReport", path: "/reports/sales", aliases: ['تقرير المبيعات', 'تقارير مبيعات', 'sales report'] },
        { name: "Sales Rep Report", translationKey: "pages.salesRepReport", path: "/reports/sales-rep", aliases: ['تقرير المندوبين', 'أداء مندوبي المبيعات', 'sales rep report'] },
        { name: "Purchases Report", translationKey: "pages.purchasesReport", path: "/reports/purchases", aliases: ['تقرير المشتريات', 'تقارير مشتريات', 'purchases report'] },
        { name: "Warehouse Items Stock", translationKey: "reports.warehouseStock.title", path: "/reports/warehouse-items-stock", aliases: ['رصيد المخزن', 'مخزون الأصناف', 'warehouse stock'] },
        { name: "Invoice Profitability", translationKey: "reports.profitability.title", path: "/reports/profitability", aliases: ['أرباح الفواتير', 'ربحية الفاتورة', 'profitability'] },
        { name: "Unpriced Items Report", translationKey: "reports.unpricedItems.title", path: "/reports/unpriced-items", permissionKey: Permissions.ViewUnpricedItemsReport, aliases: ['أصناف غير مسعرة', 'unpriced items'] }
      ],
    }
  ];

  othersItems: NavItem[] = [];

  isExpanded$ = this.isExpandedSubject.asObservable();
  isMobileOpen$ = this.isMobileOpenSubject.asObservable();
  isHovered$ = this.isHoveredSubject.asObservable();

  setExpanded(val: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_sidebar_expanded', String(val));
    }
    this.isExpandedSubject.next(val);
  }

  toggleExpanded() {
    const newVal = !this.isExpandedSubject.value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_sidebar_expanded', String(newVal));
    }
    this.isExpandedSubject.next(newVal);
  }

  setMobileOpen(val: boolean) {
    this.isMobileOpenSubject.next(val);
  }

  toggleMobileOpen() {
    this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
  }

  setHovered(val: boolean) {
    this.isHoveredSubject.next(val);
  }

  // Direct value getters (avoid subscribe/unsubscribe anti-pattern)
  get isExpandedValue(): boolean {
    return this.isExpandedSubject.value;
  }

  get isMobileOpenValue(): boolean {
    return this.isMobileOpenSubject.value;
  }

  get isHoveredValue(): boolean {
    return this.isHoveredSubject.value;
  }
}
