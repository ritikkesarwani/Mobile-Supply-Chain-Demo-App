import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { UiService } from './ui.service';
import { ApiSettings, RESPONSIBILITIES, TypeOfApi } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private sharedService: SharedService,
    private uiService: UiService
  ) { }

  async getTransactionalData(defaultOrgId: any, organisation: any): Promise<any> {

    const transactionalApiCalls = [
      { api: ApiSettings.DOCS4RECEIVING, name: RESPONSIBILITIES.DOCS4RECEIVING, message: TypeOfApi.METADATA},
      { api: ApiSettings.DOCS4RECEIVING, name: RESPONSIBILITIES.DOCS4RECEIVING, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.UOM, name: RESPONSIBILITIES.UOM, message: TypeOfApi.METADATA},
      { api: ApiSettings.UOM, name: RESPONSIBILITIES.UOM, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.LOTS, name: RESPONSIBILITIES.LOTS, message: TypeOfApi.GET_DATA},
      { api: ApiSettings.SERIALS, name: RESPONSIBILITIES.SERIALS, message: TypeOfApi.GET_DATA},
    ]

    let transactionPromises: any = []

    for(const api of transactionalApiCalls) {
      if (api.message == TypeOfApi.METADATA) {
        try {
          const params = 'metadata';
          const tableName = this.sharedService.getTableName(api.name)
          transactionPromises.push(await this.sharedService.fetchTableMetaData(api.api, tableName, params))
        } catch (error) {
          console.error(`Error getting metadata for ${api.name}: `, error);
        } finally {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } else if (api.message == TypeOfApi.GET_DATA) {
        try {
          const params = this.sharedService.generateParams(api.name, defaultOrgId, organisation);
          const tableName = this.sharedService.getTableName(api.name)
          transactionPromises.push(await this.sharedService.fetchTableData(api.api, tableName, params))
        } catch (error) {
          console.error(`Error getting data for ${api.name}: `, error);
        } finally {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    return new Promise(resolve => resolve(transactionPromises))
  }
}
