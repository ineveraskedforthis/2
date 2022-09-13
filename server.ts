'use strict'

import { launch } from "./game_launch";

require('dotenv').config({path: __dirname + '/.env'});

const port = process.env.PORT || 3000;

var express = require('express');
var app = express();
var http = require('http').createServer(app);

export interface io_type {
    connect(url: string): Socket;
};
export interface Socket {
    on(event: string, callback: (data: any) => void ):void;
    emit(event: string, data: any):void;
}


export var io:io_type = require('socket.io')(http);

var gameloop = require('node-gameloop');
var path = require('path');
var {World} = require("./game_modules/world.js");
var common = require("./game_modules/common.js");
var {constants} = require("./game_modules/static_data/constants.js");


var pool = undefined

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req:any, res:any) => {
    res.sendFile(__dirname + '/views/index2.html');
});
http.listen(port, () => {
    console.log('listening on *:3000');
});

launch()