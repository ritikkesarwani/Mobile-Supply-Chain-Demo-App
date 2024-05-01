import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UomPageRoutingModule } from './uom-routing.module';

import { UomPage } from './uom.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UomPageRoutingModule
  ],
  declarations: [UomPage]
})
export class UomPageModule {}
