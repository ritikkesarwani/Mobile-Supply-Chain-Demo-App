import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { LoginService } from 'src/app/services/login.service';
import { NodeApiService } from 'src/app/services/node-api.service';

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.page.html',
  styleUrls: ['./org-list.page.scss'],
})
export class OrgListPage implements OnInit {

  ngOnInit() {
    this.allOrg();
  }

  selectedOrg: any = null;
  allOrganization: boolean = false;
  organisations: any[] = [];


  // Organizations: any[] = [
  //   { id: 1, shortForm: 'Org1', name: 'Organization 1' },
  //   { id: 2, shortForm: 'Org2', name: 'Organization 2' },
  //   { id: 3, shortForm: 'Org3', name: 'Organization 3' },
  // ];

  constructor(
    private nodeApiService: NodeApiService,
    private navCtrl: NavController,
    private loginService: LoginService,
    private databaseService: DatabaseService
  ) { }

  async allOrg() {
    let orgId = await this.databaseService.getValue('orgId');
    console.log(orgId, "ritik")

    if (!this.allOrganization) {
      this.nodeApiService.getAllOrganization(orgId).subscribe({
        next: async (data: any) => {
          console.log(data.status)

          if (data && data.status === 200) {
            const allOrgData = data.body;

            const [headers, ...dataWithoutHeaders] = allOrgData;
            // Convert data to key-value pairs
            const orgList = dataWithoutHeaders.map((dataRow: { [x: string]: any; }) => {
              const org: any = {};
              headers.forEach((header: string | number, index: number) => {
                org[header] = dataRow[index];
              });
              return org;
            });

            this.organisations = orgList;

            console.log(this.organisations)

          } else {
            console.log("Error from the server")
          }

        },
        error: (error: any) => console.error('Error occurred:', error),
        complete: () => console.log('Request completed')
      })
    }
    else {
      console.log("Data loaded previously")
    }
  }








  onSelect(Organization: any) {
    if (this.selectedOrg && this.selectedOrg.id === Organization.id) {
      // Deselect the organization if it's already selected
      this.selectedOrg = null;
    } else {
      // Select the organization if it's not already selected
      this.selectedOrg = Organization;
    }
  }


  confirm() {
  }



}
