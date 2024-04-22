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
const path = __importStar(require("path"));
console.log(path.join(__dirname, '/.env'));
dotenv.config({ path: path.join(__dirname, '/.env') });
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
app.use(express_1.default.json());
app.use('/static', express_1.default.static(path.join(__dirname, '../../../../static')));
app.get('/api/:API_KEY/character/:charID', (req, res) => {
    const id = Number(req.params.charID);
    // console.log(`request cell terrain ${id}`)
    res.set('Access-Control-Allow-Origin', '*');
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({ valid: false, reason: 'wrong_api_key' });
        return;
    }
    if (isNaN(id)) {
        res.json({ valid: false, reason: 'id is NaN' });
        return;
    }
    const character = data_objects_js_1.Data.Characters.from_number(id);
    if (character == undefined) {
        res.json({ valid: false, reason: 'no_character' });
        return;
    }
    const response = {
        valid: true,
        name: character.get_name(),
        status: character.status,
        stats: character.stats,
        cell: character.cell_id,
        savings: character.savings,
        stash: character.stash,
        equip: extract_data_js_1.Extract.EquipData(character.equip),
        skills: character._skills,
        perks: character._perks,
        traits: character._traits,
        user_id: character.user_id,
    };
    res.json(response);
});
app.get('/api/:API_KEY/cell/:cellID', (req, res) => {
    const id = Number(req.params.cellID);
    // console.log(`request cell ${id}`)
    res.set('Access-Control-Allow-Origin', '*');
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({ valid: false });
        return;
    }
    if (isNaN(id)) {
        res.json({ valid: false });
        return;
    }
    const cell = data_objects_js_1.Data.Cells.from_id(id);
    if (cell == undefined) {
        res.json({ valid: false });
        return;
    }
    const response = {
        valid: true,
        scent: cell.rat_scent,
        local_characters: data_id_js_1.DataID.Cells.local_character_id_list(cell.id).map(systems_communication_js_1.Convert.character_id_to_character_view)
    };
    res.json(response);
});
app.get('/api/:API_KEY/map', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.params.API_KEY != process.env.API_KEY) {
        res.json({ valid: false });
        return;
    }
    const cells = [];
    data_objects_js_1.Data.Cells.for_each(cell => {
        cells[cell.id] = {
            index: cell.id,
            terrain: data_objects_js_1.Data.World.id_to_terrain(cell.id),
            scent: cell.rat_scent,
            population: data_id_js_1.DataID.Cells.local_character_id_list(cell.id).length
        };
    });
    res.json({
        width: data_objects_js_1.Data.World.get_world_dimensions()[0],
        height: data_objects_js_1.Data.World.get_world_dimensions()[1],
        cells: cells
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../../views/index2.html'));
});
server.listen(port, () => {
    console.log('listening on *:' + port);
});
require(".././../game_content/src/content.js");
const game_launch_js_1 = require("./game_launch.js");
const data_id_js_1 = require("./game_modules/data/data_id.js");
const data_objects_js_1 = require("./game_modules/data/data_objects.js");
const socket_manager_js_1 = require("./game_modules/client_communication/socket_manager.js");
const systems_communication_js_1 = require("./game_modules/systems_communication.js");
const extract_data_js_1 = require("./game_modules/data-extraction/extract-data.js");
exports.io = require('socket.io')(server, { path: '/socket.io' });
exports.socket_manager = new socket_manager_js_1.SocketManager(exports.io);
(0, game_launch_js_1.launch)(server);

