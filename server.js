'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = void 0;
require('dotenv').config({ path: __dirname + '/.env' });
const port = process.env.PORT || 3000;
var express = require('express');
var app = express();
exports.http = require('http').createServer(app);
;
var gameloop = require('node-gameloop');
var path = require('path');
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index2.html');
});
exports.http.listen(port, () => {
    console.log('listening on *:3000');
});
const game_launch_1 = require("./game_launch");
(0, game_launch_1.launch)();
