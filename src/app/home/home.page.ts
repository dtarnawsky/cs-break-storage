import { Component } from '@angular/core';
import { SQLite, SQLiteObject, DbTransaction } from '@ionic-enterprise/secure-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private database: SQLiteObject;

  constructor(private sqlite: SQLite) {
    this.init();
  }

  async init() {
    try {
      const db = await this.sqlite.create({
        name: 'mydb',
        location: 'default',
        // Key/Password used to encrypt the database
        // Strongly recommended to use Identity Vault to manage this
        key: 'password'
      });

      this.database = db;

      // Create our initial schema
      await db.executeSql('CREATE TABLE IF NOT EXISTS software(name, company, type, version)', [])
    } catch (e) {
      console.error('Unable to initialize database', e);
    }
  }

  insert() {
    this.database.transaction((tx: DbTransaction) => {
      tx.executeSql('INSERT INTO software (name, company, type, version) VALUES (?,?,?,?)',
        ['secure-storage', 'ionic', 'native', '2.0'], (tx, result) => {
//          console.log('insertId: ' + result.insertId);  // New Id number
//          console.log('rowsAffected: ' + result.rowsAffected);  // 1
        });
    });
  }

  select() {
    this.database.transaction(tx => {
      tx.executeSql('SELECT * from software', [], (tx, result) => {
        // Rows is an array of results. Use zero-based indexing to access
        // each element in the result set: item(0), item(1), etc.
        // for (let i = 0; i < result.rows.length; i++) {
        //   console.log(result.rows.item(i));
        //   console.log(result.rows.item(i).company);
        // }
      });
    });
  }

  selectTest() {
    setInterval(() => {
      this.select();
      this.insert();
    }, 1);
  }

}
