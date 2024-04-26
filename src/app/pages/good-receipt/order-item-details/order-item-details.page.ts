import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommonSharedListPage } from 'src/app/common-shared-list/common-shared-list.page';
import { UiService } from 'src/app/services/ui.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-order-item-details',
  templateUrl: './order-item-details.page.html',
  styleUrls: ['./order-item-details.page.scss'],
})
export class OrderItemDetailsPage implements OnInit {

  item: any;
  QtyReceiving: any = '';
  subInvCode: string = '';
  uomCode: string = '';
  SerialData: any[] = [];
  convertedLotData: any;
  lotData: any[] = [];
  subInvName: string = '';
  locator: string = '';
  lot: string = '';
  subInv: any;
  userDetails: any;
  selectedOrg: any;
  orgDetails: boolean = false;
  useravailable: boolean = false;
  enableLot: boolean = false;
  apiResponse: any;
  hasNetwork: boolean = false;
  itemData: any[] = [];
  locatorCode: string = '';
  itemRevCode: any;
  qtyRecieved: number = 0;
  qtyRemaining: number = 0;

  constructor(
    private modalController: ModalController,
    private uiProviderService: UiService,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService
  ) { }

  async ngOnInit() {
    // this.activatedRoute.queryParams.subscribe((data) => {
    //   this.item = data['item'];
    //   this.subInvCode = data['inventory'];
  

    // });
    this.item = await this.databaseService.getValue('selectedItem');
    this.loadItemsData();
  }

  async goToCommonListPage(message: string) {
    let modalData: any[] = [message, this.subInvCode, this.item, this.QtyReceiving, this.SerialData, this.convertedLotData];

    if ((message == 'SERIAL-CONTROLLED' || message == 'LOT-CONTROLLED') && this.QtyReceiving <= 0) {
      this.uiProviderService.presentToast('Error', 'Please enter quantity first');
      return;
    }

    const modal = await this.modalController.create({
      component: CommonSharedListPage,
      componentProps: { data: modalData },
    });

    modal.onDidDismiss().then((capturedData: any) => {
      if (capturedData.data) {
        let receivedData = capturedData.data;
        switch (message) {
          case 'UOM':
            this.uomCode = receivedData.data;
            break;
          case 'SUB-INV':
            this.subInvCode = receivedData.data;
            break;
          case 'LOCATOR':
            this.locatorCode = receivedData.data;
            break;
          case 'LOT-CONTROLLED':
            this.lotData = receivedData.data;
            break;
          case 'SERIAL-CONTROLLED':
            this.SerialData = receivedData.data;
            break;
          case 'REV':
            this.itemRevCode = receivedData.data;
            break;
        }
      }
    });

    await modal.present();
  }

  async loadItemsData() {
    try {
      this.itemData = [this.item];
      this.uomCode = this.itemData[0]?.ItemUom || '';
      this.subInvCode = this.itemData[0]?.DefaultSubInventoryCode || '';
      this.locatorCode = this.itemData[0]?.DefaultLocator || '';
      this.itemRevCode = this.itemData[0]?.ItemRevision || '';
      this.qtyRecieved = this.itemData[0]?.QtyOrdered || 0;
      this.qtyRemaining = this.itemData[0]?.QtyRemaining || 0;
    } catch (error) {
      console.error('Error loading data', error);
    }
  }

  onSubInvEdit() {
    this.subInvCode = '';
    this.locatorCode = '';
  }

  onSubInvChange(subInv: any) {
    this.subInvCode = subInv;
  }
}
