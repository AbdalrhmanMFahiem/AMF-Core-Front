import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { authGuard } from './core/guards/auth.guard';
import { setupGuard } from './core/guards/setup.guard';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomePageComponent,
        pathMatch: 'full',
        title: 'Home | AMF Core',
      },
      {
        path: 'dashboard',
        component: EcommerceComponent,
        title:
          'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // Administration
      {
        path: 'administration/branches',
        loadComponent: () => import('./pages/administration/branches/branches-list/branches-list.component').then(c => c.BranchesListComponent),
        title: 'Branches | AMF Core'
      },
      {
        path: 'administration/branches/add',
        loadComponent: () => import('./pages/administration/branches/branch-form/branch-form.component').then(c => c.BranchFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Branch | AMF Core'
      },
      {
        path: 'administration/branches/edit/:id',
        loadComponent: () => import('./pages/administration/branches/branch-form/branch-form.component').then(c => c.BranchFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Branch | AMF Core'
      },
      {
        path: 'administration/branches/view/:id',
        loadComponent: () => import('./pages/administration/branches/branch-form/branch-form.component').then(c => c.BranchFormComponent),
        title: 'View Branch | AMF Core'
      },
      {
        path: 'administration/users',
        loadComponent: () => import('./pages/administration/users/users-list/users-list.component').then(c => c.UsersListComponent),
        title: 'Users | AMF Core'
      },
      {
        path: 'administration/users/add',
        loadComponent: () => import('./pages/administration/users/users-form/users-form.component').then(c => c.UsersFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add User | AMF Core'
      },
      {
        path: 'administration/users/edit/:id',
        loadComponent: () => import('./pages/administration/users/users-form/users-form.component').then(c => c.UsersFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit User | AMF Core'
      },
      {
        path: 'administration/users/view/:id',
        loadComponent: () => import('./pages/administration/users/users-form/users-form.component').then(c => c.UsersFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View User | AMF Core'
      },
      {
        path: 'administration/roles',
        loadComponent: () => import('./pages/administration/roles/roles-list/roles-list.component').then(c => c.RolesListComponent),
        title: 'Roles | AMF Core'
      },
      {
        path: 'administration/roles/add',
        loadComponent: () => import('./pages/administration/roles/roles-form/roles-form.component').then(c => c.RolesFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Role | AMF Core'
      },
      {
        path: 'administration/roles/edit/:id',
        loadComponent: () => import('./pages/administration/roles/roles-form/roles-form.component').then(c => c.RolesFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Role | AMF Core'
      },
      {
        path: 'administration/roles/view/:id',
        loadComponent: () => import('./pages/administration/roles/roles-form/roles-form.component').then(c => c.RolesFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Role | AMF Core'
      },
      // Master Data
      {
        path: 'master-data/business-partners',
        loadComponent: () => import('./pages/master-data/business-partners/business-partners-list/business-partners-list.component').then(c => c.BusinessPartnersListComponent),
        title: 'Business Partners | AMF Core'
      },
      {
        path: 'master-data/business-partners/add',
        loadComponent: () => import('./pages/master-data/business-partners/business-partner-form/business-partner-form.component').then(c => c.BusinessPartnerFormComponent),
        title: 'Add Business Partner | AMF Core'
      },
      {
        path: 'master-data/business-partners/edit/:id',
        loadComponent: () => import('./pages/master-data/business-partners/business-partner-form/business-partner-form.component').then(c => c.BusinessPartnerFormComponent),
        title: 'Edit Business Partner | AMF Core'
      },
      {
        path: 'master-data/business-partners/view/:id',
        loadComponent: () => import('./pages/master-data/business-partners/business-partner-form/business-partner-form.component').then(c => c.BusinessPartnerFormComponent),
        title: 'View Business Partner | AMF Core'
      },
      // Configuration
      {
        path: 'configuration/company-settings',
        loadComponent: () => import('./pages/configuration/company-settings/company-settings.component').then(c => c.CompanySettingsComponent),
        title: 'Company Settings | AMF Core'
      },
      {
        path: 'configuration/inventory-settings',
        loadComponent: () => import('./pages/configuration/inventory-settings/inventory-settings.component').then(c => c.InventorySettingsComponent),
        title: 'Inventory Settings | AMF Core'
      },
      {
        path: 'configuration/invoice-settings',
        loadComponent: () => import('./pages/configuration/invoice-settings/invoice-settings.component').then(c => c.InvoiceSettingsComponent),
        title: 'Invoice Settings | AMF Core'
      },
      // Inventory
      {
        path: 'inventory/stock-transfers',
        loadComponent: () => import('./pages/inventory/stock-transfers/stock-transfers-list/stock-transfers-list.component').then(c => c.StockTransfersListComponent),
        title: 'Stock Transfers | AMF Core'
      },
      {
        path: 'inventory/stock-transfers/add',
        loadComponent: () => import('./pages/inventory/stock-transfers/stock-transfer-form/stock-transfer-form.component').then(c => c.StockTransferFormComponent),
        title: 'Add Stock Transfer | AMF Core'
      },
      {
        path: 'inventory/stock-transfers/view/:id',
        loadComponent: () => import('./pages/inventory/stock-transfers/stock-transfer-form/stock-transfer-form.component').then(c => c.StockTransferFormComponent),
        title: 'View Stock Transfer | AMF Core'
      },
      {
        path: 'inventory/stock-adjustments',
        loadComponent: () => import('./pages/inventory/stock-adjustments/stock-adjustments-list/stock-adjustments-list.component').then(c => c.StockAdjustmentsListComponent),
        title: 'Stock Adjustments | AMF Core'
      },
      {
        path: 'inventory/stock-adjustments/add',
        loadComponent: () => import('./pages/inventory/stock-adjustments/stock-adjustment-form/stock-adjustment-form.component').then(c => c.StockAdjustmentFormComponent),
        title: 'Add Stock Adjustment | AMF Core'
      },
      {
        path: 'inventory/stock-adjustments/view/:id',
        loadComponent: () => import('./pages/inventory/stock-adjustments/stock-adjustment-form/stock-adjustment-form.component').then(c => c.StockAdjustmentFormComponent),
        title: 'View Stock Adjustment | AMF Core'
      },
      {
        path: 'inventory/stock-transactions',
        loadComponent: () => import('./pages/inventory/stock-transactions/stock-transactions-list/stock-transactions-list.component').then(c => c.StockTransactionsListComponent),
        title: 'Stock Transactions | AMF Core'
      },
      {
        path: 'inventory/stock-issues',
        loadComponent: () => import('./pages/inventory/stock-issues/stock-issues-list/stock-issues-list.component').then(c => c.StockIssuesListComponent),
        title: 'Stock Issues | AMF Core'
      },
      {
        path: 'inventory/stock-issues/add',
        loadComponent: () => import('./pages/inventory/stock-issues/stock-issue-form/stock-issue-form.component').then(c => c.StockIssueFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Stock Issue | AMF Core'
      },
      {
        path: 'inventory/stock-issues/view/:id',
        loadComponent: () => import('./pages/inventory/stock-issues/stock-issue-form/stock-issue-form.component').then(c => c.StockIssueFormComponent),
        title: 'View Stock Issue | AMF Core'
      },
      {
        path: 'inventory/stock-receipts',
        loadComponent: () => import('./pages/inventory/stock-receipts/stock-receipts-list/stock-receipts-list.component').then(c => c.StockReceiptsListComponent),
        title: 'Stock Receipts | AMF Core'
      },
      {
        path: 'inventory/stock-receipts/add',
        loadComponent: () => import('./pages/inventory/stock-receipts/stock-receipt-form/stock-receipt-form.component').then(c => c.StockReceiptFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Stock Receipt | AMF Core'
      },
      {
        path: 'inventory/stock-receipts/view/:id',
        loadComponent: () => import('./pages/inventory/stock-receipts/stock-receipt-form/stock-receipt-form.component').then(c => c.StockReceiptFormComponent),
        title: 'View Stock Receipt | AMF Core'
      },
      {
        path: 'inventory/inventory-counts',
        loadComponent: () => import('./pages/inventory/inventory-counts/inventory-counts-list/inventory-counts-list.component').then(c => c.InventoryCountsListComponent),
        title: 'Inventory Counts | AMF Core'
      },
      {
        path: 'inventory/inventory-counts/add',
        loadComponent: () => import('./pages/inventory/inventory-counts/inventory-count-form/inventory-count-form.component').then(c => c.InventoryCountFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Inventory Count | AMF Core'
      },
      {
        path: 'inventory/inventory-counts/view/:id',
        loadComponent: () => import('./pages/inventory/inventory-counts/inventory-count-form/inventory-count-form.component').then(c => c.InventoryCountFormComponent),
        title: 'View Inventory Count | AMF Core'
      },
      // support tickets
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // Inventory
      {
        path: 'inventory/item-properties',
        loadComponent: () => import('./pages/inventory/item-properties/item-properties-list/item-properties-list.component').then(c => c.ItemPropertiesListComponent),
        title: 'Item Properties | AMF Core'
      },
      {
        path: 'inventory/item-properties/add',
        loadComponent: () => import('./pages/inventory/item-properties/item-property-form/item-property-form.component').then(c => c.ItemPropertyFormComponent),
        title: 'Add Item Property | AMF Core'
      },
      {
        path: 'inventory/item-properties/edit/:id',
        loadComponent: () => import('./pages/inventory/item-properties/item-property-form/item-property-form.component').then(c => c.ItemPropertyFormComponent),
        title: 'Edit Item Property | AMF Core'
      },
      {
        path: 'inventory/item-properties/view/:id',
        loadComponent: () => import('./pages/inventory/item-properties/item-property-form/item-property-form.component').then(c => c.ItemPropertyFormComponent),
        title: 'View Item Property | AMF Core'
      },
      {
        path: 'inventory/unit-of-measure',
        loadComponent: () => import('./pages/inventory/unit-of-measure/unit-of-measure-list/unit-of-measure-list.component').then(c => c.UnitOfMeasureListComponent),
        title: 'Unit of Measure | AMF Core'
      },
      {
        path: 'inventory/unit-of-measure/add',
        loadComponent: () => import('./pages/inventory/unit-of-measure/unit-of-measure-form/unit-of-measure-form.component').then(c => c.UnitOfMeasureFormComponent),
        title: 'Add Unit of Measure | AMF Core'
      },
      {
        path: 'inventory/unit-of-measure/edit/:id',
        loadComponent: () => import('./pages/inventory/unit-of-measure/unit-of-measure-form/unit-of-measure-form.component').then(c => c.UnitOfMeasureFormComponent),
        title: 'Edit Unit of Measure | AMF Core'
      },
      {
        path: 'inventory/unit-of-measure/view/:id',
        loadComponent: () => import('./pages/inventory/unit-of-measure/unit-of-measure-form/unit-of-measure-form.component').then(c => c.UnitOfMeasureFormComponent),
        title: 'View Unit of Measure | AMF Core'
      },
      {
        path: 'inventory/item-groups',
        loadComponent: () => import('./pages/inventory/item-groups/item-groups-list/item-groups-list.component').then(c => c.ItemGroupsListComponent),
        title: 'Item Groups | AMF Core'
      },
      {
        path: 'inventory/item-groups/add',
        loadComponent: () => import('./pages/inventory/item-groups/item-group-form/item-group-form.component').then(c => c.ItemGroupFormComponent),
        title: 'Add Item Group | AMF Core'
      },
      {
        path: 'inventory/item-groups/edit/:id',
        loadComponent: () => import('./pages/inventory/item-groups/item-group-form/item-group-form.component').then(c => c.ItemGroupFormComponent),
        title: 'Edit Item Group | AMF Core'
      },
      {
        path: 'inventory/item-groups/view/:id',
        loadComponent: () => import('./pages/inventory/item-groups/item-group-form/item-group-form.component').then(c => c.ItemGroupFormComponent),
        title: 'View Item Group | AMF Core'
      },
      {
        path: 'inventory/warehouses',
        loadComponent: () => import('./pages/inventory/warehouses/warehouses-list/warehouses-list.component').then(c => c.WarehousesListComponent),
        title: 'Warehouses | AMF Core'
      },
      {
        path: 'inventory/warehouses/add',
        loadComponent: () => import('./pages/inventory/warehouses/warehouse-form/warehouse-form.component').then(c => c.WarehouseFormComponent),
        title: 'Add Warehouse | AMF Core'
      },
      {
        path: 'inventory/warehouses/edit/:id',
        loadComponent: () => import('./pages/inventory/warehouses/warehouse-form/warehouse-form.component').then(c => c.WarehouseFormComponent),
        title: 'Edit Warehouse | AMF Core'
      },
      {
        path: 'inventory/warehouses/view/:id',
        loadComponent: () => import('./pages/inventory/warehouses/warehouse-form/warehouse-form.component').then(c => c.WarehouseFormComponent),
        title: 'View Warehouse | AMF Core'
      },
      {
        path: 'inventory/locations',
        loadComponent: () => import('./pages/inventory/locations/locations-list/locations-list.component').then(c => c.LocationsListComponent),
        title: 'Locations | AMF Core'
      },
      {
        path: 'inventory/locations/add',
        loadComponent: () => import('./pages/inventory/locations/location-form/location-form.component').then(c => c.LocationFormComponent),
        title: 'Add Location | AMF Core'
      },
      {
        path: 'inventory/locations/edit/:id',
        loadComponent: () => import('./pages/inventory/locations/location-form/location-form.component').then(c => c.LocationFormComponent),
        title: 'Edit Location | AMF Core'
      },
      {
        path: 'inventory/locations/view/:id',
        loadComponent: () => import('./pages/inventory/locations/location-form/location-form.component').then(c => c.LocationFormComponent),
        title: 'View Location | AMF Core'
      },
      {
        path: 'inventory/items',
        loadComponent: () => import('./pages/inventory/items/items-list/items-list.component').then(c => c.ItemsListComponent),
        title: 'Items | AMF Core'
      },
      {
        path: 'inventory/items/add',
        loadComponent: () => import('./pages/inventory/items/item-form/item-form.component').then(c => c.ItemFormComponent),
        title: 'Add Item | AMF Core'
      },
      {
        path: 'inventory/items/edit/:id',
        loadComponent: () => import('./pages/inventory/items/item-form/item-form.component').then(c => c.ItemFormComponent),
        title: 'Edit Item | AMF Core'
      },
      {
        path: 'inventory/items/view/:id',
        loadComponent: () => import('./pages/inventory/items/item-form/item-form.component').then(c => c.ItemFormComponent),
        title: 'View Item | AMF Core'
      },
      {
        path: 'inventory/invoice-cost-elements',
        loadComponent: () => import('./pages/master-data/invoice-cost-elements/invoice-cost-elements-list.component').then(c => c.InvoiceCostElementsListComponent),
        title: 'Invoice Cost Elements | AMF Core'
      },
      {
        path: 'inventory/invoice-cost-elements/add',
        loadComponent: () => import('./pages/master-data/invoice-cost-elements/invoice-cost-element-form/invoice-cost-element-form.component').then(c => c.InvoiceCostElementFormComponent),
        title: 'Add Invoice Cost Element | AMF Core'
      },
      {
        path: 'inventory/invoice-cost-elements/edit/:id',
        loadComponent: () => import('./pages/master-data/invoice-cost-elements/invoice-cost-element-form/invoice-cost-element-form.component').then(c => c.InvoiceCostElementFormComponent),
        title: 'Edit Invoice Cost Element | AMF Core'
      },
      {
        path: 'inventory/invoice-cost-elements/view/:id',
        loadComponent: () => import('./pages/master-data/invoice-cost-elements/invoice-cost-element-form/invoice-cost-element-form.component').then(c => c.InvoiceCostElementFormComponent),
        title: 'View Invoice Cost Element | AMF Core'
      },
      // Sales
      {
        path: 'invoices/sales',
        loadComponent: () => import('./pages/sales/invoices/sales-invoices-list/sales-invoices-list.component').then(c => c.SalesInvoicesListComponent),
        title: 'Sales Invoices | AMF Core'
      },
      {
        path: 'invoices/sales/add',
        loadComponent: () => import('./pages/sales/invoices/sales-invoice-form/sales-invoice-form.component').then(c => c.SalesInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Sales Invoice | AMF Core'
      },
      {
        path: 'invoices/sales/view/:id',
        loadComponent: () => import('./pages/sales/invoices/sales-invoice-form/sales-invoice-form.component').then(c => c.SalesInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Sales Invoice | AMF Core'
      },
      {
        path: 'sales/returns',
        loadComponent: () => import('./pages/sales/returns/sales-returns-list/sales-returns-list.component').then(c => c.SalesReturnsListComponent),
        title: 'Sales Returns | AMF Core'
      },
      {
        path: 'sales/returns/add',
        loadComponent: () => import('./pages/sales/returns/sales-return-form/sales-return-form.component').then(c => c.SalesReturnFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Sales Return | AMF Core'
      },
      {
        path: 'sales/returns/view/:id',
        loadComponent: () => import('./pages/sales/returns/sales-return-form/sales-return-form.component').then(c => c.SalesReturnFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Sales Return | AMF Core'
      },
      // Purchases
      {
        path: 'purchases/purchase-orders',
        loadComponent: () => import('./pages/purchases/purchase-orders/purchase-orders-list/purchase-orders-list.component').then(c => c.PurchaseOrdersListComponent),
        title: 'Purchase Orders | AMF Core'
      },
      {
        path: 'purchases/purchase-orders/add',
        loadComponent: () => import('./pages/purchases/purchase-orders/purchase-order-form/purchase-order-form.component').then(c => c.PurchaseOrderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Purchase Order | AMF Core'
      },
      {
        path: 'purchases/purchase-orders/view/:id',
        loadComponent: () => import('./pages/purchases/purchase-orders/purchase-order-form/purchase-order-form.component').then(c => c.PurchaseOrderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Purchase Order | AMF Core'
      },
      {
        path: 'purchases/invoices',
        loadComponent: () => import('./pages/purchases/invoices/purchase-invoices-list/purchase-invoices-list.component').then(c => c.PurchaseInvoicesListComponent),
        title: 'Purchase Invoices | AMF Core'
      },
      {
        path: 'purchases/invoices/add',
        loadComponent: () => import('./pages/purchases/invoices/purchase-invoice-form/purchase-invoice-form.component').then(c => c.PurchaseInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Purchase Invoice | AMF Core'
      },
      {
        path: 'purchases/invoices/view/:id',
        loadComponent: () => import('./pages/purchases/invoices/purchase-invoice-form/purchase-invoice-form.component').then(c => c.PurchaseInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Purchase Invoice | AMF Core'
      },
      {
        path: 'purchases/returns',
        loadComponent: () => import('./pages/purchases/returns/purchase-returns-list/purchase-returns-list.component').then(c => c.PurchaseReturnsListComponent),
        title: 'Purchase Returns | AMF Core'
      },
      {
        path: 'purchases/returns/add',
        loadComponent: () => import('./pages/purchases/returns/purchase-return-form/purchase-return-form.component').then(c => c.PurchaseReturnFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Purchase Return | AMF Core'
      },
      {
        path: 'purchases/returns/view/:id',
        loadComponent: () => import('./pages/purchases/returns/purchase-return-form/purchase-return-form.component').then(c => c.PurchaseReturnFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Purchase Return | AMF Core'
      },
      // Reports
      {
        path: 'reports/business-partner-statement',
        loadComponent: () => import('./pages/reports/business-partner-statement/business-partner-statement.component').then(c => c.BusinessPartnerStatementComponent),
        title: 'Business Partner Statement | AMF Core'
      },
      {
        path: 'reports/sales',
        loadComponent: () => import('./pages/reports/sales-report/sales-report.component').then(c => c.SalesReportComponent),
        title: 'Sales Report | AMF Core'
      },
      {
        path: 'reports/purchases',
        loadComponent: () => import('./pages/reports/purchases-report/purchases-report.component').then(c => c.PurchasesReportComponent),
        title: 'Purchases Report | AMF Core'
      },
      {
        path: 'reports/inventory-valuation',
        loadComponent: () => import('./pages/reports/inventory-valuation/inventory-valuation.component').then(c => c.InventoryValuationComponent),
        title: 'Inventory Valuation | AMF Core'
      },
      {
        path: 'reports/warehouse-items-stock',
        loadComponent: () => import('./features/reports/warehouse-items-stock/warehouse-items-stock.component').then(c => c.WarehouseItemsStockComponent),
        title: 'Warehouse Items Stock | AMF Core'
      },
    ]
  },
  {
    path: 'setup-company',
    loadComponent: () => import('./pages/setup-company/setup-company.component').then(c => c.SetupCompanyComponent),
    canActivate: [setupGuard],
    title: 'Setup Company | AMF Core'
  },
  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Sign In | AMF Core'
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
