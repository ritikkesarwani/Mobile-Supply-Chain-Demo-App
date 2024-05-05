import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderItemsPageRoutingModule } from './order-items-routing.module';

import { OrderItemsPage } from './order-items.page';
import { SharedModule } from 'src/app/shared module/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderItemsPageRoutingModule,
    SharedModule
  ],
  declarations: [OrderItemsPage]
})
export class OrderItemsPageModule {}
