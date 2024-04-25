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

    const character = Data.Characters.from_number(id)
    if (character == undefined) {
        res.json({valid: false, reason: 'no_character'})
        return
    }
    const response = {
        valid: true,
        name: character.get_name(),
        status: character.status,
        stats: character.stats,
        cell: character.cell_id,
        savings: character.savings,
        stash: character.stash,
        equip: Extract.EquipData(character.equip),
        skills: character._skills,
        perks: character._perks,
        traits: character._traits,
        user_id: character.user_id,
    }
    res.json(response)
})

app.get('/api/:API_KEY/cell/:cellID', (req: Request, res: Response) => {
    const id = Number(req.params.cellID)
    // console.log(`request cell ${id}`)

    res.set('Access-Control-Allow-Origin', '*');
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({valid: false})
        return
    }
    if (isNaN(id)) {
        res.json({valid: false})
        return
    }

    const cell = Data.Cells.from_id(id as cell_id)
    if (cell == undefined) {
        res.json({valid: false})
        return
    }

    const local_characters : character_id[] = []
    DataID.Cells.for_each_guest(cell.id, (id) => {
        local_characters.push(id)
    })

    const response = {
        valid: true,
        scent: cell.rat_scent,
        local_characters: local_characters.map(Convert.character_id_to_character_view)
    }
    res.json(response)
})

app.get('/api/:API_KEY/map', (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({valid: false})
        return
    }

    const cells: Record<cell_id, CellView> = []

    Data.Cells.for_each(cell => {
        cells[cell.id] = {
            index: cell.id,
            terrain: Data.World.id_to_terrain(cell.id),
            scent: cell.rat_scent,
            population: DataID.Cells.guests_amount(cell.id)
        }
    })

    res.json({
        width: Data.World.get_world_dimensions()[0],
        height: Data.World.get_world_dimensions()[1],
        cells: cells
    })
})

app.get('/', (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, '../../../../views/index2.html'));
});



server.listen(port, () => {
    console.log('listening on *:' + port);
});

import "@content/content.js"
import { launch } from "./game_launch.js";
import { DataID } from './game_modules/data/data_id.js';
import { Data } from './game_modules/data/data_objects.js';
import { SocketManager } from "./game_modules/client_communication/socket_manager.js";
import { CellView } from '@custom_types/common.js';
import { cell_id, character_id } from "@custom_types/ids.js";
import { Convert } from './game_modules/systems_communication.js';
import { Extract } from './game_modules/data-extraction/extract-data.js';

export var io = require('socket.io')(server, { path: '/socket.io' });
export var socket_manager = new SocketManager(io)

launch(server)