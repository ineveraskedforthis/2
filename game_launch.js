"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = exports.users = exports.socket_manager = exports.io = void 0;
const fs_1 = require("fs");
const socket_manager_1 = require("./game_modules/client_communication/socket_manager");
const user_manager_1 = require("./game_modules/client_communication/user_manager");
const constants_1 = require("./game_modules/static_data/constants");
const migrations_1 = require("./migrations");
const server_1 = require("./server");
exports.io = require('socket.io')(server_1.http);
exports.socket_manager = new socket_manager_1.SocketManager(exports.io);
exports.users = user_manager_1.UserManagement.load_users();
// export var entity_manager = new EntityManager()
// export var ai_manager = new AiManager()
// export var world_manager = new World(27, 27)
// export var user_manager = new UserManager()
// export var action_manager = new ActionManager()
function launch() {
    try {
        console.log('reading save files');
        console.log('connection ready, checking for version update');
        let version = get_version();
        console.log(version);
        (0, migrations_1.migrate)(version, constants_1.constants.version);
        // let tables = ['accounts', 'chars', 'last_id', 'last_id', 'battles', 'worlds', 'messages', 'markets', 'cells', 'market_orders', 'agents', 'consumers', 'pops', 'enterprises', 'messages', 'items_orders', 'items_markets', 'areas', 'quests', 'factions']
        // let ver = await common.get_version(client);
        // console.log('version from db ');
        // console.log(ver.version);
        // console.log('current version of code');
        // console.log(constants.version);
        // if (( ver.version != constants.version )) {
        //     console.log('drop database');
        //     await common.drop_tables(client, tables);
        //     await common.set_version(client, constants.version);
        //     await create_tables(client)
        //     await common.init_ids(client);
        //     await client.end();
        //     await world.init(pool);
        // }
        // else {
        //     await client.end();
        //     await world.load(pool)
        // }
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
