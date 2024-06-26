import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  db!: SQLiteObject; // Initialize as undefined

  dbConfig = {
    name: 'data.db',
    location: 'default'
  };

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private storage: Storage
  ) {
    this.platform.ready().then(() => {
      this.createDatabase();
    }).catch(error => {
      console.error('Platform not ready:', error);
    });
    this.storage.create();
  }

  async createDatabase() {
    try {
      const db = await this.sqlite.create(this.dbConfig);
      this.db = db;
      console.log('Database Connected');
    } catch (error) {
      console.error('Error creating SQLite database:', error);
    }
  }

  async createTable(query: string, table_name: string) {
    return this.db.executeSql(query, [])
  }

  async insertData(query: string, data: any) {
    return this.db.executeSql(query, data)
  }

  async insertBatchData(query: any, data: any[][]) {
    return this.db.sqlBatch(data.map(row => [query, row]))
  }

  async executeCustomQuery(query: string, data: any = []) {
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

  async getValue(key: string) {
    return this.storage.get(key);
  }

  async setValue(key: string, value: any) {
    return this.storage.set(key, value);
  }

  async clearStorage() {
    return this.storage.clear();
  }

}

