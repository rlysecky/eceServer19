var db = require("../db");

// Define the schema
var activitySchema = new db.Schema({
    deviceId: String,
    lon: Number,
    lat: Number,
    uv: Number,
    speed: Number,
    submitTime: { type: Date, default: Date.now }
});

// Creates a Devices (plural) collection in the db using the device schema
var Activity = db.model("Activity", activitySchema);

module.exports = Activity;