import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoodReceiptPageRoutingModule } from './good-receipt-routing.module';

import { GoodReceiptPage } from './good-receipt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoodReceiptPageRoutingModule
  ],
  declarations: [GoodReceiptPage]
})
export class GoodReceiptPageModule {}
