const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;

exports.get_write_load_analysis = async (connString) => {
 
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString, "local");

    // Get Group By OpType
    let oplog_count_by_optype = await mongoDBAdapter.runAggregation("oplog.rs", [{
        $group: {
            _id: {
                op: '$op',
                ns: '$ns'
            },
            opCount: {
                $sum: 1
            }
        }
    }])

    // Get Largest Document in Oplog
    let largest_oplog = await mongoDBAdapter.runAggregation("oplog.rs", [{
        $addFields: {
            object_size: {
                $bsonSize: '$$ROOT'
            }
        }
    }, {
        $sort: {
            object_size: -1
        }
    }, {
        $group: {
            _id: '$op',
            maxSize: {
                $max: '$object_size'
            },
            originalDoc: {
                $first: '$$ROOT'
            }
        }
    }]);

    return {
        "oplog_count_by_optype": oplog_count_by_optype,
        "largest_oplog": largest_oplog
    }
};

/**
 * 
 * @param {*} connString Connection String for the Cluster, external (call from FE or BE), if external pass adapter
 * @returns Oplog Document with maxSize, size,count and duration in Seconds
 */
exports.get_oplog_stats  = async (connString,external,dbAdapter) =>  {
    var oplog = {};
    let mongoDBAdapter;
    // Connect to MongoDB
    if(external){
        mongoDBAdapter = new MongoDBAdapter();
        await mongoDBAdapter.connect(connString, "local");
    }else{
        mongoDBAdapter = dbAdapter;
    }

    var stats = await mongoDBAdapter.runCommand({ "collStats": "oplog.rs"});    
      oplog["maxSize"] = Number(stats["maxSize"]);
      oplog["size"] = stats["size"];
      oplog["count"] = stats["count"];
    var firstDoc = await mongoDBAdapter.findDocFieldsByFilterWithSort("oplog.rs",{},{ts: 1},{"$natural": 1},1);
    var lastDoc = mongoDBAdapter.findDocFieldsByFilterWithSort("oplog.rs",{},{ts: 1},{"$natural": -1},1)

    oplog["durationInSeconds"] = lastDoc.ts- firstDoc.ts;
    object = {
        "status": 200,
        "message":"Success",
        "oplog":oplog
    }
    
    return {
        "status": 200,
        "message":"Success",
        "oplog":oplog
    }
}