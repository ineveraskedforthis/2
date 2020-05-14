var Market = require("./market.js")
var ProfessionGraph = require("./profession_graph.js")
var common = require("./common.js")
var constants = require("./constants.js")

module.exports = class Cell {
    async init(pool, world, map, i, j, name, owner_id) {
        this.name = i + ' ' + j;
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        var market = new Market();
        this.market_id = await market.init(pool, world, this.id, market);
        this.market = market;
        this.owner_id = owner_id;
        this.job_graph = new ProfessionGraph(pool, world, this.world.PROFESSIONS);
        await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        this.world.get_market(this.market_id).update(pool);
    }

    async get_market(pool) {
        var market = await this.world.get_market(pool, this.market_id);
        return market;
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
        await common.send_query(pool, constants.new_cell_query, [this.id, this.i, this.j, this.name, this.market_id, this.owner_id, this.pop_id]);
    }
}