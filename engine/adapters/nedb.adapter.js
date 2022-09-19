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

    insert(object) {
        return this.#datastore.insert(object, (err, newDoc) => {
            if (err) return false;
            else return true;
        });
    }

    fetch(query) {
        return this.#datastore.find(query, (err, docs) => {
            return docs;
        });
    }
}