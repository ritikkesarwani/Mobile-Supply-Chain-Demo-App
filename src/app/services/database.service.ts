import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  db!: SQLiteObject;
  dbConfig = {
    name: 'data.db',
    location: 'default'
  }

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private storage: Storage
  ) {
    this.platform.ready().then(() => {
      try {
        this.sqlite.create(this.dbConfig).then((db: SQLiteObject) => {
          this.db = db;
          console.log('Database Connected');
        }).catch(error => {
          console.error('Error creating SQLite database:', error);
        });
      } catch (error) {
        console.error('Error occurred:', error);
      }
    }).catch(error => {
      console.error('Platform not ready:', error);
    });
    this.storage.create();
  }

  // constructor(
  //   private sqlite: SQLite,
  //   private platform: Platform,
  //   private storage: Storage
  // ) {
  //   this.initializeDatabase();
  // }
  // private async initializeDatabase(): Promise<void> {
  //   try {
  //     await this.platform.ready();
  //     this.db = await this.sqlite.create(this.dbConfig);
  //     await this.createTable();
  //   } catch (error) {
  //     console.error('Error initializing database:', error);
  //   }
  // }

  async createTable(query: string, table_name: string) {
    return this.db.executeSql(query, [])
  }

  async insertData(query: string, data: any) {
    return this.db.executeSql(query, data)
  }

  async insertBatchData(query: any, data: any[][]) {
    return this.db.sqlBatch(data.map(row => [query, row]))
  }

  async executeCustonQuery(query: string, data: any = []) {
    return this.db.executeSql(query, data)
  }

  async getDataFromTable(tablename: string) {
    return this.db.executeSql(`SELECT * FROM ${tablename}`, []);
  }

  async getDataFromTablePagination(tablename: string, limit: number, offset: number) {
    return this.db.executeSql(`SELECT * FROM ${tablename} LIMIT ${limit} OFFSET ${offset}`, []);
  }

  async dropTable(table: string) {
    return this.db.executeSql(`DROP TABLE IF EXISTS ${table}`, [])
  }

  

  // Get value from storage
  async getValue(key: string) {
    return this.storage.get(key);
  }

  // Set value in storage
  async setValue(key: string, value: any) {
    return this.storage.set(key, value);
  }

  async clearStorage() {
    return this.storage.clear();
  }
}

