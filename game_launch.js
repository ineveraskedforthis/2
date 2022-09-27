"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = exports.socket_manager = exports.io = void 0;
const fs_1 = require("fs");
const system_1 = require("./game_modules/base_game_classes/character/system");
const system_2 = require("./game_modules/map/system");
const socket_manager_1 = require("./game_modules/client_communication/socket_manager");
const user_manager_1 = require("./game_modules/client_communication/user_manager");
const constants_1 = require("./game_modules/static_data/constants");
const migrations_1 = require("./migrations");
const server_1 = require("./server");
exports.io = require('socket.io')(server_1.http);
exports.socket_manager = new socket_manager_1.SocketManager(exports.io);
function launch() {
    try {
        console.log('reading save files');
        console.log('connection ready, checking for version update');
        let version = get_version();
        console.log(version);
        (0, migrations_1.migrate)(version, constants_1.constants.version);
        system_1.CharacterSystem.load();
        system_2.MapSystem.load();
        user_manager_1.UserManagement.load_users();
        // console.log('database is ready');
        // gameloop.setGameLoop(async delta => await world.update(pool, delta), 500);
    }
    catch (e) {
        console.log(e);
    }
}
exports.launch = launch;
function get_version_raw() {
    (0, fs_1.readFile)('/data/misc/version', 'utf-8', (err, data) => {
        if (err) {
            return '0';
        }
        return data;
    });
    return '0';
}
function get_version() {
    let data = Number(get_version_raw());
    return data;
}
