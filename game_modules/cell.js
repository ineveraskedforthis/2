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
        this.orders = new Set();
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
        let result = [];
        for (let item of this.characters_list.values()) {
            let return_item = { id: item, name: this.world.entity_manager.chars[item].name };
            result.push(return_item);
        }
        return result;
    }
    get_characters_set() {
        return this.characters_list;
    }
    enter(char) {
        this.characters_list.add(char.id);
        this.world.socket_manager.send_market_info_character(this, char);
        this.world.socket_manager.send_cell_updates(this);
    }
    exit(char) {
        this.characters_list.delete(char.id);
        this.world.socket_manager.send_cell_updates(this);
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
        return ((this.development.wild > 0) || (this.resources.prey));
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
    add_order(x) {
        this.orders.add(x);
        this.world.socket_manager.send_market_info(this);
    }
    remove_order(x) {
        this.orders.delete(x);
        this.world.socket_manager.send_market_info(this);
    }
    transfer_order(ord, target_cell) {
        this.remove_order(ord);
        target_cell.add_order(ord);
    }
    async execute_sell_order(pool, order_index, amount, buyer) {
        let order = this.world.entity_manager.get_order(order_index);
        let order_owner = order.owner;
        if ((order_owner != undefined) && (order.amount >= amount)) {
            if (buyer.savings.get() < amount * order.price) {
                return 'not_enough_money';
            }
            order.amount -= amount;
            order_owner.stash.transfer(buyer.stash, order.tag, amount);
            buyer.savings.transfer(order_owner.trade_savings, amount * order.price);
            buyer.changed = true;
            order_owner.changed = true;
            await order.save_to_db(pool);
            return 'ok';
        }
        return 'invalid_order';
    }
    async execute_buy_order(pool, order_index, amount, seller) {
        let order = this.world.entity_manager.get_order(order_index);
        let order_owner = order.owner;
        if ((order_owner != undefined) && (order.amount >= amount)) {
            if (seller.stash.get(order.tag) < amount) {
                return 'not_enough_items_in_stash';
            }
            order.amount -= amount;
            seller.stash.transfer(order_owner.stash, order.tag, amount);
            order_owner.trade_savings.transfer(seller.savings, amount * order.price);
            seller.changed = true;
            order_owner.changed = true;
            await order.save_to_db(pool);
            return 'ok';
        }
        return 'invalid_order';
    }
    async new_order(pool, typ, tag, amount, price, agent) {
        if (typ == 'sell') {
            var tmp = agent.stash.transfer(agent.trade_stash, tag, amount);
            var order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, tmp, price, this.id);
            return order;
        }
        if (typ == 'buy') {
            if (price != 0) {
                let savings = agent.savings.get();
                let true_amount = Math.min(amount, Math.floor(savings / price));
                agent.savings.transfer(agent.trade_savings, true_amount * price);
                let order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, true_amount, price, this.id);
                return order;
            }
            else {
                let order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, amount, price, this.id);
                return order;
            }
        }
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
