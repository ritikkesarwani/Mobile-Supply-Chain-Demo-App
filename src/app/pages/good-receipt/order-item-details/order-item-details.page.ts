import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-order-item-details',
  templateUrl: './order-item-details.page.html',
  styleUrls: ['./order-item-details.page.scss'],
})
export class OrderItemDetailsPage implements OnInit {

  item: any;
  newId: any;
  activatedSubscription: any;
  subInv: any;

  constructor(private databaseService: DatabaseService,private router:Router, public navCtrl:NavController, private route:ActivatedRoute) { }

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


}
