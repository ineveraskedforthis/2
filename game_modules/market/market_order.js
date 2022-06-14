"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketOrder = void 0;
var common = require("../common.js");
const constants_js_1 = require("../static_data/constants.js");
class MarketOrder {
    constructor(world) {
        this.id = -1;
        this.world = world;
        this.typ = 'sell';
        this.tag = 1;
        this.owner = undefined;
        this.owner_id = -1;
        this.amount = 0;
        this.price = 0;
        this.cell_id = 0;
    }
    async init(pool, typ, tag, owner, amount, price, cell_id) {
        this.typ = typ;
        this.tag = tag;
        this.owner_id = owner.id;
        this.owner = owner;
        this.amount = amount;
        this.price = price;
        this.cell_id = cell_id;
        if (constants_js_1.constants.logging.market_order.init) {
            console.log('market order init');
        }
        this.id = await this.load_to_db(pool);
        return this.id;
    }
    async load_to_db(pool) {
        let result = await common.send_query(pool, constants_js_1.constants.insert_market_order_query, [this.typ, this.tag, this.owner_id, this.amount, this.price, this.cell_id]);
        return result.rows[0].id;
    }
    async save_to_db(pool) {
        await common.send_query(pool, constants_js_1.constants.update_market_order_query, [this.id, this.amount]);
    }
    async delete_from_db(pool) {
        await common.send_query(pool, constants_js_1.constants.delete_market_order_query, [this.id]);
    }
    load_from_json(data) {
        this.typ = data.typ;
        this.tag = data.tag;
        this.owner_id = data.owner_id;
        this.owner = this.world.get_char_from_id(this.owner_id);
        this.amount = data.amount;
        this.price = data.price;
        this.id = data.id;
        this.cell_id = data.cell_id;
        if (this.owner == undefined) {
            return false;
        }
        else {
            return true;
        }
    }
    get_json() {
        var tmp = {};
        tmp.typ = this.typ;
        tmp.tag = this.tag;
        tmp.owner_id = this.owner_id;
        if (this.owner != undefined) {
            tmp.owner_name = this.owner.name;
            tmp.owner_tag = this.owner.get_tag;
        }
        tmp.amount = this.amount;
        tmp.price = this.price;
        tmp.id = this.id;
        tmp.cell_id = this.cell_id;
        return tmp;
    }
}
exports.MarketOrder = MarketOrder;
