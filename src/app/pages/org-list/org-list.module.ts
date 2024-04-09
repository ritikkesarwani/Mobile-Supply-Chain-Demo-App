import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrgListPageRoutingModule } from './org-list-routing.module';

import { OrgListPage } from './org-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrgListPageRoutingModule
  ],
  declarations: [OrgListPage]
})
export class OrgListPageModule {}
