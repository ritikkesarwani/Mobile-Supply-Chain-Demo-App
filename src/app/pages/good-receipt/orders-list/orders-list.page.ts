
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
  filteredReceipts: any[] = [];
  receipts: any[] = [];
  receiptsDetails: any[] = [];
  searchText: string = '';
  fullDocs: any[] = [];

  constructor(private navCtrl: NavController, private databaseService: DatabaseService) { }

  // Fetch receipt purchase order items from the database
  async ngOnInit() {
    this.getReceiptPurchaseOrderItems();
  }

  // Refresh the data whenever the view is entered
  ionViewWillEnter() {
    this.getReceiptPurchaseOrderItems();
  }

  // Function to fetch receipt purchase order items from the database
  async getReceiptPurchaseOrderItems() {
    // Define the SQL query to fetch receipt purchase order items
    const query = `
      SELECT * FROM ${TableNames.DOCS4RECEIVING} 
      WHERE PoNumber IS NOT NULL 
      AND PoHeaderId IS NOT NULL
    `;

    try {
      // Execute the query against the database
      const queryResult = await this.databaseService.executeCustonQuery(query);

      // Check if there are any results returned from the query
      if (queryResult.rows.length > 0) {
        // Create a Map to store the counts of each PoHeaderId
        const poHeaderCounts = new Map();

        // Iterate over the rows returned from the query
        for (let i = 0; i < queryResult.rows.length; i++) {
          const row = queryResult.rows.item(i);

          // Check if the PoHeaderId is unique or not empty
          if (row.PoHeaderId && !poHeaderCounts.has(row.PoHeaderId)) {
            // Add the item to the receiptsDetails array with count = 1
            this.receiptsDetails.push({ ...row, count: 1 });
            // Mark the PoHeaderId as seen in the poHeaderCounts Map
            poHeaderCounts.set(row.PoHeaderId, 1);
          } else if (row.PoHeaderId) {
            // If the PoHeaderId is not unique, update the count in the existing item
            const count = poHeaderCounts.get(row.PoHeaderId) || 0;
            poHeaderCounts.set(row.PoHeaderId, count + 1);

            // Find the existing item in receiptsDetails and update its count
            const existingItem = this.receiptsDetails.find(item => item.PoHeaderId === row.PoHeaderId);
            if (existingItem) {
              existingItem.count = count + 1;
            }
          }
        }

        // Assign the receiptsDetails array to receipts and filteredReceipts
        this.receipts = [...this.receiptsDetails];
        this.filteredReceipts = [...this.receiptsDetails];
      }
    } catch (error) {
      console.error("Error fetching receipt purchase order items:", error);
    }
  }

  loadMoreData(event: any) {
    // this.offset += 10;
    // this.getReceiptPurchaseOrderItems();
    // event.target.complete();
  }

  async loadFullDocs() {
    try {
      const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
    WHERE PoNumber IS NOT NULL 
    AND 
    PoHeaderId IS NOT NULL
    GROUP BY PoNumber`;


      const docs = await this.databaseService.executeCustonQuery(query)
      if (docs.rows.length > 0) {
        for (let i = 0; i < docs.rows.length; i++) {
          this.fullDocs.push(docs.rows.item(i));
        }
      } else {
        console.log('docs for receiving has No data');
      }
    } catch (error) {
      console.error(error)
    }
  }


  // Filter the receipts based on the search text
  onSearch(event: any) {
    this.filteredReceipts = this.receipts.filter(item =>
      item.PoNumber.toString().toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Clear the search text and display all receipts
  onClearSearch() {
    this.searchText = '';
    this.filteredReceipts = [...this.receipts];
  }

  // Navigate to the dashboard page
  goToDashboard() {
    this.navCtrl.navigateBack('/dashboard');
  }
}
