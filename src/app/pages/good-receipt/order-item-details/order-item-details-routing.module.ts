import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderItemDetailsPage } from './order-item-details.page';

const routes: Routes = [
  {
    path: '',
    component: OrderItemDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderItemDetailsPageRoutingModule {}
