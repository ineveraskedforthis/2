"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = exports.last_id = exports.action_manager = exports.user_manager = exports.world_manager = exports.ai_manager = exports.entity_manager = exports.socket_manager = void 0;
const fs_1 = require("fs");
const action_manager_1 = require("./game_modules/manager_classes/action_manager");
const ai_manager_1 = require("./game_modules/manager_classes/ai_manager");
const entity_manager_1 = require("./game_modules/manager_classes/entity_manager");
const socket_manager_1 = require("./game_modules/manager_classes/socket_manager");
const user_manager_1 = require("./game_modules/manager_classes/user_manager");
const constants_1 = require("./game_modules/static_data/constants");
const world_1 = require("./game_modules/world");
const migrations_1 = require("./migrations");
const server_1 = require("./server");
exports.socket_manager = new socket_manager_1.SocketManager(server_1.io);
exports.entity_manager = new entity_manager_1.EntityManager();
exports.ai_manager = new ai_manager_1.AiManager();
exports.world_manager = new world_1.World(27, 27);
exports.user_manager = new user_manager_1.UserManager();
exports.action_manager = new action_manager_1.ActionManager();
exports.last_id = {
    user: 0,
};
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
