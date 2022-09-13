'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const game_launch_1 = require("./game_launch");
require('dotenv').config({ path: __dirname + '/.env' });
const port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
;
exports.io = require('socket.io')(http);
var gameloop = require('node-gameloop');
var path = require('path');
var { World } = require("./game_modules/world.js");
var common = require("./game_modules/common.js");
var { constants } = require("./game_modules/static_data/constants.js");
var pool = undefined;
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index2.html');
});
http.listen(port, () => {
    console.log('listening on *:3000');
});
(0, game_launch_1.launch)();
