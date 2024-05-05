import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';


import { OrdersListPageRoutingModule } from './orders-list-routing.module';

import { OrdersListPage } from './orders-list.page';
import { SharedModule } from 'src/app/shared module/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersListPageRoutingModule,
    ScrollingModule,
    SharedModule
  ],
  declarations: [OrdersListPage]
})
export class OrdersListPageModule {}
