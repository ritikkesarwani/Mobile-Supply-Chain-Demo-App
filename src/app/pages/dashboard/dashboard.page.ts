import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  isOrgLoaded = true; // Assuming this variable is set dynamically based on organization data

  totalReceipts: number = 120; // Assuming these variables are initialized and updated elsewhere in the code
  totalTrans: number = 50;

  constructor(private navCtrl: NavController,private databaseService: DatabaseService,public alertController: AlertController, private route: Router) { }

  ngOnInit() {
    // Fetch and update totalReceipts and totalTrans values from service or API call
    // this.totalReceipts = ...
    // this.totalTrans = ...
  }

  goToGoodsReceipt() {
    // Navigate to GoodsReceipt page
    this.navCtrl.navigateForward('/good-receipt');
  }

  goToTransHistory() {
    // Navigate to TransHistory page
    this.navCtrl.navigateForward('/trans-history');
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
