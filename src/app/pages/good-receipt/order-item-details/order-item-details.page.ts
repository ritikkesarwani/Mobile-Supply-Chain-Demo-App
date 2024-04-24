import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CommonSharedListPage } from 'src/app/common-shared-list/common-shared-list.page';
import { DatabaseService } from 'src/app/services/database.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-order-item-details',
  templateUrl: './order-item-details.page.html',
  styleUrls: ['./order-item-details.page.scss'],
})
export class OrderItemDetailsPage implements OnInit {

  item: any;
  newId: any;
  activatedSubscription!: Subscription;
  subInv: any;


  QtyReceiving: any = "";
  subInvName: string = '';
  locator: string = '';
  lot: string = '';
  userDetails: any;
  selectedOrg: any;
  orgDetails: boolean = false;
  useravailable: boolean = false;
  enableLot: boolean = false;
  apiResponse: any;
  hasNetwork: boolean = false;
  itemData: any[] = [];
  uomCode: string = '';
  subInvCode: string = '';
  locatorCode: string = '';
  itemRevCode: any;
  qtyRecieved: number = 0;
  qtyRemaining: number = 0;
  SerialData: any[] = [];
  convertedLotData: any;
  lotData: any[] = [];
  postitemSubscription!: Subscription;
  networkSubscription!: Subscription;
  docsForReceivingSubscription!: Subscription;


  constructor(
    private databaseService: DatabaseService,
    private router: Router,
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private uiService: UiService,
    private modalController: ModalController,
  ) { }

  async ngOnInit() {

    this.activatedSubscription = this.route.queryParams.subscribe((data) => {
      this.item = data['item']
      this.subInv = data['inventory']
    })
    this.item = await this.databaseService.getValue('selectedItem')
    // this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
    //   this.hasNetwork = networkStatus
    // })
    // this.loadItemsData();
  }

  async ionViewWillEnter() {

    this.activatedSubscription = this.route.queryParams.subscribe((data) => {
      this.item = data['item']
      this.subInv = data['inventory']
    })
    this.item = await this.databaseService.getValue('selectedItem')
    // this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
    //   this.hasNetwork = networkStatus
    // })
    // this.loadItemsData();
  }

  UpdateQty() {
    if (this.QtyReceiving <= 0) {
      this.uiService.presentToast('Error', 'Receipt Quantity can not be zero or empty', 'Danger');
      throw new Error;
    }
    else {
      if (this.item.DestinationType == "Inventory") {
        if (this.subInvCode == "" || this.subInvCode == null) {
          this.uiService.presentToast('Error', 'Please select Sub Inventory Code', 'Danger');
          throw new Error;
        }
        else if (this.locatorCode == "" || this.locatorCode == null) {
          this.uiService.presentToast('Error', 'Please select Locator Code', 'Danger');
          throw new Error;
        }
      }

      if (this.item.IsSerialControlled == "True") {
        if (this.SerialData.length == 0) {
          this.uiService.presentToast('Error', 'Please select Serial Number', 'Danger');
          throw new Error;
        }
      }
      else if (this.item.IsLotControlled == "True") {
        if (this.lotData.length == 0) {
          this.uiService.presentToast('Error', 'Please select Lot Number', 'Danger');
          throw new Error;
        }
      }
    }


    if (this.QtyReceiving <= this.item.QtyRemaining) {
      //  this.postTransaction();
    } else {
      this.uiService.presentToast('Error', 'QTY Tolerance is Exceeding', 'Danger');
    }
  }

  async goToCommonListPage(message: string) {
    let modalData: any[] = [message, this.subInvCode, this.item, this.QtyReceiving, this.SerialData, this.convertedLotData];

    if ((message == 'SERIAL-CONTROLLED' || message == 'LOT-CONTROLLED') && this.QtyReceiving <= 0) {
      this.uiService.presentToast('Error', 'Please enter quantity first', 'Danger');
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
            if (this.lotData.length > 0) {
              this.buildLotData();
            }
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
  }

  buildLotData() {
    this.convertedLotData = [];
    if (this.lotData) {
      for (const section of this.lotData) {
        const lotQuantity = section.get('lotQuantity').value;
        const lotCode = section.get('lotCode').value;
        const convertedObject = {
          GradeCode: '',
          LotExpirationDate: '',
          LotNumber: lotCode,
          ParentLotNumber: '',
          SecondaryTransactionQuantity: '',
          TransactionQuantity: lotQuantity,
        };
        this.convertedLotData.push(convertedObject);
      }
    }

    return this.convertedLotData;

  }




  onSubInvEdit() {
    this.subInvCode = "";
    this.locatorCode = "";
  }

  onSubInvChange(subInv: any) {
    this.subInvCode = subInv;
  }

}
