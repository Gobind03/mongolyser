const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;
const writeLoadAnalysis = require("./write_load.analyser");

exports.get_cluster_stats  = async (connString) => {

    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString, "admin");

    var cluster = { "cluster": "standalone", "databases": [], 
      "keyhole": { "version": "v2.5.0-js", "collected": new Date(), "logs": [] } };
    cluster["keyhole"]["logs"].push(new Date().toISOString()+" keyhole.js began");
    var doc = await mongoDBAdapter.runCommand({ "serverStatus": 1});    

    cluster["host"] = doc["host"];
    cluster["process"] = doc["process"];
    
    cluster["hostInfo"] = await mongoDBAdapter.runCommand({ "hostInfo": 1 })
    cluster["getCmdLineOpts"] = await mongoDBAdapter.runCommand({ "getCmdLineOpts": 1 });
    console.log(cluster["getCmdLineOpts"])
    cluster["buildInfo"] = await mongoDBAdapter.runCommand({ "buildInfo": 1 });
    console.log(cluster["buildInfo"])
    cluster["serverStatus"] = await mongoDBAdapter.runCommand({ "serverStatus": 1 });
    console.log(cluster["serverStatus"])

    if (cluster["cluster"] == "replica") {
      cluster["replSetGetStatus"] = await mongoDBAdapter.runCommand({ "replSetGetStatus": 1 });
    }
    if (doc["process"] == "mongos") {
      cluster["cluster"] = "sharded";
      var shards = await mongoDBAdapter.runCommand({ "listShards": 1 });
      cluster["shards"] = shards["shards"];
    } else if (doc["repl"] != null) {
      cluster["cluster"] = "replica";
      var oplog = await writeLoadAnalysis.get_oplog_stats("",false,mongoDBAdapter) 
      var node = { "host": doc["host"], "oplog": oplog };
      var shard = { "_id": doc["repl"]["setName"], "servers": [] };
      node["buildInfo"] = cluster["buildInfo"];
      node["hostInfo"] = cluster["hostInfo"];
      node["serverStatus"] = cluster["serverStatus"];
      shard.servers.push(node);
      cluster["shards"] = [];
      cluster["shards"].push(shard); 
    } else {
      cluster["cluster"] = "standalone";
    }
    cluster["keyhole"]["logs"].push(new Date().toISOString()+" began GetDatabases()");
    //cluster["databases"] = GetDatabases();
    cluster["keyhole"]["logs"].push(new Date().toISOString()+" ended GetDatabases()");
    cluster["keyhole"]["logs"].push(new Date().toISOString()+" keyhole.js exiting");
   

    return{
        status:200,
        message:"Success",
        cluster:cluster
    }
}
  