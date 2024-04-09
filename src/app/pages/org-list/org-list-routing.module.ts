import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrgListPage } from './org-list.page';

const routes: Routes = [
  {
    path: '',
    component: OrgListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrgListPageRoutingModule {}
