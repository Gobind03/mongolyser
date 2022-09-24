const LocalDBAdapter = require("../adapters/nedb.adapter").LocalDBAdapter;
const fs = require("fs");
const es = require('event-stream');
const {
    process_aggregation,
    filter_commands,
    parse_optype,
    redact_v2,
    is_valid_json
} = require('../utils/common.utility');

exports.analyse_queries = async (channel, log_file, slow_ms = 100) => {

  console.log("File Path recevied", log_file);

  return new Promise((resolve, reject) => {
    let parsed_log_summary = {
        nCOLLSCAN: 0,
        nSlowOps: 0,
        nFind: 0,
        nGetMore: 0,
        nAggregate: 0,
        nInsert: 0,
        nUpdate: 0,
        slowestOp: 0,
        nCount: 0,
        slowestQuery: ""
    };

    // Create NeDB Instance
    let local_db_detail = new LocalDBAdapter("query_analysis_detail");
    let local_db_summary = new LocalDBAdapter("query_analysis_summary");

    // Initiate Log Stream
    let stream = fs.createReadStream(log_file)
        .pipe(es.split())
        .pipe(es.mapSync(function (log_line) {
            // Pause the log stream to process the line
            stream.pause();

            // Ignore if log line is empty or null
            if (!(log_line === '' || log_line === null || is_valid_json(log_line))) {

                // Parse Log Line to JSON
                let log = JSON.parse(log_line)

                // Only parse commands for the scope
                // Filter out the commands with undefined attr and ns
                if (log.c === "COMMAND"
                    && typeof (log.attr) != 'undefined'
                    && typeof (log.attr.ns) != 'undefined') {

                    // Set default appName
                    if (!log.attr.appName) log.attr.appName = "";

                    // Filter Out System Commands
                    if (filter_commands(log.attr)) {

                        /*  
                            Detect OpType
                            Current list of supported opTypes include Insert, Find, Update,
                            getMore, Aggregate & Count 
                        */
                        let opType = parse_optype(log.attr.command);

                        // Check for acceptable OpType
                        if (!opType) {
                            // Filter Query Details
                            let parsed_log = {
                                "Op Type": opType,
                                "Duration": log.attr.durationMillis,
                                "QTR": "-",
                                "Namespace": log.attr.ns,
                                "Filter": {},
                                "Sort": "No Sort",
                                "Lookup": "N.A.",
                                "Blocking": "N.A.",
                                "Plan Summary": "N.A.",
                                "App Name": log.attr.appName,
                                "QueryHash": log.attr.queryHash,
                                "Log": log_line
                            }

                            // Calculate SlowOp Count
                            if (parsed_log.Duration >= slow_ms) {
                                parsed_log_summary.nSlowOps++;
                            }

                            if (opType === "Find") {
                                parsed_log.Filter = log.attr.command.filter;
                                parsed_log.Sort = (log.attr.command.sort) ? JSON.stringify(log.attr.command.sort) : "No Sort";
                                parsed_log["Plan Summary"] = log.attr.planSummary;
                                if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                parsed_log_summary.nFind++;

                                // Calculate QTR
                                if (log.attr.nreturned == 0) {
                                    parsed_log.QTR = "No Document Returned";
                                }
                                else {
                                    parsed_log.QTR = log.attr.docsExamined / log.attr.nreturned;
                                    parsed_log.QTR = Math.round(parsed_log.QTR)
                                }
                            }
                            if (opType === "Count") {
                                parsed_log.Filter = log.attr.command.query;
                                parsed_log["Plan Summary"] = log.attr.planSummary;
                                if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                parsed_log_summary.nCount++;

                                // In case of Count - QTR will always be equal to docs examined
                                parsed_log.QTR = log.attr.docsExamined;
                            }
                            if (opType === "Aggregate") {
                                let aggregation = process_aggregation(log.attr.command.pipeline);
                                parsed_log.Filter = aggregation.filter;
                                parsed_log.Sort = aggregation.sort;
                                parsed_log.Blocking = aggregation.blocking;
                                parsed_log.Lookup = aggregation.lookup;
                                parsed_log["Plan Summary"] = log.attr.planSummary;
                                if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                parsed_log_summary.nAggregate++;

                                // Calculate QTR
                                if (log.attr.nreturned == 0) {
                                    parsed_log.QTR = "No Document Returned";
                                }
                                else {
                                    parsed_log.QTR = log.attr.docsExamined / log.attr.nreturned;
                                    parsed_log.QTR = Math.round(parsed_log.QTR)
                                }
                            }
                            if (opType === "getMore") {
                                if (typeof (log.attr.originatingCommand.pipeline) != "undefined") {
                                    let aggregation = process_aggregation(log.attr.originatingCommand.pipeline);
                                    parsed_log.Filter = aggregation.filter;
                                    parsed_log.Sort = aggregation.sort;
                                    parsed_log.Blocking = aggregation.blocking;
                                    parsed_log.Lookup = aggregation.lookup;
                                } else {
                                    parsed_log.Filter = log.attr.originatingCommand.filter;
                                    parsed_log.Sort = (log.attr.originatingCommand.sort) ? JSON.stringify(log.attr.originatingCommand.sort) : "No Sort";
                                }
                                parsed_log["Plan Summary"] = log.attr.planSummary;
                                if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                parsed_log_summary.nGetMore++;
                            }
                            if (opType === "Update") {
                                // Bypass UpdateMany Logs As they do not contain much information
                                if (typeof (log.attr.command.updates[0]) != 'undefined')
                                    parsed_log.Filter = log.attr.command.updates[0].q;

                                if (parsed_log["Plan Summary"] === "COLLSCAN") parsed_log_summary.nCOLLSCAN++;
                                parsed_log_summary.nUpdate++;
                            }
                            if (opType === "Insert") {
                                parsed_log_summary.nInsert++;
                            }

                            if (parsed_log.Duration > parsed_log_summary.slowestOp) {
                                parsed_log_summary.slowestOp = parsed_log.Duration;
                                parsed_log_summary.slowestQuery = JSON.stringify(parsed_log.Filter);
                            }

                            // Insert to local data store in temp directory
                            local_db_detail.insert(parsed_log);
                        }
                    }
                }
            }

            // resume the read stream, possibly from a callback
            stream.resume();
        }))
        .on('error', function (err) {
            reject({
                status: 500,
                success: false,
                message: err.message
            })
            return {
                
            };
        })
        .on('end', function () {
            local_db_summary.insert(parsed_log_summary);
            resolve({
                status: 200,
                data: {
                  summary: parsed_log_summary
                },
                success: true,
                message: "Analysis Saved in Local Data Store"
            })
        });
  })
}