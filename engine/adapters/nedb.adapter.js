const Datastore = require('nedb');
const { app } = require('electron');
const path = require('path');

exports.LocalDBAdapter = class {

    #db_name;
    #datastore;
    constructor(db_name) {
        this.#db_name = db_name;
        this.#datastore = new Datastore({
            filename: path.join(app.getPath("temp"), this.#db_name + ".db"),
            autoload: true
        });
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