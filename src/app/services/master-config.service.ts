import { Injectable } from '@angular/core';
import { ApiSettings, RESPONSIBILITIES, TypeOfApi, TableNames, TransactionType } from '../constants/constants';
import { Subscription } from 'rxjs';
import { DatabaseService } from './database.service';
import { NodeApiService } from './node-api.service';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class MasterConfigService {

  constructor(private nodeApiService: NodeApiService, private uiService: UiService, private databaseService: DatabaseService) { }
  MetaDataSubscription!: Subscription;
  DataSubscription!: Subscription;


  async masterConfigApiCall(defaultOrgId: any, organisation: any): Promise<any> {
    const masterApiCalls = [
      { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.METADATA },
      { api: ApiSettings.GL_PERIODS, name: RESPONSIBILITIES.GL_PERIODS, message: TypeOfApi.GET_DATA },
      { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.METADATA },
      { api: ApiSettings.PURCHASING_PERIODS, name: RESPONSIBILITIES.PURCHASING_PERIODS, message: TypeOfApi.GET_DATA },
      { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.METADATA },
      { api: ApiSettings.REVISIONS, name: RESPONSIBILITIES.REVISIONS, message: TypeOfApi.GET_DATA },
      { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.METADATA },
      { api: ApiSettings.SUB_INVENTORY, name: RESPONSIBILITIES.SUB_INVENTORY, message: TypeOfApi.GET_DATA },
      { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.METADATA },
      { api: ApiSettings.LOCATORS, name: RESPONSIBILITIES.LOCATORS, message: TypeOfApi.GET_DATA },
    ]

    const configApiCalls = [
      { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.CONFIG },
      { api: ApiSettings.REASONS, name: RESPONSIBILITIES.GET_REASONS, message: TypeOfApi.GET_DATA },
    ]

    let masterPromises: any = []
    let configPromises: any = []


    for (const api of masterApiCalls) {
      if (api.message === TypeOfApi.METADATA) {
        try {
          const params = 'metadata'
          const tableName = this.getTableName(api.name)
          masterPromises.push(await this.fetchTableMetaData(api.api, tableName, params))
        } catch (error) {
          console.error(`metadata ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else if (api.message === TypeOfApi.GET_DATA) {
        try {
          const params = this.generateParams(api.name, defaultOrgId, organisation)
          const tableName = this.getTableName(api.name)
          masterPromises.push(await this.fetchTableData(api.api, tableName, params))
        } catch (error) {
          console.error(`data ${api.name}`, error)
        }
      }
    }

    for (const api of configApiCalls) {
      if (api.message === TypeOfApi.CONFIG) {
        try {
          const params = 'metadata'
          const tableName = this.getTableName(api.name)
          configPromises.push(await this.fetchTableMetaData(api.api, tableName, params))
        } catch (error) {
          console.error(`config ${api.name}`, error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else if (api.message === TypeOfApi.GET_DATA) {
        try {
          const params = this.generateParams(api.name, defaultOrgId, organisation)
          const tableName = this.getTableName(api.name)
          configPromises.push(await this.fetchTableData(api.api, tableName, params))
        } catch (error) {
          console.error(`data ${api.name}`, error)
        }
      }
    }
    return new Promise((resolve) => {
      resolve([...masterPromises, ...configPromises])
    })
  }

  getTableName(name: string) {
    if (name === RESPONSIBILITIES.GL_PERIODS) {
      return TableNames.GL_PERIODS
    } else if (name === RESPONSIBILITIES.PURCHASING_PERIODS) {
      return TableNames.PURCHASING_PERIODS
    } else if (name === RESPONSIBILITIES.INVENTORY_PERIODS) {
      return TableNames.INVENTORY_PERIODS
    } else if (name === RESPONSIBILITIES.GET_REASONS) {
      return TableNames.GET_REASONS
    } else if (name === RESPONSIBILITIES.REVISIONS) {
      return TableNames.REVISIONS
    } else if (name === RESPONSIBILITIES.SUB_INVENTORY) {
      return TableNames.SUB_INVENTORY
    } else if (name === RESPONSIBILITIES.LOCATORS) {
      return TableNames.LOCATORS
    } else if (name === RESPONSIBILITIES.DOCS4RECEIVING) {
      return TableNames.DOCS4RECEIVING
    } else if (name === RESPONSIBILITIES.UOM) {
      return TableNames.UOM
    } else if (name === RESPONSIBILITIES.LOTS) {
      return TableNames.LOTS
    } else {
      return TableNames.SERIALS
    }
  }

  async fetchTableMetaData(api: string, tableName: string, params: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.MetaDataSubscription = this.nodeApiService.fetchAllByUrl(api + params).subscribe({
        next: async (resp: any) => {
          let success = false;
          if (resp && resp.status === 200) {
            try {
              await this.createMetaDataTable(resp.body, tableName);
              success = true;
            } catch (error) {
              console.error(`error while creating table ${tableName}`, error);
            }
          } else {
            this.uiService.presentToast('Error', `No metadata available for ${tableName}`);
          }

          resolve(success);
        },
        error: (error) => {
          console.error(`error while fetching meta ${tableName}`, error);
          this.uiService.presentToast('Error', 'failed to get table metadata');
          resolve(false); // Resolve with false in case of an error.
        },
      });
    });
  }

  generateParams(name: string, defaultOrgId: any, organisation: any) {
    if (name === RESPONSIBILITIES.GL_PERIODS || name === RESPONSIBILITIES.INVENTORY_PERIODS || name === RESPONSIBILITIES.PURCHASING_PERIODS) {
      return `${defaultOrgId}`
    } else if (name === RESPONSIBILITIES.REVISIONS || name === RESPONSIBILITIES.UOM || name === RESPONSIBILITIES.LOTS) {
      return `${organisation.InventoryOrgId_PK}/""`
    } else if (name === RESPONSIBILITIES.SUB_INVENTORY || name === RESPONSIBILITIES.DOCS4RECEIVING) {
      return `${organisation.InventoryOrgId_PK}/""/"Y"`
    } else if (name === RESPONSIBILITIES.LOCATORS) {
      return `${organisation.InventoryOrgId_PK}/""/""`
    } else if (name === RESPONSIBILITIES.SERIALS) {
      return `${organisation.InventoryOrgId_PK}/""/""/""`
    } else if (name === TransactionType.DELTA_SYNC) {
      return `${organisation.InventoryOrgId_PK}/"${""}"/"N"`
    } else {
      return ''
    }
  }

  async fetchTableData(api: string, tableName: string, params: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let success = false
      this.DataSubscription = this.nodeApiService.fetchAllByUrl(api + params).subscribe({
        next: async (resp: any) => {
          if (resp && resp.status === 200) {
            try {
              const data = this.getBodyFromResponse(resp, tableName)
              if (tableName === TableNames.DOCS4RECEIVING || tableName === TableNames.LOCATORS) {
                await this.insertDataToTableChunks(data, tableName)
              } else if (tableName === TableNames.LOTS || tableName === TableNames.SERIALS) {
                await this.createTableDataCSV(tableName, data)
                await this.insertDataToTableCSV(tableName, data)
              } else {
                await this.insertDataToTable(data, tableName)
              }
              success = true
            } catch (error) {
              console.error(`error while inserting ${tableName}`, error);
            }
          } else {
            this.uiService.presentToast('Error', `No Data available for ${tableName}`);
          }
          resolve(success)

        }, error: (error) => {
          console.error(`error while fetching data for ${tableName}`, error);
          resolve(false)
        }
      })
    })
  }

  getBodyFromResponse(response: any, tableName: string) {
    if (tableName === TableNames.GL_PERIODS) {
      return response.body.GLPeriods
    } else if (tableName === TableNames.PURCHASING_PERIODS) {
      return response.body.POPeriods
    } else if (tableName === TableNames.INVENTORY_PERIODS) {
      return ''
    } else if (tableName === TableNames.GET_REASONS) {
      return response.body.Reasons
    } else if (tableName === TableNames.SUB_INVENTORY) {
      return response.body.ActiveSubInventories
    } else if (tableName === TableNames.LOCATORS) {
      return response.body.ActiveLocators
    } else if (tableName === TableNames.DOCS4RECEIVING) {
      return response.body.Docs4Receiving
    } else if (tableName === TableNames.UOM || tableName === TableNames.REVISIONS) {
      return response.body.Items
    } else if (tableName === TableNames.LOTS) {
      return response.body
    } else {
      return response.body
    }
  }

  async insertDataToTableChunks(response: any, tableName: string) {
    try {
      const columns = Object.keys(response[0])
      const baseQuery = `INSERT OR REPLACE INTO ${tableName} (${columns.join(',')}) VALUES {};`;
      const docs_to_insert = response.map((doc: any) => Object.values(doc));
      const chunkSize = 50;
      for (let i = 0; i < docs_to_insert.length; i += chunkSize) {
        const chunk = docs_to_insert.slice(i, i + chunkSize);
        const valuesPlaceHolders = Array(chunk.length).fill(`(${columns.map(() => '?').join(', ')})`).join(', ');
        const fullQuery = baseQuery.replace('{}', valuesPlaceHolders);
        const chunkflatdata = chunk.flatMap((doc: any) => Object.values(doc));
        await this.databaseService.insertData(fullQuery, chunkflatdata);
      }
    } catch (error) {
      throw error
    }
  }

  async insertDataToTableCSV(tableName: string, response: any) {
    try {
      const columns = response[0]
      const data = response.slice(1)
      const valuesPlaceHolders = Array(columns.length).fill('?').join(', ')
      const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${valuesPlaceHolders})`;
      await this.databaseService.insertBatchData(insertQuery, data)
    } catch (error) {
      alert(`table insertion ${tableName} error: ${JSON.stringify(error)}`)
    }
  }

  async createTableDataCSV(tableName: string, response: any) {
    try {
      const columns = response[0]
      const baseQuery = `CREATE TABLE IF NOT EXISTS ${tableName} ({});`
      const columnDefinitions = columns.map((column: any) => `${column} TEXT`).join(', ')
      const primaryKeyColumns = columns.filter((column: any) => column.endsWith('_PK'))
      const compositePrimaryKey = primaryKeyColumns.length > 0 ? `, PRIMARY KEY (${primaryKeyColumns.join(', ')})` : ''
      const fullQuery = baseQuery.replace('{}', columnDefinitions + compositePrimaryKey)
      await this.databaseService.createTable(fullQuery, tableName)
    } catch (error) {
      alert(`table creation error: ${JSON.stringify(error)}`)
    }
  }

  async insertDataToTable(response: any, tableName: string) {
    try {
      const columns = Object.keys(response[0])
      const baseQuery = `INSERT OR IGNORE INTO ${tableName} (${columns.join(',')}) VALUES {};`;
      const bulkvaluesPlaceHolders = Array(response.length).fill(`(${columns.map(() => '?').join(', ')})`)
      const fullQuery = baseQuery.replace('{}', bulkvaluesPlaceHolders.join(','));
      const bulkData = response.flatMap((obj: any) => Object.values(obj));
      await this.databaseService.insertData(fullQuery, bulkData);
    } catch (error) {
      throw error
    }
  }

  async createMetaDataTable(response: any, tableName: string) {
    let status;
    try {
      const baseQuery = `CREATE TABLE IF NOT EXISTS ${tableName} ({}, PRIMARY KEY ({}));`;
      const columnDefinitions = response.map((obj: any) => `${obj.name} ${this.mapTypeToSql(obj.type)}`).join(', ');
      const primaryKeyColumns = response.filter((obj: any) => obj["primaryKey"] || obj["primarykey"] === true).map((obj: any) => obj["name"]).join(', ');
      const fullQuery = baseQuery.replace('{}', columnDefinitions).replace('{}', primaryKeyColumns);
      await this.databaseService.createTable(fullQuery, tableName);
      status = true
    } catch (error) {
      this.uiService.presentToast('Error', 'failed to create ' + tableName + ' table', 'red');
      status = false
    }
    return status
  }

  mapTypeToSql(type: string) {
    switch (type) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'REAL';
        case 'boolean':
          return 'BOOLEAN';
      default:
        return 'TEXT';
      }
    }
}