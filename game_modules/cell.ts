var Market = require("./market/market.js")
var common = require("./common.js")
var constants = require("./static_data/constants.js")
const { MarketItems } = require("./market/market_items.js")

interface Development {
    rural: 0|1|2|3;
    urban: 0|1|2|3;
    wild: 0|1|2|3;
    ruins: 0|1|2|3;
    wastelands: 0|1|2|3;
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

class Cell {

    world:any;
    map:any;
    i: number;
    j: number;
    id: number;
    tag: string;
    name: string;

    market_id: number;
    item_market_id: number;

    development: Development;
    resources: CellResources;

    constructor(world: any, map: any, i: number, j:number, name:string, development: Development, res: CellResources) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.name = name;

        this.market_id = -1
        this.item_market_id = -1
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

    async init(pool) {
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
        return (this.resources.prey)
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

    async update(pool) {
        // if (this.market.changed) {
        //     this.world.socket_manager.send_market_info(this)
        // }
        // await this.market.update(pool);
        // await this.item_market.update(pool);
    }

    async update_info(pool) {
        // await this.market.update_info(pool);
    }

    async clear_dead_orders(pool) {
        // await this.market.clear_dead_orders(pool)
    }

    get_population() {
        // return this.job_graph.get_total_size();
    }

    async set_owner(pool, owner) {
        // this.owner = owner;
        // await common.send_query(pool, constants.update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load(pool) {
        let tmp = await common.send_query(pool, constants.select_cell_by_id_query, [this.id]);
        tmp = tmp.rows[0];

        this.name = tmp.name;

        this.market_id = tmp.market_id;
        this.item_market_id = tmp.item_market_id;

        this.development = tmp.development
        this.resources = tmp.resources
    }

    async load_to_db(pool) {
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

module.exports = Cell;