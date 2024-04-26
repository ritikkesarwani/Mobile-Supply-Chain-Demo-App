import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { NodeApiService } from 'src/app/services/node-api.service';

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.page.html',
  styleUrls: ['./org-list.page.scss'],
})
export class OrgListPage implements OnInit {
  selectedOrg: any = null;
  allOrganization: boolean = false;
  organisations: any[] = [];
  filteredOrganisations: any[] = [];
  searchQuery: string = '';

  constructor(
    private nodeApiService: NodeApiService,
    private navCtrl: NavController,
    private databaseService: DatabaseService
  ) { }

  ngOnInit() {
    this.loadAllOrganizations();
  }

  async loadAllOrganizations() {
    let orgId = await this.databaseService.getValue('orgId');

    if (!this.allOrganization) {
      this.nodeApiService.getAllOrganization(orgId).subscribe({
        next: async (data: any) => {
          
          if (data && data.status === 200) {
            const allOrgData = data.body;

            const [headers, ...dataWithoutHeaders] = allOrgData;
            // Convert data to key-value pairs
            const orgList = dataWithoutHeaders.map((dataRow: any) => {
              const org: any = {};
              headers.forEach((header: string | number, index: number) => {
                org[header] = dataRow[index];
              });
              return org;
            });

            this.organisations = orgList;
            this.filteredOrganisations = orgList;

          } else {
            console.log("Error from the server");
          }
        },
        error: (error: any) => console.error('Error occurred:', error),
        complete: () => console.log('Request completed')
      });
    }
    else {
      console.log("Data loaded previously");
    }
  }

  onSelect(organization: any) {
    this.selectedOrg = organization;
  }

  async confirm() {
    if (this.selectedOrg) {
      await this.databaseService.setValue('selectedOrg', this.selectedOrg);
      await this.databaseService.setValue('selectedOrgInvCode', this.selectedOrg.InventoryOrgCode);
      this.navCtrl.navigateForward('/activity');
    }
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredOrganisations = this.organisations.filter(org =>
      org.InventoryOrgCode.toLowerCase().includes(searchTerm) ||
      org.InventoryOrgName.toLowerCase().includes(searchTerm)
    );
  }

  onClearSearch() {
    this.filteredOrganisations = this.organisations;
  }

  async handleRefresh(event: any) {
    setTimeout(() => {
      this.loadAllOrganizations();
      this.searchQuery = '';
      event.detail.complete();
    }, 2000);
  }

}
