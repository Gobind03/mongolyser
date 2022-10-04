const MongoDBAdapter = require("../adapters/mongodb.adapter").MongoDBAdapter;
/**
 * This class in under progress
 * @param {*} connString 
 */
exports.get_cache_analyser  = async (connString) => {

    // Connect to MongoDB 
    let mongoDBAdapter = new MongoDBAdapter();
    await mongoDBAdapter.connect(connString, "admin");

    var dbInfos = mongoDBAdapter.runAdminCommand({listDatabases:1, nameOnly: true})
    dbNames = []
    
    for(d=0;d<dbInfos.databases.length;d++) {
        dbName = dbInfos.databases[d];
        dbNames.push(dbName.name)
    }
    
    collectionInfos = []

for(d=0;d<dbNames.length;d++){
    collectionNames = db.getSiblingDB(dbNames[d]).getCollectionInfos({"type": "collection"},{"nameOnly": true});
    for(c=0;c<collectionNames.length;c++) {
        indexesSpec = db.getSiblingDB(dbNames[d]).getCollection(collectionNames[c]['name']).getIndexes();

        indexesInfo = []

        for (i=0;i<indexesSpec.length;i++){
            indexesInfo.push({name:indexesSpec[i].name,
            inCache:0,
            cacheRead:0,
            cacheWrite:0,
            pagesUsed:0
            })
        }
        collectionInfos.push({db:dbNames[d],
            coll:collectionNames[c]['name'],
            inCache:0,
            cacheRead:0,
            cacheWrite:0,
            pagesUsed:0,
            indexesInfo:indexesInfo
        })
    }
}

reportTime = 10
while(true){
        print('\033[2J')
        print( "Collection                                                           \tSize\tCached\t%age\tDelta\tRead\tWritten\tUsed")

    for(c=0;c<collectionInfos.length;c++) {
        collInfo = collectionInfos[c]
        db = db.getSiblingDB(collInfo.db)
        mb = 1024*1024
        collStats = db.getCollection(collInfo.coll).stats({scale: mb, indexDetails: true})

        if (collInfo.coll.startsWith('system.')) {
            continue;
        }

        if(collStats.hasOwnProperty("codeName") && collStats["codeName"] == "CommandNotSupportedOnView"){
            // stats not supported on view
            continue;
        }

        inCache = Math.floor(collStats["wiredTiger"]["cache"]["bytes currently in the cache"]/mb)
        cacheRead = Math.floor(collStats["wiredTiger"]["cache"]["bytes read into cache"]/mb)
        cacheWrite = Math.floor(collStats["wiredTiger"]["cache"]["bytes written from cache"]/mb)
        pagesUsed = Math.floor(collStats["wiredTiger"]["cache"]["pages requested from the cache"])
        collSize = collStats["size"] + collStats['totalIndexSize']
        //Compute diffs
        sizeDiff = Math.floor((inCache - collInfo.inCache)/reportTime)
        readDiff = Math.floor((cacheRead - collInfo.cacheRead)/reportTime)
        writeDiff = Math.floor((cacheWrite - collInfo.cacheWrite)/reportTime)
        pageUseDiff = Math.floor((pagesUsed - collInfo.pagesUsed)/reportTime)

        name = collInfo.db + "." + collInfo.coll
        lgth = name.length<=70?name.length:70
        name = name + Array(70 - lgth).join(" ")

        if(collSize > 0) {
            pc = Math.floor((inCache / collSize) * 100)
            print(  name + "\t" + collSize + "\t" +  inCache + "\t" + pc + "\t" + sizeDiff + "\t" + readDiff + "\t" + writeDiff+"\t"+pageUseDiff)
        }
        collectionInfos[c].inCache = inCache
        collectionInfos[c].cacheRead = cacheRead
        collectionInfos[c].cacheWrite = cacheWrite
        collectionInfos[c].pagesUsed = pagesUsed

        // print index stats
        for(i=0;i<collInfo.indexesInfo.length;i++){
            indexInfo = collInfo.indexesInfo[i]
            nameIndex = indexInfo.name

            indexStats = collStats.indexDetails[nameIndex]
            indexInCache = Math.floor(indexStats["cache"]["bytes currently in the cache"]/mb)
            indexCacheRead = Math.floor(indexStats["cache"]["bytes read into cache"]/mb)
            indexCacheWrite = Math.floor(indexStats["cache"]["bytes written from cache"]/mb)
            indexPagesUsed = Math.floor(indexStats["cache"]["pages requested from the cache"])
            indexSize = collStats.indexSizes[nameIndex]

            //Compute diffs
            sizeDiff = Math.floor((indexInCache - indexInfo.inCache)/reportTime)
            readDiff = Math.floor((indexCacheRead - indexInfo.cacheRead)/reportTime)
            writeDiff = Math.floor((indexCacheWrite - indexInfo.cacheWrite)/reportTime)
            pageUseDiff = Math.floor((indexPagesUsed - indexInfo.pagesUsed)/reportTime)

            nameTab =Array(10).join(" ") + nameIndex + Array(Math.max(0,60 - nameIndex.length)).join(" ")

            if(indexSize > 0) {
                pc = Math.floor((indexInCache / indexSize) * 100)
                print( nameTab + "\t" + indexSize + "\t" +  indexInCache + "\t" + pc + "\t" + sizeDiff + "\t" + readDiff + "\t" + writeDiff+"\t"+pageUseDiff)
            }

            collectionInfos[c].indexesInfo[i].inCache = indexInCache
            collectionInfos[c].indexesInfo[i].cacheRead = indexCacheRead
            collectionInfos[c].indexesInfo[i].cacheWrite = indexCacheWrite
            collectionInfos[c].indexesInfo[i].pagesUsed = indexPagesUsed
        }
    }
    sleep(reportTime * 1000)

}
}