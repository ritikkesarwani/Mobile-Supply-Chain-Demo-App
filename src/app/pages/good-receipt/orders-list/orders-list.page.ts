import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  page = 1;
  filterText: string = '';
  isDataLoading: boolean = false;


  constructor(
    private navCtrl: NavController,
    private databaseService: DatabaseService, 
    ) { }

  // Fetch receipt purchase order items from the database
  async ngOnInit() {
    this.getReceiptPurchaseOrderItems();
  }

  // Refresh the data whenever the view is entered
  ionViewWillEnter() {
    this.getReceiptPurchaseOrderItems();
  }
  async getReceiptPurchaseOrderItems() {
    // Define the SQL query to fetch receipt purchase order items
    const query = `
      SELECT *,
      (SELECT COUNT(*) FROM ${TableNames.DOCS4RECEIVING} sub WHERE sub.PoHeaderId = main.PoHeaderId) AS count
      FROM (
        SELECT *,
        COUNT(*) AS count
        FROM ${TableNames.DOCS4RECEIVING}
        WHERE PoNumber IS NOT NULL 
        AND PoHeaderId IS NOT NULL
        GROUP BY PoHeaderId
      ) main
      LIMIT ${this.page * 8}, 8
    `;

    try {
      // Execute the query against the database
      const queryResult = await this.databaseService.executeCustomQuery(query);
      // Check if there are any results returned from the query
      if (queryResult.rows.length > 0) {
        // Iterate over the rows returned from the query
        for (let i = 0; i < queryResult.rows.length; i++) {
          const row = queryResult.rows.item(i);
          // Push each row to the receiptsDetails array
          this.receiptsDetails.push(row);
        }
        // Assign the receiptsDetails array to receipts and filteredReceipts
        this.receipts = [...this.receiptsDetails];
        this.filteredReceipts = [...this.receiptsDetails];
        // Increment the page number for the next query
        this.page++;
      }
    } catch (error) {
      console.error("Error fetching receipt purchase order items:", error);
    }
  }

  async loadMoreData(event: any) {
    try {
      // Check if the user is currently searching
      if (this.searchText.trim() === '') {
        setTimeout(async () => {
          await this.getReceiptPurchaseOrderItems();
          event.target.complete();
        }, 3000); // 3000 milliseconds = 3 seconds
      } else {
        // If searching, do not load more data
        console.log("Skipping data load while searching.");
        event.target.complete();
      }
    } catch (error) {
      console.error("Error fetching more data:", error);
      // If there's an error, complete the infinite scroll event to avoid getting stuck in loading state
      event.target.complete();
    }
  }

  async loadFullDocs() {
    try {
      const query = `SELECT * FROM ${TableNames.DOCS4RECEIVING} 
    WHERE PoNumber IS NOT NULL 
    AND 
    PoHeaderId IS NOT NULL
    GROUP BY PoNumber`;


      const docs = await this.databaseService.executeCustomQuery(query)
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

  onSearch(event: any) {
    this.searchText = event.target.value.trim().toLowerCase();

    if (this.searchText === '') {
      // If the search text is empty, display all receipts
      this.filteredReceipts = [...this.receiptsDetails];
    } else {
      // Filter receipts based on the search text
      this.filteredReceipts = this.receiptsDetails.filter(item =>
        item.PoNumber.toString().toLowerCase().includes(this.searchText)
      );
    }
  }

  // Clear the search text and display all receipts
  onClearSearch() {
    this.searchText = '';
    this.filteredReceipts = [...this.receiptsDetails];
  }

  async goToItems(doc: any) {
    await this.databaseService.setValue('selectedPo', doc);
    this.navCtrl.navigateForward('/order-items', {
      queryParams: {
        doc
      }
    });
  }

  goToDashboard() {
    this.navCtrl.navigateBack('/dashboard');
  }
}
