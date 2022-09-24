const LocalDBAdapter = require("../adapters/nedb.adapter").LocalDBAdapter;
const fs = require("fs");
const es = require('event-stream');
const { is_valid_json } = require("../utils/common.utility");

exports.analyse_events = (log_file) => {
    // Create NeDB Instance
    let countMap = new Map();
    let count = 0;

    // Initiate Log Stream
    let stream = fs.createReadStream(log_file)
        .pipe(es.split())
        .pipe(es.mapSync(function (log_line) {
            // Pause the log stream to process the line
            stream.pause();
            if (log) {
                if (is_valid_json(log_line)) {
                    let logObject = JSON.parse(log_line);

                    // process log here and call s.resume() when ready
                    if (logObject != null) {
                        if (countMap.get(logObject.msg) == null) {
                            countMap.set(logObject.msg, 1);
                        } else {
                            count = countMap.get(logObject.msg);
                            count++;
                            countMap.set(logObject.msg, count);
                        }
                    }
                }
            }

            // resume the read stream, possibly from a callback
            stream.resume();
        }))
        .on('error', function (err) {
            return {
                success: false,
                message: err.message
            };
        })
        .on('end', function () {
            let data_to_return = {};
            for (let [key, value] of countMap) {
                data_to_return[key] = value;
            }
            return data_to_return;
        });
}