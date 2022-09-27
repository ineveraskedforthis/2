import { readFile } from "fs";
import { CharacterSystem } from "./game_modules/base_game_classes/character/system";
import { MapSystem } from "./game_modules/map/system";
import { SocketManager } from "./game_modules/client_communication/socket_manager";
import { UserManagement } from "./game_modules/client_communication/user_manager";
import { constants } from "./game_modules/static_data/constants";
import { migrate } from "./migrations";
import { http, io_type } from "./server";


export var io:io_type = require('socket.io')(http);
export var socket_manager = new SocketManager(io)




export function launch() {
    try {
        console.log('reading save files');
        console.log('connection ready, checking for version update');
        let version = get_version()
        console.log(version)
        migrate(version, constants.version)

        CharacterSystem.load()
        MapSystem.load()
        UserManagement.load_users()

        // console.log('database is ready');
        // gameloop.setGameLoop( delta => await world.update(pool, delta), 500);

    } catch (e) {
        console.log(e);
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
