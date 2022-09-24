const Datastore = require('@seald-io/nedb');
const { app } = require('electron');
const path = require('path');
const fs = require("fs")

exports.LocalDBAdapter = class {

    #db_name;
    #datastore;
    #db_path;

    constructor(db_name) {
        this.#db_name = db_name;
        this.#db_path = path.join(app.getPath("temp"), this.#db_name + ".db");
        
        // remove old processes
        this._clearDatabase();
        
        // create a new instance
        this.#datastore = new Datastore({
            filename: this.#db_path,
            autoload: true
        });
    }

    _clearDatabase() {
      fs.unlinkSync(this.#db_path);
    }

    insert(obj) {
      return new Promise((resolve, reject) => {
        this.#datastore.insert(obj, (err, result) => {
          if (err) {
              reject(err);
              return;
          }
          resolve(result)
        })
      })
   }

    fetch(query, limit = 100, skip = 0, projection = {}) {
      return new Promise((resolve, reject) => {
        this.#datastore.find(query).projection(projection).skip(skip).limit(limit).exec((err, data) => {
          if (err) { 
            reject(err);
            return;
          }

          resolve(data)
          
        })
      })
    }
}