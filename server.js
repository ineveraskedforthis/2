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
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
require('dotenv').config({ path: __dirname + '/.env' });
const port = process.env.PORT || 3000;
var express = require('express');
var app = express();
exports.http = require('http').createServer(app);
;
console.log('Welcome');
const path = __importStar(require("path"));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index2.html');
});
exports.http.listen(port, () => {
    console.log('listening on *:3000');
});
const game_launch_js_1 = require("./game_launch.js");
(0, game_launch_js_1.launch)(exports.http, app);
