import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TableNames } from 'src/app/constants/constants';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.page.html',
  styleUrls: ['./orders-list.page.scss'],
})
export class OrdersListPage implements OnInit {

  constructor(private navCtrl: NavController, private databaseService: DatabaseService) { }

  receipts: any[] = [];
  receiptsDetails: any[] = [];
  countOfItems: any;



  async ngOnInit() {
    this.getReceiptPurchaseOrderItems();
  }

  async getReceiptPurchaseOrderItems() {
    const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
      WHERE PoNumber IS NOT NULL 
      AND PoHeaderId IS NOT NULL`;
  
    try {
      const queryResult = await this.databaseService.executeCustonQuery(query);
  
      if (queryResult.rows.length > 0) {
        const poHeaderCounts = new Map(); // Using Map to store PoHeaderId counts
  
        for (let i = 0; i < queryResult.rows.length; i++) {
          const row = queryResult.rows.item(i);
  
          // Check if PoHeaderId is unique or not empty
          if (row.PoHeaderId && !poHeaderCounts.has(row.PoHeaderId)) {
            this.receiptsDetails.push({ ...row, count: 1 }); // Add count property to item
            poHeaderCounts.set(row.PoHeaderId, 1); // Mark PoHeaderId as seen
          } else if (row.PoHeaderId) {
            const count = poHeaderCounts.get(row.PoHeaderId) || 0;
            poHeaderCounts.set(row.PoHeaderId, count + 1); // Increment count for existing PoHeaderId
            
            // Update count property for existing PoHeaderId item
            const existingItemIndex = this.receiptsDetails.findIndex(item => item.PoHeaderId === row.PoHeaderId);
            if (existingItemIndex !== -1) {
              this.receiptsDetails[existingItemIndex].count = count + 1;
            }
          }
        }
  
        // console.log("Counts for each PoHeaderId:", poHeaderCounts);
        this.receipts = [...this.receiptsDetails];
        // console.log("receipt", this.receipts)
      }
    } catch (error) {
      // console.error("Error fetching receipt purchase order items:", error);
    }
  }
  

  
  
  
  goToDashboard() {
    this.navCtrl.navigateBack('/dashboard');
  }
}
