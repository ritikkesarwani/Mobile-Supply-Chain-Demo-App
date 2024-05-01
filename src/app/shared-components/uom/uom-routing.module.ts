import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UomPage } from './uom.page';

const routes: Routes = [
  {
    path: '',
    component: UomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UomPageRoutingModule {}
