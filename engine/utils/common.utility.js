const qs = require("qs");


exports.sort_by_key = (array, key) => {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
};

exports.millisToMinutesAndSeconds = (millis) => {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

exports.process_aggregation = (pipeline) => {
    let final_data = {
        filter: {},
        sort: "",
        blocking: "No",
        lookup: "No"
    };
    for (let i = 0; i < pipeline.length; i++) {
        let stage = "";

        // Get Stage Name
        for (key in pipeline[i]) {
            stage = key;
            break;
        }
        if (stage === "$match") {
            // final_data.filter = final_data.filter + " " + JSON.stringify(pipeline[i]["$match"]);
            final_data.filter = pipeline[i]["$match"];
        }
        if (stage === "$sort") {
            final_data.sort = final_data.sort + " " + JSON.stringify(pipeline[i]["$sort"]);
        }
        if (stage === "$lookup") {
            final_data.lookup = "Yes";
        }
        if (stage === "$group" || stage === "$bucket" || stage === "$bucketAuto") {
            final_data.blocking = "Yes";
        }
    }

    if (final_data.sort === "") final_data.sort = "N.A."
    if (final_data.filter === "") final_data.sort = JSON.stringify({})

    return final_data;
};

exports.filter_commands = (attr) => {
    return (attr.ns.split(".")[0] !== "admin"
        && attr.ns.split(".")[0] !== "local"
        && attr.ns.split(".")[0] !== "config"
        && attr.ns.split(".")[1] !== "$cmd"
        && !attr.appName.includes("mongot")
        && typeof (attr.command.createIndexes) == "undefined")
};

exports.parse_optype = (command) => {
    if (typeof (command.insert) != "undefined")
        return "Insert";
    else if (typeof (command.find) != "undefined")
        return "Find";
    else if (typeof (command.update) != "undefined")
        return "Update";
    else if (typeof (command.getMore) != "undefined")
        return "getMore";
    else if (typeof (command.aggregate) != "undefined")
        return "Aggregate";
    else if (typeof (command.count) != "undefined")
        return "Count";
    else
        return false;
};


exports.redact = (filter) => {
    for (let property in filter) {
        if (filter.hasOwnProperty(property)) {
            if (typeof filter[property] == "object") {
                for (var p_l2 in filter[property]) {
                    filter[property][p_l2] = "[REDACTED]"
                }
            } else {
                filter[property] = "[REDACTED]"
            }
        }
    }
    return JSON.stringify(filter);
};

exports.redact_v2 = (filter) => {
    const topLevelTokens = qs.stringify(filter).split("&");
    return JSON.stringify(qs.parse(topLevelTokens.map(tk => {
        const [pre, val] = tk.split("=");
        return [pre, "1"].join("=")
    }).join("&")))
}

exports.is_valid_json = (jsonString) => {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return true;
        }
    }
    catch (e) { }

    return false;
};