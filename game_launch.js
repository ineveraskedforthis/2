"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set_version = exports.launch = exports.socket_manager = exports.io = void 0;
const fs_1 = require("fs");
// Always the first.
const data_1 = require("./game_modules/data");
//importing order is important because of global lists of entities
const system_1 = require("./game_modules/character/system");
const system_2 = require("./game_modules/map/system");
const socket_manager_1 = require("./game_modules/client_communication/socket_manager");
const user_manager_1 = require("./game_modules/client_communication/user_manager");
const constants_1 = require("./game_modules/static_data/constants");
const migrations_1 = require("./migrations");
const server_1 = require("./server");
const action_manager_1 = require("./game_modules/actions/action_manager");
const auth_1 = require("./game_modules/client_communication/network_actions/auth");
const events_1 = require("./game_modules/events/events");
const systems_communication_1 = require("./game_modules/systems_communication");
const system_3 = require("./game_modules/battle/system");
const system_4 = require("./game_modules/market/system");
exports.io = require('socket.io')(server_1.http);
exports.socket_manager = new socket_manager_1.SocketManager(exports.io);
const gameloop = require('node-gameloop');
var shutdown = false;
function launch(http_server, express_server) {
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
        console.log('connection ready, checking for version update');
        let version = get_version();
        console.log(version);
        (0, migrations_1.migrate)(version, constants_1.constants.version);
        load();
        console.log('systems are ready');
        gameloop.setGameLoop((delta) => update(delta, http_server, express_server), 500);
    }
    catch (e) {
        console.log(e);
    }
}
exports.launch = launch;
function load() {
    system_1.CharacterSystem.load();
    system_2.MapSystem.load();
    user_manager_1.UserManagement.load_users();
    auth_1.Auth.load();
    system_3.BattleSystem.load();
    system_4.BulkOrders.load();
    system_4.ItemOrders.load();
    const characters = data_1.Data.Character.list();
    for (const character of characters) {
        systems_communication_1.Link.character_and_cell(character, systems_communication_1.Convert.character_to_cell(character));
    }
    // Event.new_character(HumanTemplateNotAligned, 'test', MapSystem.coordinate_to_id(7, 5), {mouth: 1, eyes: 1, chin: 1})
}
function save() {
    system_1.CharacterSystem.save();
    user_manager_1.UserManagement.save_users();
    auth_1.Auth.save();
    system_3.BattleSystem.save();
    system_4.BulkOrders.save();
    system_4.ItemOrders.save();
}
var update_timer = 0;
function update(delta, http_server, express_server) {
    if (shutdown) {
        http_server.close();
        // express_server.close(() => {
        //     console.log('express server closed')
        // })
        save();
        process.exit(0);
    }
    system_1.CharacterSystem.update(delta);
    system_2.MapSystem.update(delta);
    action_manager_1.ActionManager.update_characters(delta);
    user_manager_1.UserManagement.update_users();
    system_3.BattleSystem.update();
    for (let character of data_1.Data.Character.list()) {
        if (character.dead()) {
            events_1.Event.death(character);
        }
    }
    update_timer += delta;
    if (update_timer > 50000) {
        save();
        update_timer = 0;
    }
}
function get_version_raw() {
    if (!(0, fs_1.existsSync)('version.txt')) {
        (0, fs_1.writeFileSync)('version.txt', '');
    }
    return (0, fs_1.readFileSync)('version.txt').toString();
}
function set_version(n) {
    (0, fs_1.writeFileSync)('version.txt', '' + n);
}
exports.set_version = set_version;
function get_version() {
    let data = Number(get_version_raw());
    return data;
}
