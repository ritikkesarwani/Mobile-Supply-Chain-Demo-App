import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoodReceiptPage } from './good-receipt.page';

const routes: Routes = [
  {
    path: '',
    component: GoodReceiptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoodReceiptPageRoutingModule {}
