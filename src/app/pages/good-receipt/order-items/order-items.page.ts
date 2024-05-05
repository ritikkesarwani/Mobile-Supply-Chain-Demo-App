import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Color, MESSAGES, TableNames } from 'src/app/constants/constants';
import { DatabaseService } from 'src/app/services/database.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.page.html',
  styleUrls: ['./order-items.page.scss'],
})
export class OrderItemsPage implements OnInit {

  items: any[] = [];
  doc: any;
  docsForReceiving: any[] = [];
  Orders: any[] = [];
  searchText: string = '';
  numberOfItems: number = 0;
  activatedRouteSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private navCtrl: NavController,
    private router: Router,
    private uiService: UiService
  ) {
    this.activatedRouteSub = new Subscription();
  }

  async ngOnInit() {
    this.activatedRouteSub = this.route.queryParams.subscribe((data) => {
      this.doc = data['doc'];
    });
    this.doc = await this.databaseService.getValue('selectedPo');
    await this.getItemsByPoHeaderId();
  }

  async getItemsByPoHeaderId() {
    const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
                  WHERE SourceTypeCode='PO' 
                  AND PoNumber = '${this.doc.PoNumber}'`;
    try {
      const data = await this.databaseService.executeCustomQuery(query);
      if (data.rows.length > 0) {
        this.numberOfItems = data.rows.length;
        for (let i = 0; i < data.rows.length; i++) {
          this.docsForReceiving.push(data.rows.item(i));
        }
        this.Orders = [...this.docsForReceiving];
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.log("could not get data from docs for receiving: ", error);
    }
  }

  goToList() {
    this.router.navigate(['/orders-list']);
  }

 
  onScan(event: any) {
    if (event){
      const item = this.docsForReceiving.find((item) => {
        return (item.ItemNumber.toLowerCase() === event.toLowerCase())
      })
      if (item) {
        this.goToItemDetails(item);
      } else {
        this.uiService.presentToast(MESSAGES.ERROR, `Item ${event} not found`, Color.ERROR);
      }
    } else {
      this.uiService.presentToast(MESSAGES.ERROR, `Scanner does not scan a value correctly`, Color.ERROR);
    }
  }

  onClearSearch(event: any) {
    event.detail.value = "";
    this.getItemsByPoHeaderId();
  }

  onSearch(event: any) {
    this.Orders = this.docsForReceiving.filter((order) => {
      return (order.ItemNumber.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    })
  }

  async goToItemDetails(item: any) {
    await this.databaseService.setValue('selectedItem', item);
    this.router.navigate(['/order-item-details'], {
    queryParams: {
        item
      }
    });
  }


  // async goToItemDetails(item: any) {
  //   await this.databaseService.setValue('selectedItem', item);
  //   this.router.navigate(['/order-item-details'], {
  //     queryParams: { item }
  //   });
  // }
}
