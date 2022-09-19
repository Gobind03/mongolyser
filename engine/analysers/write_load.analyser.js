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