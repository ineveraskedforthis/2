import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

// Always the first.
import { DataID } from "./game_modules/data/data_id";
import { Data } from "./game_modules/data/data_objects";
//importing order is important because of lists of entities defined in these files

import { CharacterSystem } from "./game_modules/character/system";
import { MapSystem } from "./game_modules/map/system";
import { SocketManager } from "./game_modules/client_communication/socket_manager";
import { UserManagement } from "./game_modules/client_communication/user_manager";



// import { http, io_type } from "./server";
import { ActionManager } from "./game_modules/actions/manager";
import { Auth } from "./game_modules/client_communication/network_actions/auth";
import { Event } from "./game_modules/events/events";
import { Convert, Link } from "./game_modules/systems_communication";
import { BattleSystem } from "./game_modules/battle/system";
import { MarketOrders, ItemOrders } from "./game_modules/market/system";
import { Server } from "./server";
import { EventMarket } from "./game_modules/events/market";
import { BattleEvent } from "./game_modules/battle/events";
import { convertTypeAcquisitionFromJson } from "typescript";

import "./game_modules/craft/craft"
import * as path from "path";
import { SAVE_GAME_PATH } from "./SAVE_GAME_PATH";
import { GameMaster } from "./game_modules/game_master";
import { ms } from "@custom_types/battle_data";


if (!existsSync(SAVE_GAME_PATH)){
    mkdirSync(SAVE_GAME_PATH);
}
console.log(SAVE_GAME_PATH)
const version_path = path.join(SAVE_GAME_PATH, 'version.txt')
function get_version_raw():string {
    if (!existsSync(version_path)) {
        writeFileSync(version_path, '0')
    }
    return readFileSync(version_path).toString()
}
function set_version(n: number) {
    console.log('set version ' + n)
    writeFileSync(version_path, '' + n)
    return n
}
function get_version():number {
    let data = Number(get_version_raw())
    return data
}

const gameloop = require('node-gameloop');
var shutdown = false

export function launch(http_server: Server) {
    try {

        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received. Preparing for shutdown');
            shutdown = true
        });
        process.on('SIGINT', () => {
            console.info('SIGINT signal received. Preparing for shutdown');
            shutdown = true
        });
        process.on('SIGHUP', () => {
            console.info('SIGHUP signal received. Preparing for shutdown');
            shutdown = true
        });

        console.log('reading save files');
        console.log('connection ready');
        load()
        console.log('systems are ready');
        MapSystem.initial_update()
        gameloop.setGameLoop( (delta: number) => update(delta, http_server), 100 );

    } catch (e) {
        console.log(e);
    }
}

function load() {
    // MapSystem.load()
    Data.load()

    UserManagement.load_users()
    Auth.load()

    //validating battle status
    Data.Characters.for_each(object => {
        const battle = Convert.character_to_battle(object)
        if (battle == undefined) {
            object.battle_id = undefined
        }
    });

    Data.Battles.for_each(battle => {
        // console.log('test battle for shadow units')
        for (let id of Object.values(battle.heap)) {
            let character = Data.Characters.from_id(id)
            if (character == undefined || !character.in_battle()) {
                BattleEvent.Leave(battle, character)
            }
        }
    });

    let version = get_version()
    if (version == 0) {
        const factions = Data.Factions.get_factions()
        for (const item of factions) {
            GameMaster.spawn_faction(DataID.Location.cell_id(DataID.Faction.spawn(item.tag)), item.tag)
        }
        set_version(1)
    }
}

function save() {
    UserManagement.save_users()
    Auth.save()
    Data.save()
}

var update_timer = 0
var map_update_timer = 0
                    // seconds
function update(delta: number, http_server: Server) {
    if (shutdown) {
        http_server.close()
        // express_server.close(() => {
        //     console.log('express server closed')
        // })
        save()
        process.exit(0);
    }

    CharacterSystem.update(delta)

    ActionManager.update_characters(delta)
    UserManagement.update_users()
    BattleSystem.update(delta * 1000 as ms)

    Data.Characters.for_each(character => {
        if (character.dead()) {
            Event.death(character)
        }
    });

    map_update_timer += delta
    if (map_update_timer > 1) {
        MapSystem.update(map_update_timer)
        GameMaster.update(map_update_timer)
        map_update_timer = 0
    }

    update_timer += delta
    if (update_timer > 50000) {
        save()
        update_timer = 0
    }
}