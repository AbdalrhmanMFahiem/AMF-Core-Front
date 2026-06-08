import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { authGuard } from './core/guards/auth.guard';
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
        path: 'sales/invoices',
        loadComponent: () => import('./pages/sales/invoices/sales-invoices-list/sales-invoices-list.component').then(c => c.SalesInvoicesListComponent),
        title: 'Sales Invoices | AMF Core'
      },
      {
        path: 'sales/invoices/add',
        loadComponent: () => import('./pages/sales/invoices/sales-invoice-form/sales-invoice-form.component').then(c => c.SalesInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Add Sales Invoice | AMF Core'
      },
      {
        path: 'sales/invoices/view/:id',
        loadComponent: () => import('./pages/sales/invoices/sales-invoice-form/sales-invoice-form.component').then(c => c.SalesInvoiceFormComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'View Sales Invoice | AMF Core'
      },
      // Reports
      {
        path: 'reports/business-partner-statement',
        loadComponent: () => import('./pages/reports/business-partner-statement/business-partner-statement.component').then(c => c.BusinessPartnerStatementComponent),
        title: 'Business Partner Statement | AMF Core'
      },
    ]
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
