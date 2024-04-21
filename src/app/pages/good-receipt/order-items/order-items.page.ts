import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TableNames } from 'src/app/constants/constants';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.page.html',
  styleUrls: ['./order-items.page.scss'],
})
export class OrderItemsPage implements OnInit {

  items: any[] = [];
  PoNumber: string | null | undefined;
  doc!: any
  docsForReceiving: any[] = []
  Orders: any[] = []
  searchText: string = ''
  numberOfItems: number = 0
  activatedRouteSub!: Subscription


  constructor(private route: ActivatedRoute, private databaseService: DatabaseService, private navCtrl: NavController, private router: Router) { }

  // ngOnInit() {
  //   this.route.paramMap.subscribe(params => {
  //     this.PoNumber = params.get('PoNumber');
  //     this.getItemsByPoHeaderId(this.PoNumber);
  //   });
  
  //   this.PoNumber = this.route.snapshot.paramMap.get('PoNumber');
  // }

  async ngOnInit() {
    
    this.activatedRouteSub = this.route.queryParams.subscribe((data)=>{
      this.doc = data['doc'];
    })
    this.doc = await this.databaseService.getValue('selectedPo')
    await this.getItemsByPoHeaderId();
  }




  async getItemsByPoHeaderId() {
    const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
                  WHERE SourceTypeCode='PO' 
                  And 
                  PoNumber = '${this.doc.PoNumber}'
                  `;
    try {
      const data = await this.databaseService.executeCustonQuery(query)
      if (data.rows.length > 0) {
        this.numberOfItems = data.rows.length
        for (let i = 0; i < data.rows.length; i++) {
          this.docsForReceiving.push(data.rows.item(i));
        }
        this.Orders = [...this.docsForReceiving]
        console.log(this.Orders)
      } else {
        console.log('No data');
      }
    } catch (error) {
      console.log("could not get data from docs for receiving: ", error);
    }
  }

  goToList() {
    this.router.navigate(['/orders-list'])
  }

  async goToItemDetails(item: any) {
    await this.databaseService.setValue('selectedItem', item);
    this.router.navigate(['/order-item-details'], {
      queryParams: {
        item
      }
    });
  }

}