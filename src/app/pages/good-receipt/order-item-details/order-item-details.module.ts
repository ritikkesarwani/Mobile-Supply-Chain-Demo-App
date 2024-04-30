import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrderItemDetailsPageRoutingModule } from './order-item-details-routing.module';
import { SubInvPage } from 'src/app/shared-components/sub-inv/sub-inv.page';
import { OrderItemDetailsPage } from './order-item-details.page';
import { LocatorPage } from 'src/app/shared-components/locator/locator.page';
import { SerialsPage } from 'src/app/shared-components/serials/serials.page';
import { LotsPage } from 'src/app/shared-components/lots/lots.page';
import { UomPage } from 'src/app/shared-components/uom/uom.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderItemDetailsPageRoutingModule
  ],
  declarations: [OrderItemDetailsPage, SubInvPage, LocatorPage, LotsPage, SerialsPage, UomPage]
})
export class OrderItemDetailsPageModule { }
