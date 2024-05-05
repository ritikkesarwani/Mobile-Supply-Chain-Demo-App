import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommonSharedListPage } from 'src/app/common-shared-list/common-shared-list.page';
import { UiService } from 'src/app/services/ui.service';
import { DatabaseService } from 'src/app/services/database.service';
import { ApiSettings, Color, MESSAGES, TableNames } from 'src/app/constants/constants';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { formatDate } from '@angular/common';
import { NodeApiService } from 'src/app/services/node-api.service';
import { NetworkService } from 'src/app/services/network.service';

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
  postitemSubscription!: Subscription;
  networkSubscription!: Subscription;

  constructor(
    private modalController: ModalController,
    private uiProviderService: UiService,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private sharedService: SharedService,
    private apiService: NodeApiService,
    private networkService: NetworkService,
    private router: Router

  ) {
    this.databaseService.getValue('loginData').then((val) => {
      this.userDetails = val[0];
      this.useravailable = true
    })
    this.databaseService.getValue('selectedOrg').then((val) => {

      this.selectedOrg = val
      console.log(this.selectedOrg,'selected org')
      this.orgDetails = true
    })
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data) => {
      this.item = data['item'];
      this.subInvCode = data['inventory'];
    });
    this.item = await this.databaseService.getValue('selectedItem');
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.hasNetwork = networkStatus
    })
    this.databaseService.getValue('loginData').then((val) => {
      this.userDetails = val[0];
      this.useravailable = true
    })
    this.databaseService.getValue('selectedOrg').then((val) => {

      this.selectedOrg = val
      console.log(this.selectedOrg,'selected org')
      this.orgDetails = true
    })
    this.loadItemsData();
  }

  async ionViewDidEnter() {
    this.activatedRoute.queryParams.subscribe((data) => {
      this.item = data['item'];
      this.subInvCode = data['inventory'];
    });
    this.item = await this.databaseService.getValue('selectedItem');
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.hasNetwork = networkStatus
    })
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
            this.lotData = capturedData.data.selectedLot[0];
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

    console.log(this.subInvCode)

    await modal.present();
  }

  UpdateQty() {
    if (this.QtyReceiving <= 0) {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Receipt Quantity can not be zero or empty', Color.ERROR);
      throw new Error;
    }
    else {
      if (this.item.DestinationType == "Inventory") {
        if (this.subInvCode == "" || this.subInvCode == null) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Sub Inventory Code', Color.ERROR);
          throw new Error;
        }
        else if (this.locatorCode == "" || this.locatorCode == null) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Locator Code', Color.ERROR);
          throw new Error;
        }
      }

      if (this.item.IsSerialControlled == "True") {
        if (this.SerialData.length == 0) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Serial Number', Color.ERROR);
          throw new Error;
        }
      }
      else if (this.item.IsLotControlled == "True") {
        if (this.lotData.length == 0) {
          this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please select Lot Number', Color.ERROR);
          throw new Error;
        }
      }
    }

    if (this.QtyReceiving <= this.item.QtyRemaining) {
      this.postTransaction();
    } else {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'QTY Tolerance is Exceeding', Color.ERROR);
    }
  }

  async postTransaction() {
    if (!this.QtyReceiving) {
      this.uiProviderService.presentToast(MESSAGES.ERROR, 'Please enter quantity receiving');
      return;
    }
    const generatedPayload = this.buildGoodsReceiptPayload(this.item);
    console.log(generatedPayload,'generate payload')
    let transactionPayload = this.transactionObject();
    this.uiProviderService.presentLoading('waiting for response...');
    if (this.hasNetwork) {
      this.postitemSubscription = this.apiService.performPost(ApiSettings.CREATE_GOODS_RECEIPT, generatedPayload).subscribe({
        next: async (resp: any) => {
          const response = resp['Response']
          if (response[0].RecordStatus === 'S') {
            transactionPayload.status = response[0].RecordStatus;
            transactionPayload.receiptInfo = response[0].ReceiptNumber;

            this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Goods receipt created successfully');

            this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
            this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
          } else {
            transactionPayload.status = response[0].RecordStatus;
            transactionPayload.error = response[0].Message;
            this.uiProviderService.presentToast(MESSAGES.ERROR, response[0].Message, Color.ERROR);
          }
         // await this.sharedService.performDeltaSync(TableNames.DOCS4RECEIVING, this.selectedOrg);
        },
        error: (error: any) => {
          console.error("error while performing post transaction: ", error)
        },
        complete: async () => {
          try {
            await this.sharedService.insertTransaction(transactionPayload, TableNames.TRANSACTIONS);
          } catch (error) {
            console.error("error while inserting transaction: ", error)
          }
          this.uiProviderService.dismissLoading();
        }
      })
    } else {
      await this.sharedService.insertTransaction(transactionPayload, TableNames.TRANSACTIONS);
      this.uiProviderService.presentToast(MESSAGES.SUCCESS, 'Goods receipt saved offline');
      this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.QtyReceiving);
      this.item.QtyReceived = this.item.QtyReceived + parseInt(this.QtyReceiving);
      this.uiProviderService.dismissLoading();
    }
  }

  transactionObject() {
    const offlinePayload = {
      poNumber: this.item.PoNumber,
      titleName: 'Goods Receipt',
      syncStatus: new Date(),
      createdTime: new Date(),
      quantityReceived: this.QtyReceiving,
      receiptInfo: 'N/A',
      error: '',
      status: 'local',
      shipLaneNum: this.item.PoShipmentNumber,
      vendorId: this.item.VendorId,
      unitOfMeasure: this.item.ItemUom,
      poHeaderId: this.item.PoHeaderId,
      poLineLocationId: this.item.PoLineLocationId,
      poLineId: this.item.PoLineId,
      poDistributionId: this.item.PoDistributionId,
      destinationTypeCode: this.item.DestinationType,
      itemNumber: this.item.ItemNumber,
      Subinventory: this.subInvCode,
      Locator: this.locatorCode,
      ShipmentNumber: "",
      LpnNumber: "",
      OrderLineId: "",
      SoldtoLegalEntity: "",
      SecondaryUnitOfMeasure: "",
      ShipmentHeaderId: "",
      ItemRevision: this.itemRevCode,
      ReceiptSourceCode: "",
      MobileTransactionId: "",
      TransactionType: "RECEIVE",
      AutoTransactCode: "DELIVER",
      OrganizationCode: "",
      serialNumbers: this.SerialData.length > 0 ? this.SerialData.join(',') : " ",
      lotQuantity: this.lotData.length > 0 ? this.convertedLotData.map((section: any) => section.TransactionQuantity).join(',') : " ",
      lotCode: this.lotData.length > 0 ? this.convertedLotData.map((section: any) => section.LotNumber).join(',') : " ",
    };
    return offlinePayload;
  }

  buildGoodsReceiptPayload(item: any) {
    const requestBody: any = {
      Input: {
        parts: [
          {
            id: 'part1',
            path: '/receivingReceiptRequests',
            operation: 'create',
            payload: {
              ReceiptSourceCode: item.ReceiptSourceCode,
              OrganizationCode: item.OrganizationCode,
              //EmployeeId: this.userDetails.PERSON_ID,
              EmployeeId: '32323',
              BusinessUnitId: this.selectedOrg.BusinessUnitId,
              ReceiptNumber: '',
              BillOfLading: item.BillOfLading,
              FreightCarrierName: item.FreightCarrierName,
              PackingSlip: item.Packingslip,
              WaybillAirbillNumber: item.WayBillAirBillNumber,
              ShipmentNumber: item.ShipmentNumber,
              ShippedDate: '',
              VendorSiteId: item.VendorSiteId,
              VendorId: item.VendorId,
              attachments: [],
              CustomerId: item.CustomerId,
              InventoryOrgId: this.selectedOrg.InventoryOrgId_PK,
              DeliveryDate: '31-Jan-2024 12:00:00',
              ResponsibilityId: '20634',
              UserId: this.userDetails.USER_ID,
              DummyReceiptNumber: new Date().getTime(),
              BusinessUnit: 'Vision Operations',
              InsertAndProcessFlag: 'true',
              lines: [
                {
                  ReceiptSourceCode: item.ReceiptSourceCode,
                  MobileTransactionId: new Date().getTime(),
                  TransactionType: 'RECEIVE',
                  AutoTransactCode: 'DELIVER',
                  OrganizationCode: item.OrganizationCode,
                  DocumentNumber: item.PoNumber,
                  DocumentLineNumber: item.PoShipmentNumber,
                  ItemNumber: item.ItemNumber,
                  TransactionDate: formatDate(new Date(), 'dd-MMM-yyyy HH:mm:ss', 'en-US'),
                  Quantity: this.QtyReceiving,
                  UnitOfMeasure: this.uomCode,
                  SoldtoLegalEntity: item.SoldtoLegalEntity,
                  SecondaryUnitOfMeasure: '',
                  ShipmentHeaderId: item.ShipmentHeaderId,
                  ItemRevision: this.itemRevCode,
                  POHeaderId: item.PoHeaderId,
                  POLineLocationId: item.PoLineLocationId,
                  POLineId: item.PoLineId,
                  PODistributionId: item.PoDistributionId,
                  ReasonName: item.ReasonName,
                  Comments: item.Comments,
                  ShipmentLineId: item.ShipmentLineId,
                  transactionAttachments: [],
                  lotItemLots: this.convertedLotData,
                  serialItemSerials: this.SerialData.map((serial: any) => ({
                    FromSerialNumber: serial,
                    ToSerialNumber: serial
                  })),
                  lotSerialItemLots: [],
                  ExternalSystemTransactionReference: 'Mobile Transaction',
                  ReceiptAdviceHeaderId: item.ReceiptAdviceHeaderId,
                  ReceiptAdviceLineId: item.ReceiptAdviceLineId,
                  TransferOrderHeaderId: item.TransferOrderHeaderId,
                  TransferOrderLineId: item.TransferOrderLineId,
                  PoLineLocationId: item.PoLineLocationId,
                  DestinationTypeCode: item.DestinationType,
                  Subinventory: this.subInvCode,
                  Locator: this.locatorCode,
                  ShipmentNumber: item.ShipmentNumber,
                  LpnNumber: item.LpnNumber,
                  OrderLineId: item.OrderLineId,
                },
              ],
            },
          },
        ],
      },
    };
    return requestBody;
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

  onLocatorChange(locator: any) {
    this.locatorCode = locator;
  }

  onLocatorEdit() {
    this.locatorCode = ""
  }


  onQuantityChange(newQuantity: number) {
    this.QtyReceiving = newQuantity;
  }

  goToBack() {
    this.router.navigate(['/order-items']);
  }

}
