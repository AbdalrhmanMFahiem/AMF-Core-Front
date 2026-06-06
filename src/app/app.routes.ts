import { Routes } from '@angular/router';
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
import { CalenderComponent } from './pages/calender/calender.component';

export const routes: Routes = [
  {
    path: '',
    component: SignInComponent,
    title: 'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'dashboard',
    component:AppLayoutComponent,
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
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
    ]
  },
  // auth pages
  {
    path:'signin',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
