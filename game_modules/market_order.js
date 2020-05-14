var common = require("./common.js");
const constants = require("./constants.js");


module.exports = class MarketOrder {
    async init(pool, world, typ, tag, owner, amount, price, market_id) {
        this.typ = typ;
        this.world = world;
        this.tag = tag;
        this.owner = owner;
        this.owner_id = owner.id;
        this.amount = amount;
        this.price = price;
        this.id = await world.get_new_id(pool, 'market_order_id');
        this.market_id = market_id;
        if (constants.logging.market_order.init) {
            console.log('market order init');
        }
        await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_market_order_query, [this.id, this.typ, this.tag, this.owner_id, this.amount, this.price, this.market_id]);
        if (constants.logging.market_order_load_to_db) {
            console.log('loading completed');
        }
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_market_order_query, [this.id, this.amount]);
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_market_order_query, [this.id]);
    }

    get_json() {
        var tmp = {};
        tmp.typ = this.typ;
        tmp.tag = this.tag;
        tmp.owner_id = this.owner_id;
        tmp.owner_name = this.owner.name;
        tmp.amount = this.amount;
        tmp.price = this.price;
        tmp.id = this.id;
        tmp.market_id = this.market_id;
        return tmp;
    }
}