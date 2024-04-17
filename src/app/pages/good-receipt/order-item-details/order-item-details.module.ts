import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderItemDetailsPageRoutingModule } from './order-item-details-routing.module';

import { OrderItemDetailsPage } from './order-item-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderItemDetailsPageRoutingModule
  ],
  declarations: [OrderItemDetailsPage]
})
export class OrderItemDetailsPageModule {}
