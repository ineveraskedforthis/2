'use strict'

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

console.log('Welcome')
import * as path from "path";

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '../../../../static')));
app.get('/', (req:any, res:any) => {
    res.sendFile(path.join(__dirname, '../../../../views/index2.html'));
});
http.listen(port, () => {
    console.log('listening on *:3000');
});


import { launch } from "./game_launch.js";
import { SocketManager } from "./game_modules/client_communication/socket_manager.js";

export var io = require('socket.io')(http);
export var socket_manager = new SocketManager(io)

launch(http, app)