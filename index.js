/*global require,module*/
const net = require("net");
const xml2js = require("xml2js");

class Eagle
{
    constructor(host, port) {
        this._host = host;
        this._port = port || 5002;
        this._fastPoll = false;
        this._parser = new xml2js.Parser();
    }

    get fastPoll() { return this._fastPoll; }
    set fastPoll(fp) { this.fastPoll = fp; }

    _connect() {
        return new Promise((resolve, reject) => {
            let socket = net.connect(this._port, this._host, () => {
                socket.removeAllListeners("error");
                resolve(socket);
            });
            socket.on("error", (err) => {
                reject(err);
            });
        });
    }

    request(cmd) {
        let buffer = "";
        return new Promise((resolve, reject) => {
            this._connect().then((socket) => {
                const top = this._fastPoll ? "RavenCommand" : "LocalCommand";
                let xml = `<${top}>\n`;
                for (let k in cmd) {
                    xml += `<${k}>${cmd[k]}</${k}>`;
                }
                socket.write(xml + `</${top}>\r\n`, "utf8");

                socket.on("error", (err) => {
                });
                socket.on("timeout", () => {
                    socket.end();
                });
                socket.on("close", () => {
                    reject();
                });
                socket.on("data", (data) => {
                    buffer += data.toString("utf8");
                    this._parser.parseString(buffer, (err, data) => {
                        if (err) {
                            return;
                        }
                        resolve(data);
                    });
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }
}

module.exports = Eagle;
