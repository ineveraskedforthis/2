'use strict'

import * as dotenv from 'dotenv'
dotenv.config({path: __dirname + '/.env'});

console.log(process.env.PORT)
const port = process.env.PORT || 3000;


import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import express from 'express'
import http from 'http'
import https from 'https'
// var express = require('express');

export type Server = http.Server|https.Server

var options = undefined
if ((process.env.CERT != undefined) && (process.env.KEY != undefined)) {
    console.log('certificate variable is found, attempt to construct according options')
    options = {
        key:    readFileSync(process.env.KEY),
        cert:   readFileSync(process.env.CERT),
    };
} else {
    console.log('no certificate')
}

var server = undefined
var app = express();
if (options == undefined)   {server = http.createServer(app)}
else                        {server = https.createServer(options, app)}

// var http = require('http').createServer(app);

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

server.listen(port, () => {
    console.log('listening on *:' + port);
});


import { launch } from "./game_launch.js";
import { SocketManager } from "./game_modules/client_communication/socket_manager.js";

export var io = require('socket.io')(server);
export var socket_manager = new SocketManager(io)

launch(server)