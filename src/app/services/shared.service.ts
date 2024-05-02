import { Injectable } from '@angular/core';
import { ApiSettings, MESSAGES, RESPONSIBILITIES, TableNames, TransactionType } from '../constants/constants';
import { Subscription } from 'rxjs';
import { DatabaseService } from './database.service';
import { NodeApiService } from './node-api.service';
import { UiService } from './ui.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private nodeApiService: NodeApiService,
    private uiService: UiService,
    private databaseService: DatabaseService,
    private apiService: NodeApiService
  
  ) { }
  MetaDataSubscription!: Subscription;
  DataSubscription!: Subscription;

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

  async performDeltaSync(tableName: any, organisation: any) {
    const params = this.generateParams(TransactionType.DELTA_SYNC, '', organisation);
    this.apiService.fetchAllByUrl(ApiSettings.DOCS4RECEIVING + params).subscribe({
      next: async (resp: any) => {
        if (resp && resp.status === 200) {
          const columns = Object.keys(resp.body.Docs4Receiving[0])
          try {
            const Docs4Receiving = resp.body.Docs4Receiving
            await Docs4Receiving.forEach(async (element: any) => {
              try {
                if (element["Flag"] === 'D' || element.Flag === 'D') {
                  await this.databaseService.executeCustomQuery(`DELETE FROM ${tableName} WHERE OrderLineId=? AND PoLineLocationId=? AND ShipmentLineId=?`, [element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);
                } else {
                  await this.databaseService.insertData(`INSERT OR IGNORE INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, Object.values(element));
                  const updateQuery = `UPDATE ${tableName} SET QtyOrdered = ?, QtyReceived = ?, QtyRemaining = ? WHERE OrderLineId = ? AND PoLineLocationId = ? AND ShipmentLineId = ?`;
  
                  await this.databaseService.executeCustomQuery(updateQuery, [element['QtyOrdered'], element['QtyReceived'], element['QtyRemaining'], element['OrderLineId'], element['PoLineLocationId'], element['ShipmentLineId']]);              
                }
              } catch (error) {
               console.error('error while inserting or update data: ', error); 
              }
            })
            console.log('Docs4Receiving: deltaSync performed successfully')
          } catch (error) {
            console.error('error in performDeltaSync: ', error);
          }
        } else if (resp && resp.status === 204) {
          this.uiService.presentToast(MESSAGES.SUCCESS, 'No docs for receiving in delta');
        } else {
          console.error('error in performDeltaSync: ', resp);
        }
        }, error: (err) => {
          console.error('error in performDeltaSync: ', err);
        }
      })
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

  async createTransactionHistoryTable(table_name: string) {
    let createTransactionHistoryTableQuery = `CREATE TABLE IF NOT EXISTS ${table_name} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poNumber TEXT,
      titleName TEXT,
      syncStatus DATETIME,
      createdTime DATETIME,
      quantityReceived INTEGER,
      receiptInfo TEXT,
      error TEXT,
      status TEXT,
      shipLaneNum TEXT,
      vendorId TEXT,
      unitOfMeasure TEXT,
      poHeaderId TEXT,
      poLineLocationId TEXT,
      poLineId TEXT,
      poDistributionId TEXT,
      destinationTypeCode TEXT,
      itemNumber TEXT,
      Subinventory TEXT,
      Locator TEXT,
      ShipmentNumber TEXT,
      LpnNumber TEXT,
      OrderLineId TEXT,
      SoldtoLegalEntity TEXT,
      SecondaryUnitOfMeasure TEXT,
      ShipmentHeaderId TEXT,
      ItemRevision TEXT,
      ReceiptSourceCode TEXT,
      MobileTransactionId TEXT,
      TransactionType TEXT,
      AutoTransactCode TEXT,
      OrganizationCode TEXT,
      serialNumbers TEXT,
      lotQuantity TEXT,
      lotCode TEXT,
      userId TEXT,
      employeeId TEXT,
      bussinessUnitId TEXT,
      inventoryOrgId TEXT
      )`
    await this.databaseService.createTable(createTransactionHistoryTableQuery, table_name);
  }
  
  buildPayloadFromTransaction(item: any, index: any, selectedOrg: any, userDetails: any) {
    const requestBody = {
      id: `part${index + 1}`,
      path: '/receivingReceiptRequests',
      operation: 'create',
      payload: {
        ReceiptSourceCode: item?.ReceiptSourceCode,
        OrganizationCode: item?.OrganizationCode,
        EmployeeId: userDetails.PERSON_ID,
        BusinessUnitId: selectedOrg?.BusinessUnitId,
        ReceiptNumber: item?.receiptInfo,
        BillOfLading: '',
        FreightCarrierName: '',
        PackingSlip: '',
        WaybillAirbillNumber: '',
        ShipmentNumber: '',
        ShippedDate: '',
        VendorSiteId: '',
        VendorId: parseInt(item?.vendorId),
        attachments: [],
        CustomerId: '',
        InventoryOrgId: selectedOrg?.InventoryOrgId_PK,
        DeliveryDate: '31-Jan-2024 12:00:00',
        ResponsibilityId: '20634',
        UserId: userDetails.USER_ID,
        DummyReceiptNumber: new Date().getTime(),
        BusinessUnit: 'Vision Operations',
        InsertAndProcessFlag: 'true',
        lines: [
          {
            ReceiptSourceCode: item?.ReceiptSourceCode,
            MobileTransactionId: new Date().getTime(),
            TransactionType: item?.TransactionType,
            AutoTransactCode: item.AutoTransactCode,
            OrganizationCode: item?.OrganizationCode,
            DocumentNumber: item?.poNumber,
            DocumentLineNumber: item?.shipLaneNum,
            ItemNumber: item?.itemNumber,
            TransactionDate: formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US"),
            Quantity: item?.quantityReceived,
            UnitOfMeasure: item?.unitOfMeasure,
            SoldtoLegalEntity: item?.SoldtoLegalEntity,
            SecondaryUnitOfMeasure: item?.SecondaryUnitOfMeasure,
            ShipmentHeaderId: item?.ShipmentHeaderId,
            ItemRevision: item?.ItemRevision != null ? item?.ItemRevision : "",
            POHeaderId: parseInt(item?.poHeaderId),
            POLineLocationId: parseInt(item?.poLineLocationId),
            POLineId: parseInt(item?.poLineId),
            PODistributionId: parseInt(item?.poDistributionId),
            ReasonName: '',
            Comments: '',
            ShipmentLineId: '',
            transactionAttachments: [],
            lotItemLots: (item?.lotQuantity && item?.lotQuantity.trim() !== "")
              ? this.buildLotPayload(item?.lotQuantity, item?.lotCode)
              : [],
            serialItemSerials: (item?.serialNumbers && item?.serialNumbers.trim() !== "")
              ? item?.serialNumbers.split(',').map((serial: any) => ({
                fromSerial: serial ? serial : "",
                toSerial: serial ? serial : ""
              }))
              : [],
            lotSerialItemLots: [],
            ExternalSystemTransactionReference: 'Mobile Transaction',
            ReceiptAdviceHeaderId: '',
            ReceiptAdviceLineId: '',
            TransferOrderHeaderId: '',
            TransferOrderLineId: '',
            PoLineLocationId: item?.poLineLocationId,
            DestinationTypeCode: item?.destinationTypeCode,
            Subinventory: item?.Subinventory,
            Locator: item?.Locator,
            ShipmentNumber: item?.ShipmentNumber,
            LpnNumber: item?.LpnNumber,
            OrderLineId: item?.OrderLineId,
          },
        ],
      },
    };
    return requestBody;
  }

  buildLotPayload(lotQuant: any, lotCodes: any) {
    if (lotQuant != "" || lotQuant != null || lotCodes != "" || lotCodes != null) {
      const lotNumbers = lotCodes.split(',');
      const lotQuantities = lotQuant.split(',');
      const resultArray = lotNumbers.map((lotNumber: any, index: any) => ({
        GradeCode: '',
        LotExpirationDate: formatDate(new Date(), "dd-MM-yyyy HH:mm:ss", "en-US"),
        LotNumber: lotNumber ? lotNumber : "",
        ParentLotNumber: '',
        SecondaryTransactionQuantity: '',
        TransactionQuantity: lotQuantities[index] ? lotQuantities[index] : "",
      }));
      return resultArray;
    }
    return [];

  }

  insertTransaction(item: any, tableName: string) {
    const query = `INSERT INTO ${tableName} (poNumber, titleName, syncStatus, createdTime, quantityReceived, receiptInfo,error,status,shipLaneNum,
      vendorId,unitOfMeasure,poHeaderId,poLineLocationId,poLineId,poDistributionId,destinationTypeCode,itemNumber,Subinventory,Locator,
      ShipmentNumber,LpnNumber,OrderLineId,SoldtoLegalEntity,SecondaryUnitOfMeasure,ShipmentHeaderId,ItemRevision,ReceiptSourceCode,MobileTransactionId,TransactionType ,
      AutoTransactCode,
      OrganizationCode,serialNumbers,lotQuantity,lotCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;
    const data = [
      item.poNumber,
      item.titleName,
      item.syncStatus,
      item.createdTime.toISOString(),
      item.quantityReceived,
      item.receiptInfo,
      item.error,
      item.status,
      item.shipLaneNum,
      item.vendorId,
      item.unitOfMeasure,
      item.poHeaderId,
      item.poLineLocationId,
      item.poLineId,
      item.poDistributionId,
      item.destinationTypeCode,
      item.itemNumber,
      item.Subinventory,
      item.Locator,
      item.ShipmentNumber,
      item.LpnNumber,
      item.OrderLineId,
      item.SoldtoLegalEntity,
      item.SecondaryUnitOfMeasure,
      item.ShipmentHeaderId,
      item.ItemRevision,
      item.ReceiptSourceCode,
      item.MobileTransactionId,
      item.TransactionType,
      item.AutoTransactCode,
      item.OrganizationCode,
      item.serialNumbers,
      item.lotQuantity,
      item.lotCode
    ];
    return this.databaseService.insertData(query, data);
  }
  async getTableData(tableName: string) {
    const rows = []
    try {
      const data = await this.databaseService.getDataFromTable(tableName);
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          rows.push(data.rows.item(i));
        }
      }
    } catch (error) {
      console.error(`Error getting data from ${tableName}: `, error);
    }
    return rows
  }

  async getCustomTableData(tableName: string, data: any) {
    const rows = []
    try {
      const query = `SELECT * FROM ${tableName};`
      const records = await this.databaseService.executeCustomQuery(query, []);
      if (records.rows.length > 0) {
        for (let i = 0; i < records.rows.length; i++) {
          rows.push(records.rows.item(i));
        }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error getting data from ${tableName}: `, error);
    }
    return rows
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
