import { Injectable } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NodeApiService } from 'src/app/services/node-api.service';
import { TableNames } from '../constants/constants';
import { DatabaseService } from './database.service';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  isLoggedIn: boolean = false;
  columns: string[] | undefined;

  private loaders: HTMLIonLoadingElement[] = [];


  constructor(
    private toastController: ToastController,
    private nodeApiService: NodeApiService,
    private navCtrl: NavController,
    private databaseService: DatabaseService,
    private uiService: UiService
  ) { }

  async login(username: string, password: string) {
    if (!username || username.trim() === '') {
      await this.uiService.presentToast('', 'Please enter the username')
      return;
    }
    if (!password || password.trim() === '') {
      await this.uiService.presentToast('', 'Please enter the password')
      return;
    }

    this.nodeApiService.userLogin(username, password).subscribe({
      next: async (data: any) => {
        const metadata = data.metadata;

        // Create tables
        await this.createTables(metadata);

        const loginData = data.data;

        if (loginData[0].STATUS === "0") {
          await this.uiService.presentToast('', loginData[0].ERROR)

        } else {
          this.isLoggedIn = true;
          let responsibilities: any[] = [];

          let defaultOrgId = "";

          let filterLoginData = loginData.filter((data: any) => {
            return data.DEFAULT_ORG_ID !== "";
          });

          filterLoginData.forEach((loginData:any) => {
            const responsibility = (loginData.RESPONSIBILITY as string).toLowerCase().trim();
            responsibilities.push(responsibility);
            defaultOrgId = loginData.DEFAULT_ORG_ID;
          });
          
          await this.insertUserData([username, password]);

          await this.handleLoginSuccess(loginData, username, password, responsibilities, defaultOrgId);
          const loginValue = this.databaseService.getValue('loginData')
          this.navCtrl.navigateForward('/org-list', { queryParams: { data: loginValue } });

        }
      },
      error: async (err) => {
        console.error('Login Failed', err);
        await this.presentToast('Error', 'Login Service is down');
      },
      complete: () => {
        this.loaders.forEach(async (loader) => {
          await loader.dismiss();
        })
      }
    });
  }

  async createTables(metadata: any[]) {
    await this.createUserTable();

    const query = `CREATE TABLE IF NOT EXISTS ${TableNames.LOGIN} (
      ${metadata.map(column => `${column.name} ${this.createColumn(column.type)}`).join(',\n  ')}
    )`;

    this.columns = [...metadata.map((column: any) => column.name).values()];

    await this.databaseService.createTable(query, TableNames.LOGIN);
  }

  async handleLoginSuccess(loginData: any[], username: string, password: string, responsibilities: any[], defaultOrgId:any) {

    console.log(responsibilities,'this is responsibilities');
    console.log(defaultOrgId, 'this is default org id');
    console.log(loginData, 'this is loginData');
    console.log(username, 'this is username');
    console.log(password, 'password');

    await this.databaseService.setValue('orgId', defaultOrgId);
    await this.databaseService.setValue('responsibilities', responsibilities);
    await this.databaseService.setValue('loginData', loginData);
    await this.databaseService.setValue('username', username);
    await this.databaseService.setValue('password', password);
  }

  async presentToast(header: string, message: string) {
    const toast = await this.toastController.create({
      header,
      message,
      duration: 1500
    });
    await toast.present();
  }

  async createUserTable() {
    const query = `CREATE TABLE IF NOT EXISTS ${TableNames.USERS} (
      username VARCHAR(255),
      password VARCHAR(255)
    )`;
    await this.databaseService.createTable(query, TableNames.USERS);
  }

  async insertUserData(data: any) {
    const query = `INSERT INTO ${TableNames.USERS} (username, password) VALUES (?, ?)`;
    await this.databaseService.insertData(query, data);
  }

  createColumn(type: string) {
    switch (type) {
      case "text":
        return "VARCHAR(255)";
      case "number":
        return "INT";
      default:
        return "VARCHAR(255)";
    }
  }
}
