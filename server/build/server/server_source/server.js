'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket_manager = exports.io = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '/.env' });
console.log(process.env.PORT);
const port = process.env.PORT || 3000;
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
var options = undefined;
if ((process.env.CERT != undefined) && (process.env.KEY != undefined)) {
    console.log('certificate variable is found, attempt to construct according options');
    options = {
        key: (0, fs_1.readFileSync)(process.env.KEY),
        cert: (0, fs_1.readFileSync)(process.env.CERT),
    };
}
else {
    console.log('no certificate');
}
var server = undefined;
var app = (0, express_1.default)();
if (options == undefined) {
    server = http_1.default.createServer(app);
}
else {
    server = https_1.default.createServer(options, app);
}
;
console.log('Welcome');
const path = __importStar(require("path"));
app.use(express_1.default.json());
app.use('/static', express_1.default.static(path.join(__dirname, '../../../../static')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../../views/index2.html'));
});
server.listen(port, () => {
    console.log('listening on *:' + port);
});
const game_launch_js_1 = require("./game_launch.js");
const socket_manager_js_1 = require("./game_modules/client_communication/socket_manager.js");
exports.io = require('socket.io')(http_1.default);
exports.socket_manager = new socket_manager_js_1.SocketManager(exports.io);
(0, game_launch_js_1.launch)(server);
