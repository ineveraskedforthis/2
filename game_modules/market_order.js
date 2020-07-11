var common = require("./common.js");
const constants = require("./constants.js");


module.exports = class MarketOrder {
    constructor(world) {
        this.world = world;
    }

    async init(pool, typ, tag, owner, amount, price, market_id) {
        this.typ = typ;
        this.tag = tag;
        this.owner = owner;
        this.owner_id = owner.id;
        this.owner_tag = owner.tag;
        this.amount = amount;
        this.price = price;
        this.market_id = market_id;
        if (constants.logging.market_order.init) {
            console.log('market order init');
        }
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool) {
        let result = await common.send_query(pool, constants.insert_market_order_query, [this.typ, this.tag, this.owner_id, this.owner_tag, this.amount, this.price, this.market_id]);
        return result.rows[0].id;
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_market_order_query, [this.id, this.amount]);
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_market_order_query, [this.id]);
    }

    load_from_json(data) {
        this.typ = data.typ;
        this.tag = data.tag;
        this.owner_id = data.owner_id;
        this.owner_tag = data.owner_tag;
        this.owner = this.world.get_from_id_tag(this.owner_id, this.owner_tag);
        this.amount = data.amount;
        this.price = data.price;
        this.id = data.id;
        this.market_id = data.market_id;
        if (this.owner == undefined) {
            return false
        } else {
            return true
        }
    }

    get_json() {
        var tmp = {};
        tmp.typ = this.typ;
        tmp.tag = this.tag;
        tmp.owner_id = this.owner_id;
        tmp.owner_name = this.owner.name;
        tmp.owner_tag = this.owner.tag;
        tmp.amount = this.amount;
        tmp.price = this.price;
        tmp.id = this.id;
        tmp.market_id = this.market_id;
        return tmp;
    }
}