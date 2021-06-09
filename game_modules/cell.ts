var Market = require("./market/market.js")
var common = require("./common.js")
import { CharacterGenericPart } from "./base_game_classes/character_generic_part.js";
import {constants} from "./static_data/constants.js";


interface Development {
    rural: 0|1|2|3;
    urban: 0|1|2|3;
    wild: 0|1|2|3;
    ruins: 0|1|2|3;
    wastelands: 0|1|2|3;
    rupture?: 0|1
}

interface CellResources {
    water: boolean;
    prey: boolean;
    forest: boolean;
    fish: boolean
}

interface Actions {
    hunt: boolean
    rest: boolean
    clean: boolean
}

export class Cell {

    world:any;
    map:any;
    i: number;
    j: number;
    id: number;
    tag: string;
    name: string;

    market_id: number;
    item_market_id: number;
    visited_recently: boolean;
    last_visit: number

    development: Development;
    resources: CellResources;
    characters_list: Set<number>

    constructor(world: any, map: any, i: number, j:number, name:string, development: Development, res: CellResources) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.name = name;
        this.visited_recently = false;
        this.last_visit = 0;
        this.market_id = -1
        this.item_market_id = -1

        this.characters_list = new Set()

        if (development == undefined) {
            this.development = {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0};
        } else {
            this.development = development
        }

        if (res == undefined) {
            this.resources = {water: false, prey: false, forest: false, fish: false}
        } else {
            this.resources = res
        }
    }


    get_characters_list() {
        return this.characters_list
    }

    enter(char: CharacterGenericPart) {
        this.characters_list.add(char.id)
    }

    exit(char: CharacterGenericPart) {
        this.characters_list.delete(char.id)
    }


    async init(pool:any) {
        await this.load_to_db(pool);
    }

    has_market() {
        return false
    }

    

    get_actions(): Actions {
        let actions: Actions = {
            hunt: false,
            rest: false,
            clean: false
        }

        actions.hunt = this.can_hunt()
        actions.clean = this.can_clean()
        actions.rest = this.can_rest()
        return actions
    }

    can_clean(): boolean{
        return (this.resources.water)
    }

    can_hunt(): boolean{
        return (this.development.wild > 0)
    }

    can_rest(): boolean{
        return (this.development.urban > 0)
    }

    get_item_market() {
        return undefined
    }

    get_market() {
        return undefined
    }

    visit() {
        this.visited_recently = true
        this.last_visit = 0
    }

    async update(pool:any, dt: number) {
        if (this.visited_recently) {
            this.last_visit += dt
            if (this.last_visit > 10) {
                this.visited_recently = false
                this.last_visit = 0
            }
        }
        // if (this.market.changed) {
        //     this.world.socket_manager.send_market_info(this)
        // }
        // await this.market.update(pool);
        // await this.item_market.update(pool);
    }

    async update_info(pool:any) {
        // await this.market.update_info(pool);
    }

    async clear_dead_orders(pool:any) {
        // await this.market.clear_dead_orders(pool)
    }

    get_population() {
        // return this.job_graph.get_total_size();
    }

    async set_owner(pool:any, owner:any) {
        // this.owner = owner;
        // await common.send_query(pool, constants.update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load(pool:any) {
        let tmp = await common.send_query(pool, constants.select_cell_by_id_query, [this.id]);
        tmp = tmp.rows[0];

        this.name = tmp.name;

        this.market_id = tmp.market_id;
        this.item_market_id = tmp.item_market_id;

        this.development = tmp.development
        this.resources = tmp.resources
    }

    async load_to_db(pool:any) {
        await common.send_query(pool, constants.new_cell_query, [
            this.id,
            this.i, 
            this.j, 
            this.name, 

            this.market_id, 
            this.item_market_id,

            this.development,
            this.resources
        ]);
    }
}