'use strict'
require('dotenv').config({path: __dirname + '/.env'});
var version = 0;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');
const port = process.env.PORT || 3000;
var path = require('path');
var validator = require('validator');
var bcrypt = require('bcrypt');
//const saltRounds = 10;
var {Pool} = require('pg');
var stage = process.env.STAGE;
if (stage == 'dev') {
    var pool = new Pool({database: dbname});
} else{
    var pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: true});
}
var salt = process.env.SALT;
var dbname = process.env.DBNAME;
const logging = false;

var new_user_query = 'INSERT INTO accounts (login, password_hash, id, char_id) VALUES ($1, $2, $3, $4)';
var new_char_query = 'INSERT INTO chars (name, hp, max_hp, exp, level, id, is_player, cell_id, user_id, savings, stash, in_battle) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
var init_id_query = 'INSERT INTO last_id (id_type, last_id) VALUES ($1, $2)';
var new_battle_query = 'INSERT INTO battles (id, ids, teams, positions) VALUES ($1, $2, $3, $4)';
var new_cell_query = 'INSERT INTO cells (id, x, y, name, market_id, owner_id, pop_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
var new_market_query = 'INSERT INTO markets (id, data) VALUES ($1, $2)';
var new_market_order_query = 'INSERT INTO market_orders (id, typ, tag, owner_id, amount, price, market_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';

var update_battle_query = 'UPDATE battles SET ids = ($2), teams = ($3), positions = ($4) WHERE id = ($1)';
var update_market_order_query = 'UPDATE market_orders SET amount = ($2) WHERE id = ($1)';
var update_market_query = 'UPDATE markets SET data = ($2) WHERE id = ($1)';
var update_char_query = 'UPDATE chars SET hp = ($2), max_hp = ($3), exp = ($4), level = ($5), cell_id = ($6), savings = ($7), stash = ($8), in_battle = ($9) WHERE id = ($1)';

var delete_market_order_query = 'DELETE FROM market_orders WHERE id = ($1)';
var delete_battle_query = 'DELETE FROM battles WHERE id = ($1)';
var delete_char_query = 'DELETE FROM chars WHERE id = ($1)';

var find_user_by_login_query = 'SELECT * FROM accounts WHERE login = ($1)';
var select_char_by_id_query = 'SELECT * FROM chars WHERE id = ($1)';
var set_hp_query = 'UPDATE chars SET hp = ($1) WHERE id = ($2)';
var set_exp_query = 'UPDATE chars SET exp = ($1) WHERE id = ($2)';
var set_id_query = 'UPDATE last_id SET last_id = ($2) WHERE id_type = ($1)';
var get_id_query = 'SELECT * FROM last_id WHERE id_type = ($1)';
var save_world_size_query = 'INSERT INTO worlds (x, y) VALUES ($1, $2)';



function sum(a) {
    return a.reduce((x, y) => x + y, 0);
}


function AI_fighter(world, index, ids, teams, positions) {
    var min_distance = world.BASE_BATTLE_RANGE;
    var closest_enemy = null;
    for (var i = 0; i < positions.length; i++) {
        var dx = positions[i] - positions[index];
        if (((Math.abs(dx) <= Math.abs(min_distance)) || (closest_enemy == null)) && (teams[i] != teams[index]) && (!world.chars[ids[i]].is_dead)) {
            closest_enemy = i;
            min_distance = dx;
        }
    }
    if (closest_enemy == null) {
        return {action: 'idle', target: null};
    }
    var actor = world.chars[ids[index]];
    var target = world.chars[ids[closest_enemy]];
    var action_target = null;
    var action = null;
    if (Math.abs(min_distance) > actor.get_range()) {
        action = 'move';
        if (min_distance > 0){
            action_target = 'right';
        } else {
            action_target = 'left';
        }
    } else {
        action = 'attack';
        action_target = target;
    }
    return {action: action, target: action_target};
}


class Savings {
    constructor() {
        this.data = {};
        this.data['standard_money'] = 0;
        this.prev_data = {};
        this.prev_data['standard_money'] = 0;
        this.income = 0;
    }

    get_json() {
        var tmp = {};
        tmp.data = this.data;
        tmp.prev_data = this.prev_data;
        tmp.income = this.income;
        return tmp;
    }

    load_from_json(x) {
        this.data = x.data;
        this.prev_data = x.prev_data;
        this.income = this.income;
    }

    update() {
        this.prev_data['standard_money'] = this.data['standard_money'];
        this.income = 0;
    }

    set(x) {
        this.data['standard_money'] = x;
    }

    get() {
        return this.data['standard_money'];
    }

    get_estimated_income() {
        return this.data['standard_money'] - this.prev_data['standard_money'];
    }

    inc(x) {
        var a = this.get();
        if ((a + x) < 0) {
            this.set(0);
        } else {
            this.set(a + x)
        }
    }

    transfer(target, x) {
        var a = this.get();
        var b = target.get();
        var tmp = x;
        if ((a - x >= 0) && (b + x >= 0)) {
            this.inc(-x);
            target.inc(x);
        } else if ((a - x < 0) && (b + x >= 0)) {
            tmp = a - x;
            this.set(0);
            target.inc(x + tmp);
        }
        return tmp;
    }
}


class Stash {
    constructor() {
        this.data = {};
    }

    get_json() {
        return this.data
    }

    load_from_json(x) {
        this.data = x;
    }

    inc(tag, x) {
        this.check_tag(tag);
        if (this.data[tag] + x < 0) {
            var tmp = -this.data[tag];
            this.data[tag] = 0;
        } else {
            var tmp = x;
            this.data[tag] += x;
        }
        return tmp;
    }

    get(tag) {
        return this.data[tag];
    }

    transfer(target, tag, amount) {
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    check_tag(tag) {
        if (!(tag in this.data)) {
            this.data[tag] = 0;
        }
    }
}


class MarketOrder {
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
        if (logging) {
            console.log('market order init');
        }
        await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool) {
        if (logging) {
            console.log('load market order to db');
            console.log(new_market_order_query);
            console.log([this.id, this.typ, this.tag, this.owner_id, this.amount, this.price, this.market_id]);
        }
        await pool.query(new_market_order_query, [this.id, this.typ, this.tag, this.owner_id, this.amount, this.price, this.market_id]);
        if (logging) {
            console.log('loading completed');
        }
    }

    async save_to_db(pool) {
        await pool.query(update_market_order_query, [this.id, this.amount]);
    }

    async delete_from_db(pool) {
        await pool.query(delete_market_order_query, [this.id]);
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


// remember to check how taxes are working (spoiler: wrong)
class Market {
    async init(pool, world, cell_id, owner) {
        this.id = await world.get_new_id(pool, 'market_id');
        this.cell_id = cell_id;
        this.owner = owner;
        this.world = world;
        this.savings = new Savings();
        this.stash = new Stash();
        this.buy_orders = {};
        this.sell_orders = {};
        this.planned_money_to_spent = {};
        this.tmp_planned_money_to_spent = {};
        this.total_cost_of_placed_goods = {};
        this.tmp_total_cost_of_placed_goods = {};
        this.max_price = {};
        this.total_sold = {};
        this.total_sold_cost = {};
        this.total_sold_new = {};
        this.total_sold_cost_new = {};
        this.sells = {};
        this.tmp_sells = {};
        this.taxes = {};
        for (var tag of world.TAGS) {
            this.taxes[tag] = 0;
            this.planned_money_to_spent[tag] = 0;
            this.total_cost_of_placed_goods[tag] = 0;
            this.tmp_planned_money_to_spent[tag] = 0;
            this.tmp_total_cost_of_placed_goods[tag] = 0;
            this.sell_orders[tag] = new Set([]);
            this.buy_orders[tag] = new Set([]);
            this.max_price[tag] = 0;
            this.total_sold[tag] = new Array(30);
            this.total_sold[tag].fill(0);
            this.total_sold_cost[tag] = new Array(30);
            this.total_sold_cost[tag].fill(0);
            this.total_sold_new[tag] = 0;
            this.total_sold_cost_new[tag] = 0;
            this.sells[tag] = [];
            this.tmp_sells[tag] = [];
        }
        await this.load_to_db(pool);
        return this.id
    }

    async update(pool) {
        for (tag of this.world.TAGS) {
            this.planned_money_to_spent[tag] = self.tmp_plannned_money_to_spent[tag];
            this.tmp_plannned_money_to_spent = 0;
            this.total_cost_of_placed_goods[tag] = this.tmp_total_cost_of_placed_goods[tag];
            this.tmp_total_cost_of_placed_goods[tag] = 0;
            this.total_sold[tag] = this.total_sold[tag].slice(1);
            this.total_sold.push(this.total_sold_new[tag]);
            this.total_sold_new[tag] = 0;
            this.total_sold_cost[tag] = this.total_sold_cost[tag].slice(1)
            this.total_sold_cost.push(this.total_sold_cost_new[tag]);
            this.total_sold_cost_new[tag] = 0;
            this.sells[tag] = this.tmp_sells[tag];
        }
        await this.save_to_db(pool);
    }

    async set_taxes(pool, tag, x) {
        this.taxes[tag] = x;
        await this.save_to_db(pool);
    }

    async buy(pool, tag, buyer, amount, money, max_price = null) {
        if (logging) {
            console.log('market buy', tag, buyer.name, amount, money);
        }
        if (buyer.savings.get() < money) {
            money = buyer.savings.get(pool);
        }
        this.tmp_planned_money_to_spent[tag] += money;
        var tmp = [];
        for (var i of this.sell_orders[tag]) {
            tmp.push(world.get_order(i));
        }
        tmp.sort((a, b) => (a.price - b.price));
        var i = 0;
        var j = 0;
        var total_spendings = 0;
        var y = money;
        while ((i < tmp.length) && (amount > 0) && ((max_price == null) || (tmp[i].price <= max_price))) {
            var tmp_amount = 0;
            while ((i < tmp.length) && (tmp[i].price == tmp[j].price)) {
                tmp_amount += tmp[i].amount;
                i += 1;
            }
            if ((money - total_spendings) < (amount * (tmp[j].price + this.taxes[tag]))) {
                amount = Math.floor((money - total_spendings) / (tmp[j].price + this.taxes[tag]));
            }
            if (tmp_amount <= amount) {
                for (var k = j; k < i; k++) {
                    total_spendings += await this.execute_sell_order(pool, tmp[k], tmp[k].amount, buyer);
                }
                amount -= tmp_amount;
            } else {
                var u_amount = amount;
                for (var k = j; k < i; k++) {
                    var memelord = Math.floor((tmp[k].amount / tmp_amount) * u_amount);
                    amount -= memelord;
                    total_spendings += await this.execute_sell_order(pool, tmp[k], memelord, buyer);
                }
                for (var k = j; k < i; k++) {
                    if ((tmp[k].amount > 0) && (amount > 0)) {
                        total_spendings += await this.execute_sell_order(pool, tmp[k], 1, buyer);
                        amount -= 1;
                    }
                }
            }
            j = i;
        }
        if ((amount > 0) && (money > 0)) {
            var price = Math.floor((money - total_spendings) / amount);
            if ((max_price != null) && (max_price < price)) {
                price = max_price;
            }
            await this.new_order(pool, 'BUY', tag, amount, price, buyer);
        }
        await this.clear_empty_sell_orders[tag];
        await this.save_to_db(pool);
        return total_spendings;
    }

    async sell(pool, tag, seller, amount, price) {
        if (logging) {
            console.log('market sell', tag, seller.name, amount, price);
        }
        if (amount > seller.stash.get(tag)) {
            amount = seller.stash.get(tag);
        }
        this.tmp_total_cost_of_placed_goods[tag] += amount * price;
        var tmp = [];
        for (var i of this.buy_orders[tag]) {
            tmp.push(this.world.get_order(i));
        }
        tmp.sort((a, b) => (b.price - a.price));
        if (logging) {
            console.log('buy orders');
            console.log(tmp);
        }
        var i = 0;
        var j = 0;
        while ((i < tmp.length) && (amount > 0) && (tmp[i].price >= price)) {
            var tmp_amount = 0;
            while ((i < tmp.length) && (tmp[i].price == tmp[j].price)) {
                tmp_amount += tmp[i].amount;
                i += 1;
            }
            if (tmp_amount <= amount) {
                for (var k = j; k < i; k++) {
                    await this.execute_buy_order(pool, tmp[k], tmp[k].amount, seller);
                }
                amount -= tmp_amount;
            } else {
                var u_amount = amount;
                for (var k = j; k < i; k++) {
                    var memelord = Math.floor((tmp[k].amount / tmp_amount) * u_amount);
                    amount -= memelord;
                    await this.execute_buy_order(pool, tmp[k], memelord, seller);
                }
                for (var k = j; k < i; k++) {
                    if ((tmp[k].amount > 0) && (amount > 0)) {
                        await this.execute_buy_order(pool, tmp[k], 1, seller);
                        amount -= 1;
                    }
                }
            }
            j = i;
        }
        if (amount > 0) {
            await this.new_order(pool, 'SELL', tag, amount, price, seller);
        }
        await this.clear_empty_buy_orders(pool, tag);
        await this.save_to_db(pool);
    }

    async new_order(pool, typ, tag, amount, price, agent) {
        if (logging) {
            console.log('new market order', typ, tag, amount, price);
        }
        if (typ == 'SELL') {
            var tmp = agent.stash.transfer(this.stash, tag, amount);
            var order = new MarketOrder();
            var order_id = await order.init(pool, this.world, typ, tag, agent, tmp, price, this.id);
            this.sell_orders[tag].add(order_id);
            await this.world.add_order(pool, order);
        }
        if (typ == 'BUY') {
            if (price != 0) {
                var savings = agent.savings.get();
                var amount = Math.min(amount, Math.floor(savings / price));
                agent.savings.transfer(this.savings, amount * price);
                var order = new MarketOrder();
                var order_id = await order.init(pool, this.world, typ, tag, agent, amount, price, this.id);
                this.buy_orders[tag].add(order_id);
                await this.world.add_order(pool, order);
            } else {
                var order = new MarketOrder();
                var order_id = await order.init(pool, this.world, typ, tag, agent, amount, price, this.id);
                this.buy_orders[tag].add(order_id);
                await this.world.add_order(pool, order);
            }
        }
        await this.save_to_db(pool);
    }

    async execute_buy_order(pool, order, amount, seller) {
        this.tmp_sells[order.tag].push([amount, order.price]);
        order.amount -= amount;
        await order.save_to_db(pool);
        this.savings.transfer(seller.savings, amount * order.price);
        this.savings.transfer(this.owner.savings, amount * this.taxes[order.tag]);
        seller.stash.transfer(order.owner.stash, order.tag, amount);
        this.total_sold_new[order.tag] += amount;
        this.total_sold_cost_new[order.tag] += amount * order.price;
        await this.save_to_db(pool);
        await seller.save_to_db(pool);
        await order.owner.save_to_db(pool);
        return amount * (order.price + this.taxes[order.tag]);
    }

    async execute_sell_order(pool, order, amount, buyer) {
        this.tmp_sells[order.tag].push([amount, order.price]);
        order.amount -= amount;
        await order.save_to_db(pool);
        this.stash.transfer(buyer.stash, order.tag, amount);
        buyer.savings.transfer(order.owner.savings, amount * order.price);
        buyer.savings.transfer(this.owner.savings, amount * this.taxes[order.tag]);
        this.total_sold_new[order.tag] += amount;
        this.total_sold_cost_new[order.tag] += amount * order.price;
        await this.save_to_db(pool);
        await buyer.save_to_db(pool);
        await order.owner.save_to_db(pool);
        return amount * (order.price + this.taxes[order.tag]);
    }

    async clear_empty_sell_orders(pool, tag) {
        var tmp = new Set();
        for (var i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (var i of tmp) {
            await this.cancel_sell_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_empty_buy_orders(pool, tag) {
        var tmp = new Set();
        for (var i of this.buy_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (var i of tmp) {
            await this.cancel_buy_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_agent_orders(pool, agent, tag) {
        this.clear_agent_buy_orders(pool, agent, tag);
        this.clear_agent_sell_orders(pool, agent, tag);
    }

    async clear_agent_sell_orders(pool, agent, tag) {
        var tmp = new Set();
        for (var i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.owner == agent) {
                tmp.add(i);
            }
        }
        for (var i of tmp) {
            this.cancel_sell_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_agent_buy_orders(pool, agent, tag) {
        var tmp = new Set();
        for (var i of this.buy_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.owner == agent) {
                tmp.add(i);
            }
        }
        for (var i in tmp) {
            await this.cancel_buy_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async get_money_on_hold(pool, agent) {
        var tmp = 0;
        for (var tag of this.world.TAGS) {
            for (var i in this.buy_orders[tag]) {
                order = this.world.get_order(i);
                if (order.owner == agent) {
                    tmp += i.amount * (i.price + this.taxes[order.tag]);
                }
            }
        }
        return tmp;
    }

    async cancel_buy_order(pool, order_id) {
        var order = this.world.get_order(order_id);
        var amount = order.amount * (order_price + this.taxes[order.tag]);
        await this.savings.transfer(pool, order.owner.savings, amount);
        this.buy_orders[order.tag].delete(order_id);
        await this.save_to_db(pool);
    }

    async cancel_sell_order(pool, order_id) {
        var order = this.world.get_order(order_id);
        await this.stash.transfer(pool, order.owner.stash, order.tag, order.amount);
        this.sell_orders[order.tag].delete(order_id);
        await this.save_to_db(pool);
    }

    async check_cost(pool, list_of_goods) {
        var cost = 0;
        for (var i of list_of_goods) {
            cost += await this.check_tag_cost(i[0], i[1]);
        }
        return cost;
    }

    async guess_cost(pool, list_of_goods) {
        var cost = 0;
        for (var i of list_of_goods) {
            cost += await this.guess_tag_cost(i[0], i[1])
        }
        return cost;
    }

    async check_tag_cost(pool, tag, amount) {
        var tmp = [];
        for (var i in this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var i = 0;
        var j = 0;
        var cost = 0;
        for (var i of tmp) {
            if (i.amount <= amount) {
                cost += i.amount * (i.price + this.taxes[tag]);
                amount -= i.amount;
            } else if (amount > 0) {
                cost += amount * (i.price + this.taxes[tag]);
                amount = 0;
            }
        }
        if (amount > 0) {
            return this.world.INF;
        }
        return cost;
    }

    async guess_tag_cost(pool, tag, amount) {
        var tmp = [];
        for (var i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var i = 0;
        var j = 0;
        var cost = 0;
        for (var i of tmp) {
            if (i.amount <= amount) {
                cost += i.amount * (i.price + this.taxes[tag]);
                amount -= i.amount;
            } else if (amount > 0) {
                cost += amount * (i.price + this.taxes[tag]);
                amount = 0;
            }
        }
        if (amount > 0) {
            if (sum(this.total_sold[tag]) != 0) {
                av_price = await this.get_average_tag_price(pool, tag);
                cost += Math.floor(av_price * amount);
            } else {
                cost += this.world.HISTORY_PRICE[tag] * amount;
            }
        }
        return cost;
    }

    async get_total_cost_of_placed_goods_with_price_less_or_equal(pool, tag, x) {
        var cost = 0;
        for (var i of this.tmp_sells[tag]) {
            if (i[1] <= x) {
                cost += i[0] * i[1];
            }
        }
        for (var i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.price <= x) {
                cost += i.amount * i.price;
            }
        }
        return cost;
    }

    async get_average_tag_price(pool, tag) {
        var total_count = sum(this.total_sold[tag]) + this.total_sold_new[tag];
        var total_cost = sum(this.total_sold_cost[tag]) + this.total_sold_cost_new[tag];
        for (var i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            total_count += order.amount;
            total_cost += order.amount * (order.price + this.taxes[tag]);
        }
        for (var i of this.buy_orders[tag]) {
            var order = this.world.get_order(i);
            total_count += order.amount;
            total_cost += order.amount * (order.price + this.taxes[tag]);
        }
        if (total_count != 0) {
            return total_cost / total_count;
        }
        return this.world.HISTORY_PRICE[tag];
    }

    async find_amount_of_goods_for_buying(pool, max_amount, money, goods) {
        var l = 0;
        var r = Math.floor(max_amount + 1);
        while (l + 1 < r) {
            var m = Math.floor((l + r) / 2);
            var list_of_goods = [];
            for (var i in goods) {
                list_of_goods.push(i[0], i[1] * m);
            }
            var estimated_cost = this.guess_cost(pool, list_of_goods);
            if (estimated_cost <= money) {
                l = m;
            } else {
                r = m;
            }
        }
        return l;
    }

    async get_most_profitable_building(pool) {}

    get_orders_list() {
        var tmp = [];
        for (var tag of this.world.TAGS) {
            for (var i of this.buy_orders[tag]) {
                var order = this.world.get_order(i);
                tmp.push(order.get_json());
            }
            for (var i of this.sell_orders[tag]) {
                var order = this.world.get_order(i);
                tmp.push(order.get_json());
            }
        }
        return tmp;
    }

    async save_to_db(pool) {
        var tmp = this.get_json();
        // console.log(tmp);
        await pool.query(update_market_query, [this.id, tmp]);
        if (logging) {
            console.log('market saved to db');
        }
    }

    async load_to_db(pool) {
        await pool.query(new_market_query, [this.id, this.get_json()]);
    }

    get_json() {
        var tmp = {};
        tmp.id = this.id;
        tmp.cell_id = this.cell_id;
        tmp.owner = this.owner.id;
        tmp.savings = this.savings.get_json();
        tmp.stash = this.stash.get_json();
        tmp.buy_orders = this.buy_orders;
        tmp.sell_orders = this.sell_orders;
        tmp.planned_money_to_spent = this.planned_money_to_spent;
        tmp.tmp_planned_money_to_spent = this.tmp_planned_money_to_spent;
        tmp.total_cost_of_placed_goods = this.total_cost_of_placed_goods;
        tmp.tmp_total_cost_of_placed_goods = this.tmp_total_cost_of_placed_goods;
        tmp.max_price = this.max_price;
        tmp.total_sold = this.total_sold;
        tmp.total_sold_cost = this.total_sold_cost;
        tmp.total_sold_new = this.total_sold_new;
        tmp.total_sold_cost_new = this.total_sold_cost_new;
        tmp.sells = this.sells;
        tmp.tmp_sells = this.tmp_sells;
        tmp.taxes = this.taxes;
        return tmp;
    }
}


class Cell {
    async init(pool, world, map, i, j, name, owner_id) {
        this.name = i + ' ' + j;
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = i * world.y + j;
        var market = new Market();
        this.market_id = await market.init(pool, world, this.id, market);
        this.market = market;
        this.owner_id = owner_id;
        // var pop = new HomelessHumanBeings();
        // pop_id = await pop.init(pool, this.world, this, 0, 'homeless ' + this.name);
        var pop_id = 0;
        this.pop_id = pop_id;
        await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        this.world.get_market(this.market_id).update(pool);
    }

    async get_market(pool) {
        market = await this.world.get_market(pool, this.market_id);
        return market;
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
        await pool.query(update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load_to_db(pool) {
        await pool.query(new_cell_query, [this.id, this.i, this.j, this.name, this.market_id, this.owner_id, this.pop_id]);
    }
}


class Map {
    async init(pool, world) {
        this.world = world;
        this.x = world.x;
        this.y = world.y;
        this.cells = [];
        for (var i = 0; i < this.x; i++) {
            var tmp = []
            for (var j = 0; j < this.y; j++) {
                var cell = new Cell();
                await cell.init(pool, world, this, i, j, null, -1);
                tmp.push(cell);
            }
            this.cells.push(tmp);
        }
    }

    async update(pool) {
        for (var i = 0; i < this.x; i++) {
            for (var j = 0; j < this.y; j++) {
                await this.cells[i][j].update(pool);
            }
        }
    }

    get_cell(x, y) {
        return this.cells[x][y];
    }

    get_cell_by_id(id) {
        return this.get_cell(Math.floor(id / this.y), id % this.y);
    }
}


class World {
    async init(pool, x, y) {
        this.x = x;
        this.y = y;
        // this.agents = {};
        this.BASE_BATTLE_RANGE = 10;
        this.users = {};
        this.chars = {};
        this.orders = {};
        this.users_online = [];
        this.TAGS = ['meat'];
        this.map = new Map();
        await this.map.init(pool, this);
        this.battles = {}
        await pool.query(save_world_size_query, [x, y]);
    }

    async update(pool) {
        // for (var i in this.agents) {
        //     await i.update();
        // }
        for (var i in this.chars) {
            await this.chars[i].update(pool);
        }
    }

    get_cell(x, y) {
        return this.map.get_cell(x, y);
    }

    get_cell_by_id(id) {
        return this.map.get_cell_by_id(id);
    }

    // get_pops(pool) {
    //     var tmp = [];
    //     for (var i in this.agents) {
    //         if (i.is_pop) {
    //             tmp.push(i);
    //         }
    //     }
    //     return tmp;
    // }

    // async get_total_money() {
    //     var tmp = 0;
    //     for (var i in this.agents) {
    //         tmp += i.savings.get('money');
    //     }
    //     return tmp;
    // }

    async get_new_id(pool, str) {
        // console.log(str);
        var x = await pool.query(get_id_query, [str]);
        x = x.rows[0];
        // console.log(x);
        x = x.last_id;
        x += 1;
        await pool.query(set_id_query, [str, x]);
        return x;
    }

    async add_order(pool, order) {
        this.orders[order.id] = order;
    }

    get_order (order_id) {
        return this.orders[order_id];
    }

    async kill(pool, character) {
        character.is_dead = true;
        if (character.is_player) {
            var user = this.users[character.user_id];
            await user.get_new_char(pool);
            this.chars[user.character.id] = user.character;
        }
        await character.delete_from_db(pool);
        // this.chars[character.id] = null;
    }

    async create_monster(pool, monster_class, cell_id) {
        var monster = new monster_class();
        var id = await monster.init(pool, this, cell_id);
        this.chars[id] = monster;
        return monster;
    }

    async create_battle(pool, attackers, defenders) {
        var battle = new Battle();
        var ids = [];
        var teams = [];
        for (var i = 0; i < attackers.length; i++) {
            ids.push(attackers[i].id);
            attackers[i].in_battle = true;
            teams.push(0);
        }
        for (var i = 0; i < defenders.length; i++) {
            ids.push(defenders[i].id);
            defenders[i].in_battle = true;
            teams.push(1);
        }
        var id = await battle.init(pool, world, ids, teams);
        this.battles[id] = battle;
        return battle;
    }

    async delete_battle(pool, id) {
        var battle = this.battles[id];
        await battle.delete_from_db(pool);
        this.battles[id] = null;
    }

    async delete_battle(pool, battle_id) {
        var battle = this.battles[battle_id];
        battle.delete_from_db(pool);
        this.battles[battle_id] = null;
    }

    //check if login is available and create new user
    async reg_player(pool, data) {
        var login_is_available = await this.check_login(pool, data.login);
        if (!login_is_available) {
            return {reg_promt: 'login-is-not-available', user: null};
        }
        var hash = await bcrypt.hash(data.password, salt);
        var new_user = new User();
        var id = await new_user.init(pool, this, data.login, hash);
        this.users[id] = new_user;
        this.chars[new_user.character.id] = new_user.character;
        return({reg_promt: 'ok', user: new_user});
    }

    async login_player(pool, data) {
        var user_data = await this.load_user_data_from_db(pool, data.login);
        if (user_data == null) {
            return {login_promt: 'wrong-login', user: null};
        }
        var password_hash = user_data.password_hash;
        var f = await bcrypt.compare(data.password, password_hash);
        if (f) {
            var user = await this.load_user_to_memory(pool, user_data);
            return({login_promt: 'ok', user: user});
        }
        return {login_promt: 'wrong-password', user: null};
    }

    async load_user_data_from_db(pool, login) {
        var res = await pool.query(find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return null;
        }
        return res.rows[0];
    }

    async load_user_to_memory(pool, data) {
        var user = new User();
        await user.load_from_json(pool, this, data);
        this.users[user.id] = user;
        return user;
    }

    async load_character_data_from_db(pool, char_id) {
        var res = await pool.query(select_char_by_id_query, [char_id]);
        if (res.rows.length == 0) {
            return null;
        }
        return res.rows[0];
    }

    async load_character_data_to_memory(pool, data) {
        var character = new Character();
        await character.load_from_json(pool, this, data)
        this.chars[data.id] = character;
        return character;
    }

    //check login availability
    async check_login(pool, login) {
        var res = await pool.query(find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }
}


class Battle {
    async init(pool, world, ids, teams) {
        this.id = await world.get_new_id(pool, 'battle_id');
        var range = world.BASE_BATTLE_RANGE;
        this.world = world;
        this.ids = ids;
        this.teams = teams;
        this.positions = Array(this.ids.length).fill(0);
        this.stash = new Stash();
        this.savings = new Savings();
        for (var i = 0; i < this.ids.length; i++) {
            if (this.teams[i] == 1) {
                this.positions[i] = range;
            }
        }
        await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        var log = [];
        for (var i = 0; i < this.ids.length; i++) {
            if (this.world.chars[this.ids[i]].get_hp() != 0) {
                var action = AI_fighter(this.world, i, this.ids, this.teams, this.positions);
                var log_entry = await this.action(pool, i, action);
                log.push(log_entry)
            }
        }
        await this.save_to_db(pool);
        return log;
    }

    async action(pool, actor_index, action) {
        var character = this.world.chars[this.ids[actor_index]];
        if (action.action == 'move') {
            if (action.target == 'right') {
                this.positions[actor_index] += 1;
            } else {
                this.positions[actor_index] -= 1;
            }
            return `${character.name} ${action.action} ${action.target}`
        } else if (action.action == 'attack') {
            if (action.target != null) {
                var damage = await character.attack(pool, action.target);
                return `${character.name} ${action.action} ${action.target.name} and deals ${damage} damage`;
            }
            return 'pfff';
        }
    }

    async run(pool) {
        // console.log(this.world.chars);
        while (this.is_over() == -1) {
            var log = await this.update(pool);
            for (var i = 0; i < this.ids.length; i++) {
                var character = world.chars[this.ids[i]];
                // console.log(character);
                // console.log(log)
                if (character.is_player) {
                    log.forEach(log_entry => this.world.users[character.user_id].socket.emit('log-message', log_entry));
                }
            }
        }
        var winner = this.is_over();
        var exp_reward = this.reward(1 - winner);
        await this.collect_loot(pool);
        await this.reward_team(pool, winner, exp_reward);
    }

    is_over() {
        var hp = [0, 0];
        for (var i = 0; i < this.ids.length; i++) {
            var character = this.world.chars[this.ids[i]];
            if (character == null) {
                var x = 0
            } else {
                var x = character.hp;
            }
            hp[this.teams[i]] += x;
        }
        if (hp[0] == 0) {
            return 1;
        }
        if (hp[1] == 0) {
            return 0;
        }
        return -1;
    }

    async collect_loot(pool) {
        for (var i = 0; i < this.ids.length; i ++) {
            var character = this.world.chars[this.ids[i]];
            if (character.hp == 0) {
                await character.transfer_all(pool, this);    
            }
        }
    }

    reward(team) {
        var exp = 0;
        for (var i = 0; i < this.ids.length; i++) {
            if (this.teams[i] == team) {
                exp += this.world.chars[this.ids[i]].get_exp_reward();
            }
        }
        return exp;
    }

    async reward_team(pool, team, exp) {
        var n = 0;
        for (var i = 0; i < this.ids.length; i++){
            if (this.teams[i] == team) {
                n += 1
            }
        }
        for (var i = 0; i < this.ids.length; i++) {
            var character = this.world.chars[this.ids[i]];
            if (this.teams[i] == team && !character.is_dead) {
                await character.give_exp(pool, Math.floor(exp / n));
            }
            character.in_battle = false;
        }
        var i = 0;
        while (this.teams[i] != team) {
            i += 1;
        }
        var leader = this.world.chars[this.ids[i]];
        for (var tag of this.world.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, leader, tag, x);
        }    
    }

    async load_to_db(pool) {
        await pool.query(new_battle_query, [this.id, this.ids, this.teams, this.positions]);
    }

    async save_to_db(pool) {
        pool.query(update_battle_query, [this.id, this.ids, this.teams, this.positions])
    }

    async delete_from_db(pool) {
        await pool.query(delete_battle_query, [this.id]);
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        await this.save_to_db(pool);
        await target.save_to_db(pool);
    }
}


class Agent {
    init_base_values(world, id, cell_id, name = null) {
        this.world = world;
        this.id = id;
        this.cell_id = cell_id;
        this.name = name;
        this.update_name();
        this.savings = new Savings;
        this.stash = new Stash;
        this.type = 'agent';
    }

    update_name() {
        if (this.name == null) {
            this.name = 'agent ' + this.id;
        }
    }

    async init(pool, world, cell_id, name = null) {
        id = await world.get_new_id(pool, 'agent');
        this.init_base_values(world, id, cell_id, name);
        this.load_to_db(pool);
    }

    async update(pool) {
        this.savings.update();
    }

    async load_to_db(pool) {
        pool.query(insert_agent_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json()]);
    }

    async save_to_db(pool) {
        pool.query(update_agent_query, [this.id, this.cell_id, this.savings.get_json(), this.stash.get_json()]);
    }

    async load_from_json(pool, world, data) {
        this.world = world;
        this.id = data.id;
        this.cell_id = data.cell_id;
        this.name = data.name;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        await this.save_to_db(pool);
        await target.save_to_db(pool);
    }

    async transfer_all(pool, target) {
        for (var tag of this.world.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, target, tag, x);
        }
        await this.save_to_db(pool);
    }

    async buy(pool, tag, amount, money, max_price = null) {
        await this.get_local_market().buy(pool, tag, this, amount, money, max_price);
    }

    async sell(pool, tag, amount, price) {
        await this.get_local_market().sell(pool, tag, this, amount, price);
    }

    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        return cell.market;
    }

    get_name() {
        return this.name;
    }
}

class Consumer extends Agent {
    init_base_values(world, id, cell_id, size, needs, name = null) {
        super.init_base_values(world, id, cell_id, name);
        this.data = {}
        this.data.needs = needs;
        this.data.size = size;
    }

    update_name() {
        if (this.name == null) {
            this.name = 'consumer ' + this.id;
        }
    }

    init(pool, world, cell_id, size, needs, name = null) {
        id = await world.get_new_id('consumer');
        this.init_base_values(world, id, cell_id, size, needs, name = null);
        this.load_to_db(pool);
    }

    async update(pool) {
        super.update(pool);
        this.consume_update(pool);
    }

    async set_size(pool, x) {
        this.data.size.current = Math.min(x, this.data.size.max);
        this.save_to_db(pool);
    }

    async consume_update(pool) {
        for (var i in this.data.needs) {
            this.consume(pool, i, false);
        }
        this.save_to_db(pool);
    }

    async consume(pool, tag, save = true) {
        this.stash.inc(tag, -this.needs[tag] + this.size.current);
        if (save) {
            this.save_to_db(pool);
        }
    }

    async load_to_db(pool) {
        pool.query(insert_consumer_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data]);
    }

    async save_to_db(pool) {
        pool.query(update_consumer_query, [this.id, this.cell_id, this.savings.get_json(), this.stash.get_json(), this.data]);
    }

    async load_from_json(pool, world, data) {
        this.world = world;
        this.id = data.id;
        this.cell_id = data.cell_id;
        this.name = data.name;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
        this.data = data.data;
    }
}


class Pop extends Consumer {
    init_base_values(world, id, cell_id, size, needs, name = null, AI = BasicPopAI) {
        super.init_base_values(world, id, cell_id, size, needs, name);
        this.AI = AI();   
    }

    async init(pool, world, cell_id, size, needs, name = null, AI = BasicPopAI) {
        
    }
}


class Character {
    init_base_values(world, id, name, hp, max_hp, exp, level, cell_id, user_id = -1) {
        this.world = world;
        this.name = name;
        if (user_id == -1) {
            this.is_player = false;
        } else {
            this.is_player = true;
        }
        this.hp = hp;
        this.max_hp = max_hp;
        this.exp = exp;
        this.level = level;
        this.id = id;
        this.dead = false;
        this.exp_reward = 5;
        this.equip = new Equip();
        this.in_battle = false;
        this.stash = new Stash();
        this.savings = new Savings();
        this.user_id = user_id;
        this.cell_id = cell_id;
    }

    async init(pool, world, name, cell_id, user_id = -1) {
        var id = await world.get_new_id(pool, 'char_id');
        this.init_base_values(world, id, name, 100, 100, 0, 0, cell_id, user_id);
        await this.equip.init(pool, world, id);
        await this.load_to_db(pool);
        return id;
    }

    async update(pool) {
        this.change_hp(pool, 1);
        if (this.is_player) {
            var socket = this.world.users[this.user_id].socket;
        } else {
            var socket = null;
        } 
        if (socket != null) {
            socket.emit('char-info', this.get_json());
        }
    }

    get_exp_reward() {
        return this.exp_reward;
    }

    get_range() {
        return this.equip.get_weapon_range();
    }

    async attack(pool, target) {
        var damage = 5;
        await target.take_damage(pool, damage);
        return damage;
    }

    async take_damage(pool, damage) {
        await this.change_hp(pool, -damage);
    }

    async change_hp(pool, x) {
        this.hp += x;
        if (this.hp > this.max_hp) {
            this.hp = this.max_hp;
        } 
        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this);
        }
        await pool.query(set_hp_query, [this.hp, this.id]);
    }

    async give_exp(pool, x) {
        await this.set_exp(pool, this.exp + x);
    }

    async set_exp(pool, x) {
        this.exp = x;
        await pool.query(set_exp_query, [x, this.id]);
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        await this.save_to_db(pool);
        await target.save_to_db(pool);
    }

    async transfer_all(pool, target) {
        for (var tag of this.world.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, target, tag, x);
        }
        await this.save_to_db(pool);
    }

    async buy(pool, tag, amount, money, max_price = null) {
        var cell = this.world.get_cell_by_id(this.cell_id);
        await cell.market.buy(pool, tag, this, amount, money, max_price);
    }

    async sell(pool, tag, amount, price) {
        if (logging) {
            console.log('character sell', tag, amount, price);
        }
        var cell = this.world.get_cell_by_id(this.cell_id);
        await cell.market.sell(pool, tag, this, amount, price);
    }

    get_hp() {
        return this.hp
    }

    async load_from_json(pool, world, data) {
        this.world = world;
        this.id = data.id;
        this.name = data.name;
        this.hp = data.hp;
        this.max_hp = data.max_hp;
        this.exp = data.exp;
        this.level = data.level;
        this.user_id = data.user_id;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
        this.is_player = (this.user_id != -1);
        this.cell_id = data.cell_id;
        this.dead = (this.hp == 0);
        this.in_battle = data.in_battle;
        this.Equip = new Equip();
    }

    get_json() {
        return {name: this.name,
                hp: this.hp,
                max_hp: this.max_hp,
                savings: this.savings.get_json(),
                stash: this.stash.get_json(),
                level: this.level,
                exp: this.exp};
    }

    async load_to_db(pool) {
        // console.log(pool);
        await pool.query(new_char_query, [this.name, this.hp, this.max_hp, this.exp, this.level, this.id, this.is_player, this.cell_id, this.user_id, this.savings.get_json(), this.stash.get_json(), this.in_battle]);
    }

    async save_to_db(pool) {
        await pool.query(update_char_query, [this.id, this.hp, this.max_hp, this.exp, this.level, this.cell_id, this.savings.get_json(), this.stash.get_json(), this.in_battle]);
    }

    async delete_from_db(pool) {
        await pool.query(delete_char_query, [this.id]);
    }
}


class Rat extends Character {
    async init(pool, world, cell_id, name = null) {
        var id = await world.get_new_id(pool, 'char_id');
        if (name == null) {
            name = 'rat ' + id;
        }
        this.init_base_values(world, id, name, 10, 10, 0, 0, cell_id);
        await this.equip.init(pool, world, id);
        this.stash.inc('meat', 1);
        await this.load_to_db(pool);
        return id;
    }
}


class Equip {
    async init(pool, world, id){
        this.id = id;
    }

    get_weapon_range() {
        return 1;
    }
}


class User {
    async init(pool, world, login, hash) {
        this.login = login;
        this.id = await world.get_new_id(pool, 'user_id');
        this.socket = null;
        this.world = world;
        this.password_hash = hash;
        await this.get_new_char(pool);
        await this.load_to_db(pool);
        return this.id;
    }

    async get_new_char(pool) {
        this.character = new Character();
        this.char_id = await this.character.init(pool, this.world, this.login, 0, this.id);
    }

    set_socket(socket) {
        this.socket = socket;
    }

    async load_from_json(pool, world, data) {
        this.login = data.login;
        this.id = data.id;
        this.socket = null;
        this.world = world;
        this.password_hash = data.password_hash;
        this.char_id = data.char_id;
        var char_data = await world.load_character_data_from_db(pool, this.char_id);
        var character = await world.load_character_data_to_memory(pool, char_data);
        this.character = character;
    }

    async load_to_db(pool) {
        await pool.query(new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }

    async save_to_db(pool) {
        await pool.query(update_user_query, [this.char_id]);
    }
}


var world = new World();

(async () => {
    try {
        var client = await pool.connect();
        await client.query('DROP TABLE IF EXISTS accounts');
        await client.query('DROP TABLE IF EXISTS chars');
        await client.query('DROP TABLE IF EXISTS last_id');
        await client.query('DROP TABLE IF EXISTS battles');
        await client.query('DROP TABLE IF EXISTS worlds');
        await client.query('DROP TABLE IF EXISTS markets');
        await client.query('DROP TABLE IF EXISTS cells');
        await client.query('DROP TABLE IF EXISTS market_orders');
        await client.query('CREATE TABLE accounts (login varchar(200), password_hash varchar(200), id int PRIMARY KEY, char_id int)');
        await client.query('CREATE TABLE chars (name varchar(200), hp int, max_hp int, exp int, level int, id int PRIMARY KEY, is_player boolean, cell_id int, user_id int, savings jsonb, stash jsonb, in_battle boolean)');
        await client.query('CREATE TABLE last_id (id_type varchar(30), last_id int)');
        await client.query('CREATE TABLE battles (id int PRIMARY KEY, ids int[], teams int[], positions int[])');
        await client.query('CREATE TABLE worlds (x int, y int)');
        await client.query('CREATE TABLE markets (id int PRIMARY KEY, data jsonb)');
        await client.query('CREATE TABLE cells (id int PRIMARY KEY, x int, y int, name varchar(30), market_id int, owner_id int, pop_id int)');
        await client.query('CREATE TABLE market_orders (id int PRIMARY KEY, typ varchar(5), tag varchar(30), owner_id int, amount int, price int, market_id int)');
        await init_ids(client);
        await client.end();
        await world.init(pool, 1, 1);
        var rat_trader = await world.create_monster(pool, Rat, 0);
        rat_trader.savings.inc(1000);
        await rat_trader.buy(pool, 'meat', 1000, 1000);

        console.log('database is ready');
    } catch (e) {
        console.log(e);
    }
})();


async function init_ids(client) {
    var id_types = ['battle_id', 'user_id', 'char_id', 'market_order_id', 'market_id', 'cell_id'];
    for (var i = 0; i < id_types.length; i++) {
        await client.query(init_id_query, [id_types[i], 0]);
    }
    return null;
}


//app.set('view engine', 'pug');
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/base.html');
});


function new_user_online(io, world, login) {
    world.users_online.push(login);
    io.emit('new-user-online', login);
}

function user_disconnects(io, world, login) {
    var i = world.users_online.indexOf(login);
    world.users_online.splice(i, 1);
    io.emit('users-online', world.users_online);
}

function update_char_info(socket, user) {
    socket.emit('char-info', user.character.get_json());
}

function update_market_info(socket, user) {
    var cell_id = user.character.cell_id;
    var cell = world.get_cell_by_id(cell_id);
    var data = cell.market.get_orders_list();
    if (logging) {
        console.log('sending market orders to client');
        console.log(data);
    }
    io.emit('market-data', data);
}

function validate_creds(data) {
    if (data.login.length == 0) {
        return 'empty-login';
    }
    if (data.login.length >= 30) {
        return 'too-long';
    }
    if (data.password.length == 0){
        return 'empty-pass';
    }
    if (!validator.isAlphanumeric(data.login, 'en-US')){
        return 'login-not-allowed-symbols';
    }
    return 'ok';
}

io.on('connection', async socket => {
    console.log('a user connected');
    var online = false;
    var current_user = null;
    socket.emit('users-online', world.users_online);
    socket.emit('tags', world.TAGS);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (online == true) {
            user_disconnects(io, world, current_user.login);
        }
    });

    socket.on('login', async data => {
        // console.log(data);
        if (online) {
            socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        var error_message = validate_creds(data);
        socket.emit('is-login-valid', error_message);
        var answer = await world.login_player(pool, data);
        socket.emit('is-login-completed', answer.login_promt);
        if (answer.login_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            new_user_online(io, world, data.login);
            online = true;
            socket.emit('log-message', 'hello ' + data.login);
            update_char_info(socket, current_user);
            update_market_info(socket, current_user);
        }
    });

    socket.on('reg', async data => {
        if (online) {
            socket.emit('is-reg-valid', 'you-are-logged-in');
            return;
        }
        var error_message = validate_creds(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await world.reg_player(pool, data);
        // console.log(answer);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            new_user_online(io, world, data.login);
            online = true;
            socket.emit('log-message', 'hello ' + data.login);
            update_char_info(socket, current_user);
            update_market_info(socket, current_user);
        }
    });

    socket.on('attack', async msg => {
        if (current_user != null && !current_user.character.in_battle) {
            var rat = await world.create_monster(pool, Rat, current_user.character.cell_id);
            var battle = await world.create_battle(pool, [current_user.character], [rat]);
            var log = await battle.run(pool);
            await world.delete_battle(pool, battle.id);
            await update_char_info(socket, current_user);
            // log.forEach(log_entry => socket.emit('log-message', log_entry));
        }
    });

    socket.on('buy', async msg => {
        var flag = (world.TAGS.indexOf(msg.tag) > -1) && (validator.isInt(msg.amount)) && (validator.isInt(msg.money)) && (validator.isInt(msg.max_price) || msg.max_price == null);
        if ((current_user != null) && flag) {
            if (!(msg.max_price == null)) {
                msg.max_price = parseInt(msg.max_price);
            }
            await current_user.character.buy(pool, msg.tag, parseInt(msg.amount), parseInt(msg.money), msg.max_price);
            update_market_info(socket, current_user);
            update_char_info(socket, current_user);
        }
    });

    socket.on('sell', async msg => {
        var flag = (world.TAGS.indexOf(msg.tag) > -1) && (validator.isInt(msg.amount)) && (validator.isInt(msg.price));
        if ((current_user != null) && flag) {
            if (logging) {
                console.log('sell message', msg);
            }
            await current_user.character.sell(pool, msg.tag, parseInt(msg.amount), parseInt(msg.price));
            update_market_info(socket, current_user);
            update_char_info(socket, current_user);
        }
    });
});

http.listen(port, () => {
    console.log('listening on *:3000');
});

gameloop.setGameLoop(async delta => await world.update(pool), 2000);
// setInterval(async () => await world.update(pool), 2000);