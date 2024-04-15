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
  },  {
    path: 'activity',
    loadChildren: () => import('./pages/activity/activity.module').then( m => m.ActivityPageModule)
  },
  {
    path: 'good-receipt',
    loadChildren: () => import('./pages/good-receipt/good-receipt.module').then( m => m.GoodReceiptPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },

 


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
