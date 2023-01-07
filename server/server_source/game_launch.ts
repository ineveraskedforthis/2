import { readFileSync, writeFileSync, existsSync } from "fs";

// Always the first.
import { Data } from "./game_modules/data";
//importing order is important because of global lists of entities
import { CharacterSystem } from "./game_modules/character/system";
import { MapSystem } from "./game_modules/map/system";
import { SocketManager } from "./game_modules/client_communication/socket_manager";
import { UserManagement } from "./game_modules/client_communication/user_manager";


// import { http, io_type } from "./server";
import { ActionManager } from "./game_modules/actions/action_manager";
import { Auth } from "./game_modules/client_communication/network_actions/auth";
import { Event } from "./game_modules/events/events";
import { Convert, Link } from "./game_modules/systems_communication";
import { BattleSystem } from "./game_modules/battle/system";
import { BulkOrders, ItemOrders } from "./game_modules/market/system";
import { battle_id, ms, unit_id } from "../../shared/battle_data";
import { Server } from "./server";
import { EventMarket } from "./game_modules/events/market";
import { BattleEvent } from "./game_modules/battle/events";
import { convertTypeAcquisitionFromJson } from "typescript";




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
        gameloop.setGameLoop( (delta: number) => update(delta, http_server), 100 );

    } catch (e) {
        console.log(e);
    }
}

function load() {
    CharacterSystem.load()
    MapSystem.load()
    UserManagement.load_users()
    Auth.load()
    BattleSystem.load()
    BulkOrders.load()
    ItemOrders.load()
    Data.load()

    const characters = Data.Character.list()

    //validating ids and connections
    for (const character of characters) {
        Link.character_and_cell(character, Convert.character_to_cell(character))
        const battle = Convert.character_to_battle(character)
        if (battle == undefined) {
            character.battle_id = -1 as battle_id
            character.battle_unit_id = -1 as unit_id
        }
        // EventMarket.clear_orders(character)
    }

    for (const battle of Data.Battle.list()) {
        console.log('test battle for shadow units')
        for (let unit of Object.values(battle.heap.data)) {
            let id = unit.char_id
            let character = Data.Character.from_id(id)
            if (character == undefined || !character.in_battle()) {
                BattleEvent.Leave(battle, unit)
            }
        }

        
    }

    // Event.new_character(HumanTemplateNotAligned, 'test', MapSystem.coordinate_to_id(7, 5), {mouth: 1, eyes: 1, chin: 1})
}

function save() {
    CharacterSystem.save()
    UserManagement.save_users()
    Auth.save()
    BattleSystem.save()
    BulkOrders.save()
    ItemOrders.save()
    Data.save()
}

var update_timer = 0
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

    let rats = 0
    let elos = 0

    for (let character of Data.Character.list()) {
        if (character.dead()) {
            Event.death(character)
        } else {
            if (character.archetype.race == 'rat') {
                rats += 1
            }

            if (character.race() == 'elo') {
                elos += 1
            }
        }
    }

    MapSystem.update(delta, rats, elos)
    
    update_timer += delta
    if (update_timer > 50000) {
        save()
        update_timer = 0
    }
}


