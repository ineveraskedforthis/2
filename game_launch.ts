import { readFile } from "fs";
import { ActionManager } from "./game_modules/manager_classes/action_manager";
import { AiManager } from "./game_modules/manager_classes/ai_manager";
import { EntityManager } from "./game_modules/manager_classes/entity_manager";
import { SocketManager } from "./game_modules/manager_classes/socket_manager";
import { UserManager } from "./game_modules/manager_classes/user_manager";
import { constants } from "./game_modules/static_data/constants";
import { World } from "./game_modules/world";
import { migrate } from "./migrations";
import { io } from "./server";

export var socket_manager = new SocketManager(io)
export var entity_manager = new EntityManager()
export var ai_manager = new AiManager()
export var world_manager = new World(27, 27)
export var user_manager = new UserManager()
export var action_manager = new ActionManager()

export var last_id = {
    user: 0,
}


export function launch() {
    try {
        console.log('reading save files');
        console.log('connection ready, checking for version update');
        let version = get_version()
        console.log(version)
        migrate(version, constants.version)

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
