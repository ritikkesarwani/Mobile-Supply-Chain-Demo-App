import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommonSharedListPageRoutingModule } from './common-shared-list-routing.module';

import { CommonSharedListPage } from './common-shared-list.page';
import { SharedModule } from '../shared module/shared.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonSharedListPageRoutingModule,
    SharedModule
  ],
  declarations: [CommonSharedListPage]
})
export class CommonSharedListPageModule {}
