import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'org-list',
    loadChildren: () => import('./pages/org-list/org-list.module').then(m => m.OrgListPageModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./pages/activity/activity.module').then( m => m.ActivityPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'orders-list',
    loadChildren: () => import('./pages/good-receipt/orders-list/orders-list.module').then( m => m.OrdersListPageModule)
  },
  {
    path: 'order-items',
    loadChildren: () => import('./pages/good-receipt/order-items/order-items.module').then( m => m.OrderItemsPageModule)
  },
  {
    path: 'order-item-details',
    loadChildren: () => import('./pages/good-receipt/order-item-details/order-item-details.module').then( m => m.OrderItemDetailsPageModule)
  },  {
    path: 'common-shared-list',
    loadChildren: () => import('./common-shared-list/common-shared-list.module').then( m => m.CommonSharedListPageModule)
  },

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
