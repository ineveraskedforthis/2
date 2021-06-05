"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = void 0;
var Market = require("./market/market.js");
var common = require("./common.js");
const constants_js_1 = require("./static_data/constants.js");
class Cell {
    constructor(world, map, i, j, name, development, res) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.name = name;
        this.visited_recently = false;
        this.last_visit = 0;
        this.market_id = -1;
        this.item_market_id = -1;
        this.characters_list = new Set();
        if (development == undefined) {
            this.development = { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0 };
        }
        else {
            this.development = development;
        }
        if (res == undefined) {
            this.resources = { water: false, prey: false, forest: false, fish: false };
        }
        else {
            this.resources = res;
        }
    }
    get_characters_list() {
        return this.characters_list;
    }
    enter(char) {
        this.characters_list.add(char.id);
    }
    exit(char) {
        this.characters_list.delete(char.id);
    }
    async init(pool) {
        await this.load_to_db(pool);
    }
    has_market() {
        return false;
    }
    get_actions() {
        let actions = {
            hunt: false,
            rest: false,
            clean: false
        };
        actions.hunt = this.can_hunt();
        actions.clean = this.can_clean();
        actions.rest = this.can_rest();
        return actions;
    }
    can_clean() {
        return (this.resources.water);
    }
    can_hunt() {
        return (this.resources.prey);
    }
    can_rest() {
        return (this.development.urban > 0);
    }
    get_item_market() {
        return undefined;
    }
    get_market() {
        return undefined;
    }
    visit() {
        this.visited_recently = true;
        this.last_visit = 0;
    }
    async update(pool, dt) {
        if (this.visited_recently) {
            this.last_visit += dt;
            if (this.last_visit > 10) {
                this.visited_recently = false;
                this.last_visit = 0;
            }
        }
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
        let tmp = await common.send_query(pool, constants_js_1.constants.select_cell_by_id_query, [this.id]);
        tmp = tmp.rows[0];
        this.name = tmp.name;
        this.market_id = tmp.market_id;
        this.item_market_id = tmp.item_market_id;
        this.development = tmp.development;
        this.resources = tmp.resources;
    }
    async load_to_db(pool) {
        await common.send_query(pool, constants_js_1.constants.new_cell_query, [
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
exports.Cell = Cell;
