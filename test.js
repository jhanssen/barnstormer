/*global require,process*/
const Eagle = require("./index");

var argv = require('minimist')(process.argv.slice(2));

let host = argv["host"];
if (typeof host !== "string") {
    console.error("need a hostname");
    process.exit();
}
let port = parseInt(argv["port"]);
if (isNaN(port) || !port) {
    port = undefined;
}

const eagle = new Eagle(host, port);
eagle.request({ Name: "list_devices" }).then((data) => {
    console.log("response:", data);
    const mac = data.DeviceInfo.DeviceMacId;
    return eagle.request({ Name: "get_instantaneous_demand", MacId: mac });
}).then((data) => {
    console.log("inst:", data);
}).catch((err) => {
    console.error("error:", err);
});
