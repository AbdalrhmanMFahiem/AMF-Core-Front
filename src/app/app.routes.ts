import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { Permissions } from './core/constants/permissions';
import { setupGuard } from './core/guards/setup.guard';
import { dashboardGuard } from './core/guards/dashboard.guard';
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
        canActivate: [dashboardGuard],
        title:
          'Dashboard | AMF Core',
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
        path: 'administration/sales-reps',
        loadComponent: () => import('./pages/administration/sales-reps/sales-reps-list/sales-reps-list.component').then(c => c.SalesRepsListComponent),
        title: 'Sales Representatives | AMF Core'
      },
      {
        path: 'administration/sales-reps/view/:id',
        loadComponent: () => import('./pages/administration/sales-reps/sales-rep-details/sales-rep-details.component').then(c => c.SalesRepDetailsComponent),
        title: 'Sales Rep Details | AMF Core'
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
      {
        path: 'master-data/country-groups',
        loadComponent: () => import('./pages/master-data/country-groups/country-groups-list/country-groups-list.component').then(c => c.CountryGroupsListComponent),
        title: 'Country Groups | AMF Core'
      },
      {
        path: 'master-data/country-groups/add',
        loadComponent: () => import('./pages/master-data/country-groups/country-group-form/country-group-form.component').then(c => c.CountryGroupFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Country Group | AMF Core'
      },
      {
        path: 'master-data/country-groups/edit/:id',
        loadComponent: () => import('./pages/master-data/country-groups/country-group-form/country-group-form.component').then(c => c.CountryGroupFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Country Group | AMF Core'
      },
      {
        path: 'master-data/country-groups/view/:id',
        loadComponent: () => import('./pages/master-data/country-groups/country-group-form/country-group-form.component').then(c => c.CountryGroupFormComponent),
        title: 'View Country Group | AMF Core'
      },
      // Configuration
      {
        path: 'master-data/countries',
        loadComponent: () => import('./pages/master-data/countries/countries-list/countries-list.component').then(c => c.CountriesListComponent),
        title: 'Countries | AMF Core'
      },
      {
        path: 'master-data/countries/add',
        loadComponent: () => import('./pages/master-data/countries/country-form/country-form.component').then(c => c.CountryFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Country | AMF Core'
      },
      {
        path: 'master-data/countries/edit/:id',
        loadComponent: () => import('./pages/master-data/countries/country-form/country-form.component').then(c => c.CountryFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Country | AMF Core'
      },
      {
        path: 'master-data/countries/view/:id',
        loadComponent: () => import('./pages/master-data/countries/country-form/country-form.component').then(c => c.CountryFormComponent),
        title: 'View Country | AMF Core'
      },
      {
        path: 'master-data/governorates',
        loadComponent: () => import('./pages/master-data/governorates/governorates-list/governorates-list.component').then(c => c.GovernoratesListComponent),
        title: 'Governorates | AMF Core'
      },
      {
        path: 'master-data/governorates/add',
        loadComponent: () => import('./pages/master-data/governorates/governorate-form/governorate-form.component').then(c => c.GovernorateFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Governorate | AMF Core'
      },
      {
        path: 'master-data/governorates/edit/:id',
        loadComponent: () => import('./pages/master-data/governorates/governorate-form/governorate-form.component').then(c => c.GovernorateFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Governorate | AMF Core'
      },
      {
        path: 'master-data/governorates/view/:id',
        loadComponent: () => import('./pages/master-data/governorates/governorate-form/governorate-form.component').then(c => c.GovernorateFormComponent),
        title: 'View Governorate | AMF Core'
      },
      {
        path: 'master-data/cities',
        loadComponent: () => import('./pages/master-data/cities/cities-list/cities-list.component').then(c => c.CitiesListComponent),
        title: 'Cities | AMF Core'
      },
      {
        path: 'master-data/cities/add',
        loadComponent: () => import('./pages/master-data/cities/city-form/city-form.component').then(c => c.CityFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add City | AMF Core'
      },
      {
        path: 'master-data/cities/edit/:id',
        loadComponent: () => import('./pages/master-data/cities/city-form/city-form.component').then(c => c.CityFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit City | AMF Core'
      },
      {
        path: 'master-data/cities/view/:id',
        loadComponent: () => import('./pages/master-data/cities/city-form/city-form.component').then(c => c.CityFormComponent),
        title: 'View City | AMF Core'
      },
      {
        path: 'master-data/districts',
        loadComponent: () => import('./pages/master-data/districts/districts-list/districts-list.component').then(c => c.DistrictsListComponent),
        title: 'Districts | AMF Core'
      },
      {
        path: 'master-data/districts/add',
        loadComponent: () => import('./pages/master-data/districts/district-form/district-form.component').then(c => c.DistrictFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add District | AMF Core'
      },
      {
        path: 'master-data/districts/edit/:id',
        loadComponent: () => import('./pages/master-data/districts/district-form/district-form.component').then(c => c.DistrictFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit District | AMF Core'
      },
      {
        path: 'master-data/districts/view/:id',
        loadComponent: () => import('./pages/master-data/districts/district-form/district-form.component').then(c => c.DistrictFormComponent),
        title: 'View District | AMF Core'
      },
      // Configuration
      {
        path: 'configuration/company-settings',
        loadComponent: () => import('./pages/configuration/company-settings/company-settings.component').then(c => c.CompanySettingsComponent),
        canActivate: [permissionGuard],
        data: { permission: Permissions.GetCompanySettings },
        title: 'Company Settings | AMF Core'
      },
      {
        path: 'configuration/inventory-settings',
        loadComponent: () => import('./pages/configuration/inventory-settings/inventory-settings.component').then(c => c.InventorySettingsComponent),
        title: 'Inventory Settings | AMF Core'
      },
      {
        path: 'configuration/document-settings',
        loadComponent: () => import('./pages/configuration/document-settings/document-settings.component').then(c => c.DocumentSettingsComponent),
        title: 'Document Settings | AMF Core'
      },
      {
        path: 'configuration/general-settings',
        loadComponent: () => import('./pages/configuration/general-settings/general-settings.component').then(c => c.GeneralSettingsComponent),
        title: 'General Settings | AMF Core'
      },
      {
        path: 'configuration/payment-settings',
        loadComponent: () => import('./pages/configuration/payment-settings/payment-settings.component').then(c => c.PaymentSettingsComponent),
        title: 'Payment Settings | AMF Core'
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
        path: 'inventory/resources',
        loadComponent: () => import('./pages/inventory/resources/resources-list/resources-list.component').then(c => c.ResourcesListComponent),
        title: 'Resources | AMF Core'
      },
      {
        path: 'inventory/resources/add',
        loadComponent: () => import('./pages/inventory/resources/resource-form/resource-form.component').then(c => c.ResourceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Resource | AMF Core'
      },
      {
        path: 'inventory/resources/edit/:id',
        loadComponent: () => import('./pages/inventory/resources/resource-form/resource-form.component').then(c => c.ResourceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit Resource | AMF Core'
      },
      {
        path: 'inventory/resources/view/:id',
        loadComponent: () => import('./pages/inventory/resources/resource-form/resource-form.component').then(c => c.ResourceFormComponent),
        title: 'View Resource | AMF Core'
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
        data: { mode: 'view', breadcrumb: 'common.view' }
      },
      {
        path: 'inventory/item-boms',
        loadComponent: () => import('./pages/inventory/item-boms/item-boms-list/item-boms-list.component').then(c => c.ItemBomsListComponent),
        data: { breadcrumb: 'items.manageComponents' }
      },
      {
        path: 'inventory/item-boms/add',
        loadComponent: () => import('./pages/inventory/item-boms/item-bom-form/item-bom-form.component').then(c => c.ItemBomFormComponent),
        data: { mode: 'add', breadcrumb: 'common.add' }
      },
      {
        path: 'inventory/item-boms/edit/:id',
        loadComponent: () => import('./pages/inventory/item-boms/item-bom-form/item-bom-form.component').then(c => c.ItemBomFormComponent),
        data: { mode: 'edit', breadcrumb: 'common.edit' }
      },
      {
        path: 'inventory/item-boms/view/:id',
        loadComponent: () => import('./pages/inventory/item-boms/item-bom-form/item-bom-form.component').then(c => c.ItemBomFormComponent),
        data: { mode: 'view', breadcrumb: 'common.view' }
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
        path: 'sales/sales-quotations',
        loadComponent: () => import('./pages/sales/sales-quotations/sales-quotations-list/sales-quotations-list.component').then(c => c.SalesQuotationsListComponent),
        title: 'Sales Quotations | AMF Core'
      },
      {
        path: 'sales/sales-quotations/add',
        loadComponent: () => import('./pages/sales/sales-quotations/sales-quotation-form/sales-quotation-form.component').then(c => c.SalesQuotationFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Sales Quotation | AMF Core'
      },
      {
        path: 'sales/sales-quotations/view/:id',
        loadComponent: () => import('./pages/sales/sales-quotations/sales-quotation-form/sales-quotation-form.component').then(c => c.SalesQuotationFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Sales Quotation | AMF Core'
      },
      {
        path: 'sales/sales-orders',
        loadComponent: () => import('./pages/sales/sales-orders/sales-orders-list/sales-orders-list.component').then(c => c.SalesOrdersListComponent),
        title: 'Sales Orders | AMF Core'
      },
      {
        path: 'sales/sales-orders/add',
        loadComponent: () => import('./pages/sales/sales-orders/sales-order-form/sales-order-form.component').then(c => c.SalesOrderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Sales Order | AMF Core'
      },
      {
        path: 'sales/sales-orders/view/:id',
        loadComponent: () => import('./pages/sales/sales-orders/sales-order-form/sales-order-form.component').then(c => c.SalesOrderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Sales Order | AMF Core'
      },
      {
        path: 'sales/quick-sale',
        loadComponent: () => import('./pages/sales/quick-sale/quick-sale.component').then(c => c.QuickSaleComponent),
        title: 'Quick Sale POS | AMF Core'
      },
      {
        path: 'sales/my-invoices',
        loadComponent: () => import('./pages/sales/sales-rep-invoices/sales-rep-invoices.component').then(c => c.SalesRepInvoicesComponent),
        title: 'My Sales Invoices | AMF Core'
      },
      {
        path: 'sales/dashboard',
        loadComponent: () => import('./pages/sales/sales-rep-dashboard/sales-rep-dashboard.component').then(c => c.SalesRepDashboardComponent),
        title: 'Sales Rep Dashboard | AMF Core'
      },
      {
        path: 'sales/insights',
        loadComponent: () => import('./pages/sales/sales-insights/sales-insights.component').then(c => c.SalesInsightsComponent),
        title: 'Sales Insights & Tracking | AMF Core'
      },
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
        path: 'reports/sales-rep',
        loadComponent: () => import('./pages/reports/sales-rep-report/sales-rep-report.component').then(c => c.SalesRepReportComponent),
        title: 'Sales Rep Report | AMF Core'
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
        path: 'reports/profitability',
        loadComponent: () => import('./pages/reports/profitability-report/profitability-report.component').then(c => c.ProfitabilityReportComponent),
        title: 'Invoice Profitability | AMF Core'
      },
      {
        path: 'reports/warehouse-items-stock',
        loadComponent: () => import('./features/reports/warehouse-items-stock/warehouse-items-stock.component').then(c => c.WarehouseItemsStockComponent),
        title: 'Warehouse Items Stock | AMF Core'
      },
      {
        path: 'reports/unpriced-items',
        loadComponent: () => import('./pages/reports/unpriced-items-report/unpriced-items-report.component').then(c => c.UnpricedItemsReportComponent),
        canActivate: [permissionGuard],
        data: { permission: Permissions.ViewUnpricedItemsReport },
        title: 'Unpriced Items Report | AMF Core'
      },
      // Finance
      {
        path: 'finance/e-wallet-providers',
        loadComponent: () => import('./pages/finance/e-wallet-providers/e-wallet-provider-list/e-wallet-provider-list.component').then(c => c.EWalletProviderListComponent),
        title: 'E-Wallet Providers | AMF Core'
      },
      {
        path: 'finance/e-wallet-providers/add',
        loadComponent: () => import('./pages/finance/e-wallet-providers/e-wallet-provider-form/e-wallet-provider-form.component').then(c => c.EWalletProviderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add E-Wallet Provider | AMF Core'
      },
      {
        path: 'finance/e-wallet-providers/edit/:id',
        loadComponent: () => import('./pages/finance/e-wallet-providers/e-wallet-provider-form/e-wallet-provider-form.component').then(c => c.EWalletProviderFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit E-Wallet Provider | AMF Core'
      },
      {
        path: 'finance/e-wallet-providers/view/:id',
        loadComponent: () => import('./pages/finance/e-wallet-providers/e-wallet-provider-form/e-wallet-provider-form.component').then(c => c.EWalletProviderFormComponent),
        title: 'View E-Wallet Provider | AMF Core'
      },
      {
        path: 'finance/business-partner-payments',
        loadComponent: () => import('./pages/finance/business-partner-payments/payment-list/payment-list.component').then(c => c.PaymentListComponent),
        title: 'Partner Payments | AMF Core'
      },
      {
        path: 'finance/business-partner-payments/add',
        loadComponent: () => import('./pages/finance/business-partner-payments/payment-form/payment-form.component').then(c => c.PaymentFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Partner Payment | AMF Core'
      },
      {
        path: 'finance/business-partner-payments/view/:id',
        loadComponent: () => import('./pages/finance/business-partner-payments/payment-form/payment-form.component').then(c => c.PaymentFormComponent),
        title: 'View Partner Payment | AMF Core'
      },
      {
        path: 'configurations/print-settings',
        loadComponent: () => import('./pages/configurations/print-settings/print-settings.component').then(c => c.PrintSettingsComponent),
        title: 'Print & Receipt Settings | AMF Core'
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
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent),
    title: 'Unauthorized | AMF Core'
  },
  {
    path: 'disconnected',
    loadComponent: () => import('./pages/other-page/disconnected/disconnected.component').then(c => c.DisconnectedComponent),
    title: 'Server Disconnected | AMF Core'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
