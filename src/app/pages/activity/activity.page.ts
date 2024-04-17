import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TableNames } from 'src/app/constants/constants';
import { DatabaseService } from 'src/app/services/database.service';
import { MasterConfigService } from 'src/app/services/master-config.service';
import { SharedService } from 'src/app/services/shared.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {


  responsibilities: any;

  organisation: any;
  isOrgLoaded: boolean = false;
  defaultOrgId: any;
  loadLocations: string = 'Locations';
  loadLocationStatus: boolean = true;
  loadDocsForReceiving: string = 'Docs For Receiving';
  loadDocsForReceivingStatus: boolean = true;
  loadSubInventoryStatus: boolean = true;
  loadSubInventoryMessage: string = 'Sub Inventories';
  subInventories: any;
  isRespLoaded: boolean = false;
  locationsData: any;
  docsForReceivingColumns: any;
  locations: number = 0
  docs: number = 0
  metadataLoaded: boolean = false;
  syncAgain: boolean = false;
  success: boolean = true;
  isOnline: boolean = true;
  loadGlPeriodsMessage: string = 'GL Periods';
  loadGlPeriodStatus: boolean = true;
  loadUomMessage: string = 'UOM';
  loadUomStatus: boolean = true;
  loadRevisionsMessage: string = 'Revisions';
  loadRevisionsStatus: boolean = true;
  loadPurchasingPeriodsMessage: string = 'Purchasing Periods';
  loadPurchasingPeriodsStatus: boolean = true;
  loadReasonsMessage: string = 'Reasons';
  loadReasonsStatus: boolean = true;
  loadLocatorsMessage: string = 'Locators';
  loadLocatorsStatus: boolean = true;
  loadLotsMessage: string = 'Lots';
  loadLotsStatus: boolean = true;
  LoadTransaction: boolean = true;
  loadSerialsMessage: string = 'Serials';
  loadSerialsStatus: boolean = true;


  constructor(
    private navCtrl: NavController,
    private databaseService: DatabaseService,
    private uiService: UiService,
    private masterConfigService :MasterConfigService,
    private transactionService: TransactionService,
    private route:Router,
    private sharedService: SharedService
  ) { }

  async onLogout() {
    this.LoadTransaction = false;
    await this.databaseService.clearStorage();
    this.route.navigate(['/login'])

  }

  async ngOnInit() {
    try {
      this.organisation = await this.databaseService.getValue('selectedOrg')
      this.isOrgLoaded = true;
    } catch (error) {
      this.uiService.presentAlert('Error', 'No Organisation data available');
      this.onLogout();
    }
    try {
      this.defaultOrgId = await this.databaseService.getValue('orgId')
    } catch (error) {
      this.uiService.presentAlert('Error', 'No Organisation data available');
      this.onLogout();
    }
    try {
      this.responsibilities = await this.databaseService.getValue('responsibilities')
      this.isRespLoaded = true;
    } catch (error) {
      this.uiService.presentAlert('Error', 'No Responsibilities data available');
      this.onLogout();
    }
    await this.sharedService.createTransactionHistoryTable(TableNames.TRANSACTIONS);

  }

  async ionViewDidEnter() {
    if(this.isOnline){
      try{
        const identifier = await this.masterConfigService.masterConfigApiCall(this.defaultOrgId, this.organisation);
        console.log(identifier,'identifer')
        const LoadTransaction = identifier.every((data: any) => data === true);
        if (LoadTransaction) {
          const transactionStatus = await this.transactionService.getTransactionalData(this.defaultOrgId, this.organisation);
          const forwardToDashboard = transactionStatus.every((data: any) => data === true);
          if (forwardToDashboard) {
            this.navigateToDashboard();
          } else {
            this.syncAgain = true
          }
        } else {
          this.syncAgain = true
        }
      } catch (error) {
        console.error('ion view', error);
      }
    } else {
      this.uiService.presentToast('Error', 'No network available');
      this.syncAgain = true
    } 
  }

  async onSyncAgain() {
    this.ionViewDidEnter();
    this.syncAgain = false;
  }
  

  navigateToDashboard() {
    if (this.success) {
      this.navCtrl.navigateForward('/dashboard');
    } else {
      this.syncAgain = true
    }
  }
}
