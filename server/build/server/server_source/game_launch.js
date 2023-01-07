"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = void 0;
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
const system_4 = require("./game_modules/market/system");
const events_2 = require("./game_modules/battle/events");
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
    system_1.CharacterSystem.load();
    system_2.MapSystem.load();
    user_manager_1.UserManagement.load_users();
    auth_1.Auth.load();
    system_3.BattleSystem.load();
    system_4.BulkOrders.load();
    system_4.ItemOrders.load();
    data_1.Data.load();
    const characters = data_1.Data.Character.list();
    //validating ids and connections
    for (const character of characters) {
        systems_communication_1.Link.character_and_cell(character, systems_communication_1.Convert.character_to_cell(character));
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined) {
            character.battle_id = -1;
            character.battle_unit_id = -1;
        }
        // EventMarket.clear_orders(character)
    }
    for (const battle of data_1.Data.Battle.list()) {
        console.log('test battle for shadow units');
        for (let unit of Object.values(battle.heap.data)) {
            let id = unit.char_id;
            let character = data_1.Data.Character.from_id(id);
            if (character == undefined || !character.in_battle()) {
                events_2.BattleEvent.Leave(battle, unit);
            }
        }
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
    for (let character of data_1.Data.Character.list()) {
        if (character.dead()) {
            events_1.Event.death(character);
        }
        else {
            if (character.archetype.race == 'rat') {
                rats += 1;
            }
            if (character.race() == 'elo') {
                elos += 1;
            }
        }
    }
    system_2.MapSystem.update(delta, rats, elos);
    update_timer += delta;
    if (update_timer > 50000) {
        save();
        update_timer = 0;
    }
}
