import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { TableNames } from 'src/app/constants/constants';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  isOrgLoaded = true; // Assuming this variable is set dynamically based on organization data

  totalReceipts: string = '0'; // Assuming these variables are initialized and updated elsewhere in the code
  totalTrans: string = '0';
  totalTransactions: any;

  constructor(private navCtrl: NavController,private databaseService: DatabaseService,public alertController: AlertController, private route: Router) { }

  async ngOnInit() {
    // Fetch and update totalReceipts and totalTrans values from service or API call
    // this.totalReceipts = ...
    // this.totalTrans = ...]
    try {
      const trans_data = await this.databaseService.getDataFromTable(TableNames.TRANSACTIONS)
      if (trans_data.rows.length > 0) {
        this.totalTrans = trans_data.rows.length;
      } else {
        this.totalTrans = '0';
      }
    } catch (error) {
      this.totalTrans = '0';
    }
  }

  async ionViewDidEnter() {
    try {
      const trans_data = await this.databaseService.getDataFromTable(TableNames.TRANSACTIONS)
      if (trans_data.rows.length > 0) {
        this.totalTrans = trans_data.rows.length;
      } else {
        this.totalTrans = '0';
      }
    } catch (error) {
      this.totalTrans = '0';
    }
    
    const query = `SELECT PoNumber, PoType, VendorName, LastUpdateDate FROM ${TableNames.DOCS4RECEIVING} 
                    WHERE SourceTypeCode='PO' 
                    AND PoNumber IS NOT NULL
                    ORDER BY PoNumber`;
    try {
      const docsForReceivingData = await this.databaseService.executeCustomQuery(query);
      if (docsForReceivingData.rows.length > 0) {
        this.totalReceipts = docsForReceivingData.rows.length.toString();
      } else {
        this.totalReceipts = '0';
      }
    } catch (error) {
      this.totalReceipts = '0';
    }
  }
  

  goToGoodsReceipt() {
    // Navigate to GoodsReceipt page
    this.route.navigate(['/orders-list']);
    //this.navCtrl.navigateForward('/orders-list');
  }

  goToTransHistory() {
    // Navigate to TransHistory page
    this.navCtrl.navigateForward('/trans-hist');
  }
  
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Logout!!',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.onLogout();
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }
  
  
  async onLogout() {
    await this.databaseService.clearStorage();
    this.route.navigate(['/login'])
  }
}
