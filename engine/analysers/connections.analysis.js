const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;


exports.get_current_conn_analysis = async (connectionString) => {
    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connectionString);

    let serverStatus = await mongoDBAdapter.runCommand({ serverStatus: 1 })

    return {
        current_connections: serverStatus.connections.current,
        available_connections: serverStatus.connections.available,
        total_created_connections: serverStatus.connections.totalCreated,
        active_connections: serverStatus.connections.active
    }
};