const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;
const lodash = require("lodash");
const fs = require("fs");
const { dialog } = require('electron');


exports.get_index_stats = async (channel, connectionString) => {
    try {
        // Create MongoDB Connection
        const mongo_connection = new MongoDBAdapter();
        await mongo_connection.connect(connectionString);

        // Get List Of All Databases
        let dbs = await mongo_connection.listDatabases();

        // Central Storage For All Indexes
        let idx_stats = [];
        let idx_summary = {
            redundantIdx: 0,
            unusedIdx: 0,
            totalIdx: 0,
            totalCollections: 0,
            collectionWithLargeNoOfIndexes: "",
            _lastIndexLengthFound: 0,
            nsRedundantIdx: [],
            nsUnusedIdx: []
        };

        // Iterate Over All Databases To Get Their Collection-wise Indexes
        for (let db in dbs.databases) {
            // Skip System DBs
            if (dbs.databases[db].name == "admin" || dbs.databases[db].name == "local" || dbs.databases[db].name == "config") {
                console.log("Skipping " + dbs.databases[db].name)
            } else {
                // Get List Of Collections In The Database
                let collections = await mongo_connection.listCollections(dbs.databases[db].name);

                // Iterate Over All Collections To Get Indexes
                for (let each_collection in collections) {
                    // Skip System Views
                    if (collections[each_collection].name == "system.views") {
                        console.log("Skipping View ... ")
                    } else {
                        // Switch Context To Iterating Database
                        mongo_connection.switchDatabase(dbs.databases[db].name);
                        // Get All Indexes For The Collection
                        let index_stats = [];
                        if (["view", "timeseries"].indexOf(collections[each_collection].type) < 0 ) {
                             index_stats = await mongo_connection.runAggregation(collections[each_collection].name, [{ "$indexStats": {} }]);
                        }

                        // increment collection counter
                        idx_summary["totalCollections"] += 1;

                        // Calculate Redundancy
                        for (let k = 0; k < index_stats.length; k++) {
                            for (let l = 0; l < index_stats.length; l++) {
                                if (index_stats[l].name.startsWith(index_stats[k].name) && index_stats[k].name != index_stats[l].name) {
                                    index_stats[k]["is_redundant"] = true;
                                    // Increment the summary counter
                                    // push it to unsued idx ns
                                    idx_summary.redundantIdx++;
                                    idx_summary.nsRedundantIdx.push(`${dbs.databases[db].name}.${collections[each_collection].name}`)

                                }
                            }
                        }

                        // Store All Indexes For Collections
                        if (index_stats && index_stats.length > 0) {
                            index_stats.forEach((each_stat) => {
                                idx_summary["totalIdx"] += 1; 
                                each_stat['collection_name'] = collections[each_collection].name;
                                each_stat['db_name'] = dbs.databases[db].name;
                                each_stat['namespace'] = dbs.databases[db].name + "." + collections[each_collection].name;
                                idx_stats.push(each_stat)

                                if (each_stat?.accesses?.ops === 0) {
                                    idx_summary["unusedIdx"] += 1
                                    idx_summary.nsUnusedIdx = Array.from(new Set([...idx_summary.nsUnusedIdx, `${dbs.databases[db].name}.${collections[each_collection].name}`]))
                                }
                            });

                            if (index_stats.length > idx_summary._lastIndexLengthFound) {
                                idx_summary["collectionWithLargeNoOfIndexes"] = `${dbs.databases[db].name}.${collections[each_collection].name}`;
                                idx_summary["_lastIndexLengthFound"] = index_stats.length;
                            }                            
                        }
                    }
                }
            }
        }

        // Group Indexes By Namespace
        let stats = lodash.groupBy(idx_stats, (idx_stat) => { return idx_stat.namespace });

        // Return Stats
        return { idx_details: stats, idx_summary: idx_summary };
    } catch (err) {
        console.error(err);
        dialog.showMessageBoxSync({
            message: err.message,
            title: "Something Went Wrong.",
            type: "info"
        })
    }
}


// @TODO: Fix Single Node Connection Issue
exports.get_index_stats_all_nodes = async (host, user, password, port = 27017, is_srv = false, queryString) => {
    try {
        const mongo_connection = new MongoDBAdapter();
        await mongo_connection.connect(host, user, password, "admin", port, is_srv, queryString);
        // var db2 = await c1.db('admin');
        // var c2 = await mongo_connection.runCommand({ replSetGetConfig: 1 });
        let hosts = await mongo_connection.runCommand({ hello: 1 });
        let replSetName = hosts.setName;
        hosts = hosts.hosts;

        const cluster = []
        for (let eachHost in hosts) {
            let node = {
                url: "mongodb://" + user + ":" + password + "@" + hosts[eachHost] + "/?" + queryString + "&replicaSet=" + replSetName + "&authSource=admin",
                tag: hosts[eachHost]
            }
            cluster.push(node);
        }


        let idx_stats = [];
        for (let node in cluster) {
            await mongo_connection.connect(cluster[node].tag.split(":")[0], user, password, "admin", port, false, queryString + "&directconnection=true");
            let dbs = mongo_connection.listDatabases();
            for (let db in dbs.databases) {
                if (dbs.databases[db].name == "admin" || dbs.databases[db].name == "local" || dbs.databases[db].name == "config") {
                    console.log("Skipping " + dbs.databases[db].name)
                } else {
                    let collections = await mongo_connection.listCollections(dbs.databases[db].name);
                    for (let each_collection in collections) {
                        if (collections[each_collection].name == "system.views") {
                            console.log("Skipping View ... ")
                        } else {
                            await mongo_connection.switchDatabase(dbs.databases[db].name);
                            let index_stats = mongo_connection.runAggregation(collections[each_collection].name, [{ $indexStats: {} }]);
                            if (index_stats && index_stats.length > 0) {
                                index_stats.forEach((each_stat) => {
                                    each_stat['tag'] = cluster[node].tag;
                                    each_stat['collection_name'] = collections[each_collection].name;
                                    idx_stats.push(each_stat)
                                })
                            }
                        }
                    }
                }
            }
        }

        let stats = lodash.groupBy(idx_stats, (idx_stat) => { return idx_stat.collection_name });
        fs.writeFileSync('output.db', JSON.stringify(stats));
        fs.writeFileSync('output.json', stats);
        console.log("File written to disk");

    } catch (err) {
        console.log(err);
    }
}