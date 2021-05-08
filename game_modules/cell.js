var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Market = require("./market/market.js");
var common = require("./common.js");
var constants = require("./static_data/constants.js");
const { MarketItems } = require("./market/market_items.js");
class Cell {
    constructor(world, map, i, j, name, development, res) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.name = name;
        this.market_id = -1;
        this.item_market_id = -1;
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
    init(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load_to_db(pool);
        });
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
        return (this.development.wild > 0) && (this.resources.prey);
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
    update(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (this.market.changed) {
            //     this.world.socket_manager.send_market_info(this)
            // }
            // await this.market.update(pool);
            // await this.item_market.update(pool);
        });
    }
    update_info(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.market.update_info(pool);
        });
    }
    clear_dead_orders(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.market.clear_dead_orders(pool)
        });
    }
    get_population() {
        // return this.job_graph.get_total_size();
    }
    set_owner(pool, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.owner = owner;
            // await common.send_query(pool, constants.update_cell_owner_query, owner);
        });
    }
    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }
    load(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            let tmp = yield common.send_query(pool, constants.select_cell_by_id_query, [this.id]);
            tmp = tmp.rows[0];
            this.name = tmp.name;
            this.market_id = tmp.market_id;
            this.item_market_id = tmp.item_market_id;
            this.development = tmp.development;
            this.resources = tmp.resources;
        });
    }
    load_to_db(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            yield common.send_query(pool, constants.new_cell_query, [
                this.id,
                this.i,
                this.j,
                this.name,
                this.market_id,
                this.item_market_id,
                this.development,
                this.resources
            ]);
        });
    }
}
module.exports = Cell;
