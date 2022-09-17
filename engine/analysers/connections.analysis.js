const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;


exports.get_current_conn_analysis = async (host, user, password, port = 27017,
    is_srv = false, queryString) => {
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(host, user, password, "local", port, is_srv, queryString);

    let serverStatus = await mongoDBAdapter.runCommand({ serverStatus: 1 })

    return {
        current_connections: serverStatus.connections.current,
        available_connections: serverStatus.connections.available,
        total_created_connections: serverStatus.connections.totalCreated,
        active_connections: serverStatus.connections.active
    }
};