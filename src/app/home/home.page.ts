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
        name: 'my-database',
        location: 'default',
        // Key/Password used to encrypt the database
        // Strongly recommended to use Identity Vault to manage this
        key: 'password'
      });

      this.database = db;

      // Create our initial schema
      await db.executeSql('CREATE TABLE IF NOT EXISTS software(name, company, type, version)', []);
    } catch (e) {
      console.error('Unable to initialize database', e);
    }
  }

  insert() {
    console.log('Insert Called');
    this.database.transaction((tx: DbTransaction) => {
      tx.executeSql('INSERT INTO software (name, company, type, version) VALUES (?,?,?,?)',
        ['secure-storage', 'ionic', 'native', '2.0'], (tx2, result) => {
          //          console.log('insertId: ' + result.insertId);  // New Id number
          //          console.log('rowsAffected: ' + result.rowsAffected);  // 1
        });
    });
  }

  select() {
    this.database.transaction(tx => {
      tx.executeSql('SELECT * from software', [], (tx2, result) => {
        // Rows is an array of results. Use zero-based indexing to access
        // each element in the result set: item(0), item(1), etc.
        // for (let i = 0; i < result.rows.length; i++) {
        //   console.log(result.rows.item(i));
        //   console.log(result.rows.item(i).company);
        // }
      });
    });
  }

  // This is a test to ensure we get an error when opening a database using the wrong key
  async breakPromise() {
    let db: SQLiteObject;
    try {
      await this.database.close();
    } catch {
      // Might be closed already, dont error out
    }

    try {
      db = await this.sqlite.create({
        name: 'my-database',
        location: 'default',
        // Use the wrong password
        key: 'wrongpassword'
      });
      await db.open();
    } catch (err) {
      alert('Got an error opening the database: ' + err);
    }


    try {
      await db.transaction(tx => {
        tx.executeSql('SELECT * from software', [], (tx2, result) => {
          alert(`Got ${result.rows.length} rows`);
        });
      });
      alert('We got success?');
    } catch (err) {
      alert('Got the expected error: ' + err);
    }
  }

  selectTest() {
    setInterval(() => {
      this.select();
      this.insert();
    }, 1);
  }

}
