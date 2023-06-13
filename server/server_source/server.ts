'use strict'

import * as dotenv from 'dotenv'
import * as path from "path";
console.log(path.join(__dirname, '/.env'))
dotenv.config({path: path.join(__dirname, '/.env')});

console.log(process.env.PORT)
const port = process.env.PORT || 3000;


import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import express, { Request, Response } from 'express'
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


app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '../../../../static')));



app.get('/api/:API_KEY/character/:charID', (req: Request, res: Response) => {
    const id = Number(req.params.charID)
    // console.log(`request cell terrain ${id}`)
    res.set('Access-Control-Allow-Origin', '*');

    
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({valid: false, reason: 'wrong_api_key'})
        return
    }

    if (isNaN(id)) {
        res.json({valid: false, reason: 'id is NaN'})
        return
    }

    const character = Data.CharacterDB.from_id(id)
    if (character == undefined) {
        res.json({valid: false, reason: 'no_character'})
        return
    }
    const response = {
        valid: true,
        name: character.name,
        status: character.status,
        stats: character.stats,
        cell: character.cell_id,
        savings: character.savings,
        stash: character.stash,
        equip: character.equip.get_data(),
        skills: character.skills,
        perks: character.perks,
        user_id: character.user_id,
    }    
    res.json(response)
})

// app.get('/api/:API_KEY/cell/:cellID', (req: Request, res: Response) => {
//     const id = Number(req.params.cellID)
//     // console.log(`request cell ${id}`)

//     res.set('Access-Control-Allow-Origin', '*');
//     if (req.params.API_KEY != process.env.API_KEY) {
//         res.json({valid: false})
//         return
//     }
//     if (isNaN(id)) {
//         res.json({valid: false})
//         return
//     }

//     const cell = MapSystem.id_to_cell(id as cell_id)
//     if (cell == undefined) {
//         res.json({valid: false})
//         return
//     }
//     const response = {
//         valid: true,
//         terrain: cell.terrain,
//         development: cell.development,
//         scent: cell.rat_scent,
//         local_characters: cell.saved_characters_list
//     }    
//     res.json(response)
// })

// app.get('/api/:API_KEY/cell/terrain/:cellID', (req: Request, res: Response) => {
//     const id = Number(req.params.cellID)
//     // console.log(`request cell terrain ${id}`)

//     res.set('Access-Control-Allow-Origin', '*');
//     if (req.params.API_KEY != process.env.API_KEY) {
//         res.json({valid: false})
//         return
//     }
//     if (isNaN(id)) {
//         res.json({valid: false})
//         return
//     }

//     const cell = MapSystem.id_to_cell(id as cell_id)
//     if (cell == undefined) {
//         res.json({valid: false})
//         return
//     }
//     const response = {
//         valid: true,
//         terrain: cell.terrain,
//         development: cell.development,
//         scent: cell.rat_scent,
//         population: cell.saved_characters_list.length
//     }    
//     res.json(response)
// })

// app.get('/api/:API_KEY/map', (req: Request, res: Response) => {
//     res.set('Access-Control-Allow-Origin', '*');
//     if (req.params.API_KEY != process.env.API_KEY) {
//         res.json({valid: false})
//         return
//     }

//     const cells = []
//     for (let cell of MapSystem.get_cells()) {
//         if (cell == undefined) continue

//         cells[cell.id] = {
//             index: cell.id,
//             terrain: cell.terrain,
//             development: cell.development,
//             scent: cell.rat_scent,
//             population: cell.saved_characters_list.length
//         }
//     }

//     res.json({
//         width: MapSystem.get_size()[0],
//         height: MapSystem.get_size()[1],
//         cells: cells
//     })
// })

app.get('/', (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, '../../../../views/index2.html'));
});



server.listen(port, () => {
    console.log('listening on *:' + port);
});


import { launch } from "./game_launch.js";
import { SocketManager } from "./game_modules/client_communication/socket_manager.js";
import { Data } from './game_modules/data.js';

export var io = require('socket.io')(server);
export var socket_manager = new SocketManager(io)

launch(server)