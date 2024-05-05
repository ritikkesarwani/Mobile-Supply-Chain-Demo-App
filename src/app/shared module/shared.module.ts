import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ScanComponent } from '../shared-components/scan/scan.component';



@NgModule({
  declarations: [
    ScanComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ScanComponent
  ]
})
export class SharedModule { }
