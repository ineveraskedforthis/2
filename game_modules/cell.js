var Market = require("./market.js")
var ProfessionGraph = require("./profession_graph.js")
var common = require("./common.js")
var constants = require("./constants.js")
const { MarketItems } = require("./market_items.js")

module.exports = class Cell {
    constructor(world, map, i, j, name, owner_id) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.owner_id = owner_id;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.market = new Market(world, this);
        this.item_market = new MarketItems(this.world, this.id);
    }

    async init(pool, world) {     
        this.name = this.i + ' ' + this.j;   
        this.market_id = await this.market.init(pool);
        this.item_market_id = await this.item_market.init(pool);
        this.job_graph = new ProfessionGraph(pool, world, this.world.PROFESSIONS);
        await this.load_to_db(pool);
    }

    async load(pool) {
        let tmp = await common.send_query(pool, constants.select_cell_by_id_query, [this.id]);
        tmp = tmp.rows[0];
        this.name = tmp.name;
        this.market_id = tmp.market_id;
        await this.market.load(pool, this.market_id);
        this.item_market_id = tmp.item_market_id;
        await this.item_market.load(pool, this.item_market_id);
    }

    async update(pool) {
        await this.market.update(pool);
        await this.item_market.update(pool);
    }

    async clear_dead_orders(pool) {
        await this.market.clear_dead_orders(pool)
    }

    get_population() {
        return this.job_graph.get_total_size();
    }

    // async get_enterprises_list(pool) {
    //     var tmp = [];
    //     for (var i in this.tiles) {
    //         tile = await this.world.get_tile(i);
    //         for (var j in tile.enterprises) {
    //             tmp.push(j)
    //         }
    //     }
    //     return tmp;
    // }

    async set_owner(pool, owner) {
        this.owner = owner;
        await common.send_query(pool, constants.update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_cell_query, [this.id, this.i, this.j, this.name, this.market_id, this.item_market_id, this.owner_id, this.pop_id]);
    }
}