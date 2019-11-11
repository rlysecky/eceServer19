var db = require("../db");

// Define the schema
var runSchema = new db.Schema({
    deviceId: String,
    lon: Number,
    lat: Number,
    uv: Number,
    submitTime: { type: Date, default: Date.now }
});

// Creates a Devices (plural) collection in the db using the device schema
var Run = db.model("Run", runSchema);

module.exports = Run;