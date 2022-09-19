const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;
const moment = require("moment");


exports.get_shard_analysis = async (connString) => {
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString, "config");

    let chunks_in_shard_pipeline = [
        {
            '$group': {
                '_id': { 'shard': '$shard' },
                'chunks': { '$sum': 1 }
            }
        },
        { '$project': { '_id': 0, 'shard': '$_id.shard', 'chunks': 1 } }
    ]

    let top_largest_sharded_colls_pipeline = [{
        '$group': {
            '_id': "$uuid",
            'chunks': {
                '$sum': 1
            }
        }
    }, {
        '$project': {
            '_id': 1,
            'chunks': 1
        }
    }, {
        '$sort': {
            'chunks': -1
        }
    }, {
        '$limit': 10
    }, {
        $lookup: {
            from: "collections",
            localField: "_id",
            foreignField: "uuid",
            as: "collection"
        }
    }, {
        $project: {
            _id: 0,
            chunks: 1,
            collection: "$collection._id"
        }
    }, {
        $unwind: "$collection"
    }]

    let migrations_pipeline = [{
        '$match': {
            'what': 'moveChunk.commit'
        }
    },
    {
        '$group': {
            '_id': {
                'date': {
                    '$dateToString': {
                        'format': '%Y-%m-%dT%H',
                        'date': '$time'
                    }
                },
                'ns': '$ns',
                'from': '$details.from',
                'to': '$details.to',
            },
            'chunks_moved': {
                '$sum': 1
            },
            'docs_moved': {
                '$sum': '$details.cloned'
            },
            'bytes_moved': {
                '$sum': '$details.clonedBytes'
            },
            'counts_docs_moved': {
                '$sum': '$details.counts.cloned'
            },
            'counts_bytes_moved': {
                '$sum': '$details.counts.clonedBytes'
            }
        }
    },
    {
        '$sort': {
            '_id.date': -1,
            '_id.ns': 1,
            '_id.from': 1,
            '_id.to': 1
        }
    },
    {
        '$group': {
            '_id': {
                'date': '$_id.date',
            },
            'details': {
                '$push': {
                    'ns': '$_id.ns',
                    'from': '$_id.from',
                    'to': '$_id.to',
                    'chunks_moved': '$chunks_moved',
                    'docs_moved': '$docs_moved',
                    'bytes_moved': '$bytes_moved',
                    'counts_docs_moved': '$counts_docs_moved',
                    'counts_bytes_moved': '$counts_bytes_moved'
                }
            },
            'chunks_moved': {
                '$sum': '$chunks_moved'
            },
            'docs_moved': {
                '$sum': '$docs_moved'
            },
            'bytes_moved': {
                '$sum': '$bytes_moved'
            },
            'counts_docs_moved': {
                '$sum': '$counts_docs_moved'
            },
            'counts_bytes_moved': {
                '$sum': '$counts_bytes_moved'
            }
        }
    },
    {
        '$sort': {
            '_id.date': -1
        }
    },
    {
        '$project': {
            '_id': 0,
            'date': '$_id.date',
            'chunks_moved': 1,
            'docs_moved': 1,
            'data_moved(MB)': {
                '$divide': ['$bytes_moved', (1024 * 1024)]
            },
            'counts_docs_moved': 1,
            'counts_data_moved(MB)': {
                '$divide': ['$counts_bytes_moved', (1024 * 1024)]
            },
            'details': 1
        }
    },
    {
        '$limit': 20
    }
    ];

    const back_date = new Date(moment().subtract(1, "days"))

    let chunk_splits_pipeline = [
        {
            '$match': {
                'what': {
                    '$regex': new RegExp('split'),
                    '$options': 'i'
                },
                'details.number': { '$ne': 1 },
                'time': { '$gte': back_date }
            }
        },
        {
            '$project': {
                'time': 1,
                'ns': 1,
                'shard': { '$ifNull': ['$details.owningShard', ''] }

            }
        },
        {
            '$group': {
                '_id': {
                    'date': { '$dateToString': { 'format': '%Y-%m-%dT%H', 'date': '$time' } },
                    'ns': '$ns',
                    'shard': '$shard',
                },
                'chunks_split': { '$sum': 1 },
            }
        },
        { '$sort': { '_id.date': -1, '_id.ns': 1, '_id.shard': 1 } },
        {
            '$group': {
                '_id': {
                    'date': '$_id.date',
                },
                'details': { '$push': { 'ns': '$_id.ns', 'shard': '$_id.shard', 'chunks_split': '$chunks_split' } },
                'chunks_split': { '$sum': '$chunks_split' }
            },
        },
        { '$sort': { '_id.date': -1 } },
        { '$project': { '_id': 0, 'date': '$_id.date', 'chunks_split': 1, 'details': 1 } },
        { '$limit': 24 }
    ];

    const chunks_in_shard = await mongoDBAdapter.runAggregation("chunks", chunks_in_shard_pipeline);
    const top_largest_sharded_colls = await mongoDBAdapter.runAggregation("chunks", top_largest_sharded_colls_pipeline);
    const migrations = await mongoDBAdapter.runAggregation("changelog", migrations_pipeline);
    const chunk_splits = await mongoDBAdapter.runAggregation("changelog", chunk_splits_pipeline);

    return {
        "chunks_in_shard": chunks_in_shard,
        "top_largest_sharded_colls": top_largest_sharded_colls,
        "migrations_last_1_day": migrations,
        "chunk_splits": chunk_splits
    };

};


exports.get_shard_status = async (connString) => {
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString);

    let balancer = await mongodbAdapter.runCommand({ balancerStatus: 1 });
    let shardsList = await mongodbAdapter.runCommand({ getShardMap: 1 });

    return {
        "shard_map": shardsList.map,
        "shard_hosts": shardsList.hosts,
        "shard_conn_strings": shardsList.connStrings,
        "balancer_mode": balancer.mode,
        "in_balancer_round": balancer.inBalancerRound,
        "num_balancer_rounds": balancer.numBalancerRounds
    };
}