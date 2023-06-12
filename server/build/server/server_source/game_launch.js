"use strict";
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
exports.launch = void 0;
const fs_1 = require("fs");
// Always the first.
const data_1 = require("./game_modules/data");
//importing order is important because of global lists of entities
const system_1 = require("./game_modules/character/system");
const system_2 = require("./game_modules/map/system");
const user_manager_1 = require("./game_modules/client_communication/user_manager");
// import { http, io_type } from "./server";
const action_manager_1 = require("./game_modules/actions/action_manager");
const auth_1 = require("./game_modules/client_communication/network_actions/auth");
const events_1 = require("./game_modules/events/events");
const systems_communication_1 = require("./game_modules/systems_communication");
const system_3 = require("./game_modules/battle/system");
const events_2 = require("./game_modules/battle/events");
require("./game_modules/craft/craft");
const path = __importStar(require("path"));
const SAVE_GAME_PATH_1 = require("./SAVE_GAME_PATH");
const game_master_1 = require("./game_modules/game_master");
if (!(0, fs_1.existsSync)(SAVE_GAME_PATH_1.SAVE_GAME_PATH)) {
    (0, fs_1.mkdirSync)(SAVE_GAME_PATH_1.SAVE_GAME_PATH);
}
console.log(SAVE_GAME_PATH_1.SAVE_GAME_PATH);
const version_path = path.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'version.txt');
function get_version_raw() {
    if (!(0, fs_1.existsSync)(version_path)) {
        (0, fs_1.writeFileSync)(version_path, '0');
    }
    return (0, fs_1.readFileSync)(version_path).toString();
}
function set_version(n) {
    console.log('set version ' + n);
    (0, fs_1.writeFileSync)(version_path, '' + n);
    return n;
}
function get_version() {
    let data = Number(get_version_raw());
    return data;
}
const gameloop = require('node-gameloop');
var shutdown = false;
function launch(http_server) {
    try {
        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received. Preparing for shutdown');
            shutdown = true;
        });
        process.on('SIGINT', () => {
            console.info('SIGINT signal received. Preparing for shutdown');
            shutdown = true;
        });
        process.on('SIGHUP', () => {
            console.info('SIGHUP signal received. Preparing for shutdown');
            shutdown = true;
        });
        console.log('reading save files');
        console.log('connection ready');
        load();
        console.log('systems are ready');
        gameloop.setGameLoop((delta) => update(delta, http_server), 100);
    }
    catch (e) {
        console.log(e);
    }
}
exports.launch = launch;
function load() {
    // MapSystem.load()
    data_1.Data.load();
    user_manager_1.UserManagement.load_users();
    auth_1.Auth.load();
    system_3.BattleSystem.load();
    const characters = data_1.Data.CharacterDB.list_of_id();
    //validating ids and connections
    for (const character of characters) {
        const object = data_1.Data.CharacterDB.from_id(character);
        systems_communication_1.Link.character_and_cell(character, object.cell_id);
        const battle = systems_communication_1.Convert.character_to_battle(object);
        if (battle == undefined) {
            object.battle_id = -1;
            object.battle_unit_id = -1;
        }
        // EventMarket.clear_orders(character)
    }
    for (const battle of data_1.Data.Battle.list()) {
        console.log('test battle for shadow units');
        for (let unit of Object.values(battle.heap.data)) {
            let id = unit.char_id;
            let character = data_1.Data.CharacterDB.from_id(id);
            if (character == undefined || !character.in_battle()) {
                events_2.BattleEvent.Leave(battle, unit);
            }
        }
    }
    let version = get_version();
    if (version == 0) {
        const factions = data_1.Data.World.get_factions();
        for (const item of factions) {
            game_master_1.GameMaster.spawn_faction(item.spawn_point, item.tag);
        }
        set_version(1);
    }
}
function save() {
    user_manager_1.UserManagement.save_users();
    auth_1.Auth.save();
    system_3.BattleSystem.save();
    data_1.Data.save();
}
var update_timer = 0;
// seconds
function update(delta, http_server) {
    if (shutdown) {
        http_server.close();
        // express_server.close(() => {
        //     console.log('express server closed')
        // })
        save();
        process.exit(0);
    }
    system_1.CharacterSystem.update(delta);
    action_manager_1.ActionManager.update_characters(delta);
    user_manager_1.UserManagement.update_users();
    system_3.BattleSystem.update(delta * 1000);
    let rats = 0;
    let elos = 0;
    let humans = 0;
    for (let character of data_1.Data.CharacterDB.list()) {
        if (character.dead()) {
            events_1.Event.death(character);
        }
    }
    system_2.MapSystem.update(delta);
    game_master_1.GameMaster.update(delta);
    update_timer += delta;
    if (update_timer > 50000) {
        save();
        update_timer = 0;
    }
}
