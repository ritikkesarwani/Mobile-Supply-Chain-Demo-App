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

  Organizations: any[] = [
    { id: 1, shortForm: 'Org1', name: 'Organization 1' },
    { id: 2, shortForm: 'Org2', name: 'Organization 2' },
    { id: 3, shortForm: 'Org3', name: 'Organization 3' },
  ];

  constructor(
    private nodeApiService: NodeApiService,
    private navCtrl: NavController,
    private loginService: LoginService,
    private databaseService: DatabaseService
    ) { }

  async allOrg(){
    let orgId = await this.databaseService.getValue('orgId');
    console.log(orgId,"ritik")

    // if(!this.allOrganization){
      this.nodeApiService.getAllOrganization(orgId).subscribe({
       next: async (data: any) => console.log('Data received of all organization name', data)
        // error: error => console.error('Error occurred:', error),
        // complete: () => console.log('Request completed')
      })
   // }

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
