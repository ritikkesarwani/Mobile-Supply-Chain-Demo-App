import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommonSharedListPageRoutingModule } from './common-shared-list-routing.module';

import { CommonSharedListPage } from './common-shared-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonSharedListPageRoutingModule
  ],
  declarations: [CommonSharedListPage]
})
export class CommonSharedListPageModule {}
