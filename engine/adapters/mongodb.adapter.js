const mongodb = require("mongodb");


export class MongoDBAdapter {
    #db;

    async connect(con_string, db_name) {
        try {
            var connection = await mongodb.MongoClient.connect(con_string, { useNewUrlParser: true });
            this.db = connection.db(db_name);
            console.log("MongoClient Connection successfull.");
        }
        catch (ex) {
            console.error("MongoDB Connection Error.,", ex);
        }
    }

    async findDocFieldsByFilter(collection, query, projection, limit) {
        if (!query) {
            throw Error("mongoClient.findDocFieldsByFilter: query is not an object");
        }
        return await this.db.collection(collection).find(query, {
            projection: projection || {},
            limit: lmt || 0
        }).toArray();
    }

    async runAggregation(collection, query) {
        if (!Array.isArray(query)) {
            throw Error("mongoClient.findDocByAggregation: query is not an object");
        }
        return this.db.collection(collection).aggregate(query).toArray();
    }

    async getDocumentCountByQuery(collection, query) {
        return this.db.collection(collection).estimatedDocumentCount(query || {})
    }

    async runAdminCommand(command) {
        return this.db.runAdminCommand(command);
    }

    async close() {
        return await this.db.close();
    }
}