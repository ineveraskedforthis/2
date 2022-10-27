import { readFile } from "fs";

//importing order is important because of global lists of entities
import { CharacterSystem } from "./game_modules/base_game_classes/character/system";
import { MapSystem } from "./game_modules/map/system";
import { SocketManager } from "./game_modules/client_communication/socket_manager";
import { UserManagement } from "./game_modules/client_communication/user_manager";


import { constants } from "./game_modules/static_data/constants";
import { migrate } from "./migrations";
import { http, io_type } from "./server";
import { ActionManager } from "./game_modules/actions/action_manager";
import { Auth } from "./game_modules/client_communication/network_actions/auth";
import { Event } from "./game_modules/events/events";
import { EloTemplate } from "./game_modules/base_game_classes/character/races/elo";
import { HumanTemplateNotAligned } from "./game_modules/base_game_classes/character/races/human";
import { Convert, Link } from "./game_modules/systems_communication";


export var io:io_type = require('socket.io')(http);
export var socket_manager = new SocketManager(io)


const gameloop = require('node-gameloop');
var shutdown = false

export function launch(http_server: any, express_server: any) {
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
        console.log('connection ready, checking for version update');
        let version = get_version()
        console.log(version)
        migrate(version, constants.version)

        load()

        console.log('systems are ready');
        gameloop.setGameLoop( (delta: number) => update(delta, http_server, express_server), 500 );

    } catch (e) {
        console.log(e);
    }
}

function load() {
    CharacterSystem.load()
    MapSystem.load()
    UserManagement.load_users()
    Auth.load()

    const characters = CharacterSystem.all_characters()

    for (const character of characters) {
        Link.character_and_cell(character, Convert.character_to_cell(character))
    }

    Event.new_character(HumanTemplateNotAligned, 'test', MapSystem.coordinate_to_id(7, 5), {mouth: 1, eyes: 1, chin: 1})
}

function save() {
    CharacterSystem.save()
    UserManagement.save_users()
    Auth.save()
}

var update_timer = 0

function update(delta: number, http_server:any, express_server: any) {
    if (shutdown) {
        http_server.close()
        // express_server.close(() => {
        //     console.log('express server closed')
        // })
        save()
        process.exit(0);
    }

    CharacterSystem.update(delta)
    MapSystem.update(delta)
    ActionManager.update_characters(delta)
    UserManagement.update_users()
    
    update_timer += delta
    if (update_timer > 50000) {
        save()
        update_timer = 0
    }
}


function get_version_raw():string {
    readFile('/data/misc/version', 'utf-8', (err, data) => {
        if (err) {
            return '0'
        }
        return data
    })
    return '0'
}

function get_version():number {
    let data = Number(get_version_raw())
    return data
}
