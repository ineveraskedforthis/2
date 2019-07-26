require('dotenv').config({path: __dirname + '/.env'});
var version = 0;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
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

BASE_FIGHT_RANGE = 10;
LAST_ID = 0;
LAST_FIGHT_ID = 0;
USERS_ONLINE = [];
USERS = {};
CHARACTERS = {};

new_user_query = 'INSERT INTO accounts (login, password_hash, id) VALUES ($1, $2, $3)';
new_char_query = 'INSERT INTO chars (name, hp, max_hp, exp, level, id, is_player) VALUES ($1, $2, $3, $4, $5, $6, $7)';
reset_id_query = 'INSERT INTO last_id (id_type, last_id) VALUES ($1, $2)';
new_battle_query = 'INSERT INTO battles (id, ids, teams, positions) VALUES ($1, $2, $3, $4)';
update_battle_query = 'UPDATE battles SET ids = ($2), teams = ($3), positions = ($4) WHERE id = ($1)';
find_user_by_login_query = 'SELECT * FROM accounts WHERE login = ($1)';
set_hp_query = 'UPDATE chars SET hp = ($1) WHERE id = ($2)';
set_exp_query = 'UPDATE chars SET exp = ($1) WHERE id = ($2)';
set_id_query = 'UPDATE last_id SET last_id = ($2) WHERE id_type = ($1)';
get_id_query = 'SELECT * FROM last_id WHERE id_type = ($1)';
save_world_size_query = '';
new_cell_query = '';
new_market_query = '';
update_market_query = '';


function sum(a) {
    return a.reduce((x, y) => x + y, 0);
}


function AI_fighter(index, ids, teams, positions) {
    var min_distance = BASE_FIGHT_RANGE;
    var closest_enemy = null;
    for (i = 0; i < positions.length; i++) {
        var dx = positions[i] - positions[index];
        if (((Math.abs(dx) <= Math.abs(min_distance)) || (closest_enemy == null)) && (teams[i] != teams[index]) && (CHARACTERS[ids[i]] != null)) {
            closest_enemy = i;
            min_distance = dx;
        }
    }
    if (closest_enemy == null) {
        return {action: 'idle', target: null};
    }
    var actor = CHARACTERS[ids[index]];
    var target = CHARACTERS[ids[closest_enemy]];
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

    transfer(target, tag, x) {
        tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    check_tag(tag) {
        if (not (tag in this.data)) {
            this.data[tag] = 0;
        }
    }
}


class MarketOrder {
    async init(pool, typ, tag, owner, amount, price, market_id) {
        this.typ = typ;
        this.tag = tag;
        this.owner = owner;
        this.amount = amount;
        this.price = price;
        this.id = await get_new_id('market_order');
        this.market_id = market_id;
        await pool.query(new_market_order_query, [id, typ, tag, owner, amount, price, market]);
    }

    async save_to_db(pool) {
        await pool.query(update_market_order_query, [id, typ, tag, owner, amount, price, market])
    }

    get_json() {

    }
}


// remember to check how taxes are working
class Market {
    async init(pool, world, cell_id, owner) {
        this.id = await get_new_id('market');
        this.cell_id = cell_id;
        this.owner = owner;
        this.world = world;
        this.savings = new Savings();
        this.stash = new Stash();
        this.buy_orders = {};
        this.sell_orders = {};
        this.planned_money_to_spent = {};
        this.total_cost_of_placed_goods = {};
        this.max_price = {};
        this.total_sold = {};
        this.total_sold_cost = {};
        this.total_sold_new = {};
        this.total_sold_cost_new = {};
        this.sells = {};
        this.tmp_sells = {};
        this.taxes = {};
        for (tag in world.TAGS) {
            this.taxes[tag] = 0;
            this.planned_money_to_spent[tag] = 0;
            this.total_cost_of_placed_goods[tag] = 0;
            this.tmp_plannned_money_to_spent[tag] = 0;
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
    }

    async update(pool) {
        for (tag in this.world.TAGS) {
            this.planned_money_to_spent[tag] = self.tmp_plannned_money_to_spent[tag];
            this.tmp_plannned_money_to_spent = 0;
            this.total_cost_of_placed_goods[tag] = this.tmp_total_cost_of_placed_goods[tag];
            this.tmp_total_cost_of_placed_goods[tag] = 0;
            this.total_sold[tag] = this.total_sold[tag].slice(1);
            this.total_sold.push(this.total_sold_new[tag]]);
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

    async buy(pool, tag, buyer, amount, money) {
        if (buyer.savings.get() < money) {
            money = buyer.savings.get(pool);
        }
        this.tmp_plannned_money_to_spent[tag] += money;
        var tmp = [];
        for (var i in this.sell_orders[tag]) {
            tmp.push(world.get_order(pool, i));
        }
        tmp.sort((a, b) => a.price - b.price});
        var i = 0;
        var j = 0;
        var total_spendings = 0;
        var y = money;
        while ((i < tmp.length) && (amount > 0)) {
            var tmp_amount = 0;
            while ((i < tmp.length) && (tmp[i].price == tmp[j].price)) {
                tmp_amount += tmp[i].amount;
                i += 1;
            }
            if ((money - total_spendings) < (amount * tmp[j].price)) {
                amount = Math.floor((money - total_spendings) / tmp[j].price);
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
            await this.new_order(pool, 'BUY', tag, amount, price, buywe);
        }
        await his.clear_empty_sell_orders[tag];
        await this.save_to_db(pool);
        return total_spendings;
    }

    async sell(pool, tag, seller, amount, price) {
        if (amount > seller.stash.get(tag)) {
            amount = seller.stash.get(tag);
        }
        this.tmp_total_cost_of_placed_goods[tag] += amount * price;
        var tmp = [];
        for (var i in this.buy_orders[tag]) {
            tmp.push(this.world.get_order(pool, i));
        }
        tmp.sort((a, b) => b.price - a.price});
        var i = 0;
        var j = 0;
        while ((i < tmp.length) && (amount > 0) && (tmp[i].price >= price) {
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
                for (var k = j; k <= i; k++) {
                    var memelord = Math.floor((tmp[k].amount / tmp_amount) * u_amount);
                    amount -= memelord;
                    await this.execute_buy_order(pool, tmp[k], memelord, seller);
                }
                for (var k = j; k <= i; k++) {
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
        if (typ == 'SELL') {
            var tmp = await agent.stash.transfer(pool, this.stash, tag, amount);
            var order = new MarketOrder();
            order_id = await order.init(pool, typ, tag, agent, tmp, price, this.id);
            this.sell_orders[tag].add(order_id);
            this.world.add_order(pool, order);
        }
        if (type == 'BUY') {
            if (price != 0) {
                savings = await agent.savings.get(pool);
                amount = min(amount, Math.floor(savings / price));
                await agent.savings.transfer(pool, this.savings, amount * price)
                var order = new MarketOrder();
                order_id = await order.init(pool, typ, tag, agent, amount, price, this.id);
                this.buy_orders[tag].add(order_id);
                this.world.add_order(pool, order);
            } else {
                var order = new MarketOrder();
                order_id = await order.init(pool, typ, tag, agent, amount, price, this.id);
                this.buy_orders[tag].add(order_id);
                this.world.add_order(pool, order);
            }
        }
    }

    async execute_buy_order(pool, order, amount, seller) {
        this.tmp_sells[order.tag].push([amount, order.price]);
        order.amount -= amount;
        await order.save_to_db(pool);
        await this.savings.transfer(pool, seller.savings, amount * order.price);
        await this.savings.transfer(pool, this.owner.savings, amount * this.taxes[order.tag]);
        await seller.stash.transfer(pool, order.owner.stash, order.tag, amount);
        this.total_sold_new[order.tag] += amount;
        this.total_sold_cost_new[order.tag] += amount * order.price;
        await this.save_to_db(pool);
        return amount * (order.price + this.taxes[order.tag]);
    }

    async execute_sell_order(pool, order, amount, buyer) {
        this.tmp_sells[order.tag].push([amount, order.price]);
        order.amount -= amount;
        await order.save_to_db(pool);
        await this.stash.transfer(pool, buyer.stash, order.tag, amount);
        await buyer.savings.transfer(pool, order.owner.savings, amount * order.price);
        await buyer.savings.transfer(pool, this.owner.savings, amount * this.taxes[order.tag]);
        this.total_sold_new[order.tag] += amount;
        this.total_sold_cost_new[order.tag] += amount * order_price;
        await this.save_to_db(pool);
        return amount * (order.price + this.taxes[order.tag]);
    }

    async clear_empty_sell_orders(pool, tag) {
        var tmp = new Set();
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (var i in tmp) {
            this.cancel_sell_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_empty_buy_orders(pool, tag) {
        var tmp = new Set();
        for (var i in this.buy_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (var i in tmp) {
            this.cancel_buy_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_agent_orders(pool, agent, tag) {
        this.clear_agent_buy_orders(pool, agent, tag);
        this.clear_agent_sell_orders(pool, agent, tag);
    }

    async clear_agent_sell_orders(pool, agent, tag) {
        var tmp = new Set();
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            if (order.owner == agent) {
                tmp.add(i);
            }
        }
        for (var i in tmp) {
            this.cancel_sell_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_agent_buy_orders(pool, agent, tag) {
        var tmp = new Set();
        for (var i in this.buy_orders[tag]) {
            var order = await this.world.get_order(pool, i);
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
        for (var tag in this.world.TAGS) {
            for (var i in this.buy_orders[tag]) {
                order = await this.world.get_order(pool, i);
                if (order.owner == agent) {
                    tmp += i.amount * (i.price + this.taxes[order.tag]);
                }
            }
        }
        return tmp;
    }

    async cancel_buy_order(pool, order_id) {
        var order = await this.world.get_order(pool, order_id);
        var amount = order.amount * (order_price + this.taxes[order.tag]);
        await this.savings.transfer(pool, order.owner.savings, amount);
        this.buy_orders[order.tag].delete(order_id);
        await this.save_to_db(pool);
    }

    async cancel_sell_order(pool, order_id) {
        var order = await this.world.get_order(pool, order_id);
        await this.stash.transfer(pool, order.owner.stash, order.tag, order.amount);
        this.sell_orders[order.tag].delete(order_id);
        await this.save_to_db(pool);
    }

    async check_cost(pool, list_of_goods) {
        var cost = 0;
        for (var i in list_of_goods) {
            cost += await this.check_tag_cost(i[0], i[1]);
        }
        return cost;
    }

    async guess_cost(pool, list_of_goods) {
        var cost = 0;
        for (var i in list_of_goods) {
            cost += await this.guess_tag_cost(i[0], i[1])
        }
        return cost;
    }

    async check_tag_cost(pool, tag, amount) {
        var tmp = [];
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var i = 0;
        var j = 0;
        var cost = 0;
        for (var i in tmp) {
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
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var i = 0;
        var j = 0;
        var cost = 0;
        for (var i in tmp) {
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
        for (var i in this.tmp_sells[tag]) {
            if (i[1] <= x) {
                cost += i[0] * i[1];
            }
        }
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            if (order.price <= x) {
                cost += i.amount * i.price;
            }
        }
        return cost;
    }

    async get_average_tag_price(pool, tag) {
        var total_count = sum(this.total_sold[tag]) + this.total_sold_new[tag];
        var total_cost = sum(this.total_sold_cost[tag]) + this.total_sold_cost_new[tag];
        for (var i in this.sell_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            total_count += order.amount;
            total_cost += order.amount * (order.price + this.taxes[tag]);
        }
        for (var i in this.buy_orders[tag]) {
            var order = await this.world.get_order(pool, i);
            total_count += order.amount;
            total_cost += order.amount * (order.price + this.taxes[tag]);
        }
        if (total_count != 0) {
            return total_cost / total_count;
        }
        return this.world.HISTORY_PRICE[tag]
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

    async get_orders_list(pool) {
        var tmp = [];
        for (var tag in this.world.TAGS) {
            for (var i in this.buy_orders[tag]) {
                order = await world.get_order(i);
                tmp.push(order.get_json());
            }
            for (var i in this.sell_orders[tag]) {
                order = await world.get_order(i);
                tmp.push(order.get_json());
            }
        }
        return tmp;
    }

    async save_to_db(pool) {
        await pool.query(update_market_query, [this.get_json()]);
    }

    async load_to_db(pool) {
        await pool.query(new_market_query, [this.get_json()]);
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
        tmp.planned_money_to_spent = his.planned_money_to_spent;
        tmp.total_cost_of_placed_goods = this.total_cost_of_placed_goods;
        tmp.max_price = this.max_price;
        tmp.total_sold = this.total_sold;
        tmp.total_sold_cost = his.total_sold_cost;
        tmp.total_sold_new = this.total_sold_new;
        tmp.total_sold_cost_new = this.total_sold_cost_new;
        tmp.sells = this.sells;
        tmp.tmp_sells = this.tmp_sells;
        tmp.taxes = this.taxes;
        return tmp;
    }
}


class Tile {}


class SmallTownTile extends Tile {}


class PasturesTile extends Tile {}


class VillageTile extends Tile {}


class ForestTile extends Tile {}


class Cell {
    async init(pool, world, map, i, j, name, owner) {
        this.name = i + ' ' + j;
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        var market = new Market();
        market_id = await market.init(pool);
        this.market = market_id;
        this.tiles = [];
        this.owner = owner;
        var pop = new HomelessHumanBeings();
        pop_id = await pop.init(pool, this.world, this, 0, 'homeless ' + this.name);
        this.pop = pop_id;
        pool.query(new_cell_query, [i, j, name, market_id, [], owner, pop_id]);
    }

    async update(pool) {
        this.world.get_market(this.market).update(pool);
        for (var i in this.tiles) {
            await this.world.get_tile(i).update(pool);
        }
    }

    async get_market(pool) {
        market = await this.world.get_market(pool, this.market);
        return market;
    }

    async get_enterprises_list(pool) {
        var tmp = [];
        for (var i in this.tiles) {
            tile = await this.world.get_tile(i);
            for (var j in tile.enterprises) {
                tmp.push(j)
            }
        }
        return tmp;
    }

    async set_owner(pool, owner) {
        this.owner = owner;
        await pool.query(update_cell_owner_query, owner);
    }

    async get_pops_list(pool) {
        var tmp = [this.pop];
        for (var i in self.tiles) {
            var tile = await this.world.get_tile(i);
            var tmp2 = await tile.get_pops_list(pool);
            tmp.concat(tmp2);
        }
        return tmp;
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
                await cell.init(pool, world, this, i, j, null, null);
            }
            this.cells.push(tmp);
        }
    }

    async update(pool) {
        for (var i = 0; i < this.x; i++) {
            for (var j = 0; j < this.y; j++) {
                await this.cells[i][j].update();
            }
        }
    }

    async get_cell(pool, x, y) {
        return this.cells[x][y];
    }
}


class World {
    async init(pool, x, yl) {
        this.x = x;
        this.y = y;
        this.agents = {};
        this.map = Map();
        this.map.init(pool, this);
        pool.query(save_world_size_query, [x, y]);
    }

    async update(pool) {
        for (var i in this.agents) {
            await i.update();
        }
    }

    async get_cell(pool, x, y) {
        var cell = await this.map.get_cell(pool, x, y);
        return cell;
    }

    async get_pops(pool) {
        var tmp = [];
        for (var i in this.agents) {
            if (i.is_pop) {
                tmp.push(i);
            }
        }
        return tmp;
    }

    async get_total_money() {
        var tmp = 0;
        for (var i in this.agents) {
            tmp += i.savings.get('money');
        }
        return tmp;
    }
}


class Fight {
    async init(id, ids, teams, range = BASE_FIGHT_RANGE) {
        this.id = id;
        this.ids = ids;
        this.teams = teams;
        this.positions = Array(this.ids.length).fill(0);
        for (var i = 0; i < this.ids.length; i++) {
            if (this.teams[i] == 1) {
                this.positions[i] = range;
            }
        }
        await pool.query(new_battle_query, [id, ids, teams, this.positions]);
    }

    async update() {
        var log = [];
        for (var i = 0; i < this.ids.length; i++) {
            if (CHARACTERS[this.ids[i]].get_hp() != 0) {
                var action = AI_fighter(i, this.ids, this.teams, this.positions);
                var log_entry = await this.action(i, action);
                log.push(log_entry)
            }
        }
        this.save();
        return log;
    }

    async action(actor_index, action) {
        var character = CHARACTERS[this.ids[actor_index]];
        if (action.action == 'move') {
            if (action.target == 'right') {
                this.positions[actor_index] += 1;
            } else {
                this.positions[actor_index] -= 1;
            }
            return `${character.name} ${action.action} ${action.target}`
        } else if (action.action == 'attack') {
            if (action.target != null) {
                var damage = await character.attack(action.target);
                return `${character.name} ${action.action} ${action.target.name} and deals ${damage} damage`;
            }
            return 'pfff';
        }
    }

    async save() {
        pool.query(update_battle_query, [this.id, this.ids, this.teams, this.positions])
    }

    async run() {
        while (this.is_over() == -1) {
            var log = await this.update();
            for (var i = 0; i < this.ids.length; i++) {
                if (CHARACTERS[this.ids[i]].is_player) {
                    log.forEach(log_entry => USERS[this.ids[i]].socket.emit('log-message', log_entry));
                }
            }
        }
        var winner = this.is_over();
        var exp_reward = this.reward(1 - winner);
        await this.reward_team(winner, exp_reward);
    }

    is_over() {
        var hp = [0, 0];
        for (var i = 0; i < this.ids.length; i++) {
            hp[this.teams[i]] += CHARACTERS[this.ids[i]].hp;
        }
        if (hp[0] == 0) {
            return 1;
        }
        if (hp[1] == 0) {
            return 0;
        }
        return -1;
    }

    reward(team) {
        var exp = 0;
        for (var i = 0; i < this.ids.length; i++){
            if (this.teams[i] == team) {
                exp += CHARACTERS[this.ids[i]].get_exp_reward();
            }
        }
        return exp;
    }

    async reward_team(team, exp) {
        var n = 0;
        for (var i = 0; i < this.ids.length; i++){
            if (this.teams[i] == team) {
                n += 1
            }
        }
        for (var i = 0; i < this.ids.length; i++) {
            var character = CHARACTERS[this.ids[i]];
            if (this.teams[i] == team && character != null) {
                await character.give_exp(Math.floor(exp / n));
            }
            character.in_battle = false;
        }
    }
}


class Character {
    init_base_values(id, name, player, hp, max_hp, exp, level) {
        this.name = name;
        this.is_player = player;
        this.hp = hp;
        this.max_hp = max_hp;
        this.exp = exp;
        this.level = level;
        this.id = id;
        this.dead = false;
        this.exp_reward = 5;
        this.equip = new Equip();
        this.in_battle = false;
    }

    async init(id, name, player = false) {
        this.init_base_values(id, name, player, 100, 100, 0, 0);
        await this.equip.init(id);
        await this.save_to_db();
    }

    async save_to_db() {
        await pool.query(new_char_query, [this.name, this.hp, this.max_hp, this.exp, this.level, this.id, this.is_player]);
    }

    get_exp_reward() {
        return this.exp_reward;
    }

    get_range() {
        return this.equip.get_weapon_range();
    }

    async attack(target) {
        var damage = 5;
        await target.take_damage(damage);
        return damage;
    }

    async take_damage(damage) {
        await this.change_hp(damage);
    }

    async change_hp(x) {
        this.hp -= x;
        if (this.hp <= 0) {
            this.hp = 0;
            await kill(this);
        } else {
            await pool.query(set_hp_query, [this.hp, this.id]);
        }
    }

    async give_exp(x) {
        await this.set_exp(this.exp + x);
    }

    async set_exp(x) {
        this.exp = x;
        await pool.query(set_exp_query, [x, this.id]);
    }

    async get_hp() {
        return this.hp
    }
}

class Rat extends Character {
    async init(id, name = null) {
        if (name == null) {
            name = 'rat ' + id;
        }
        this.init_base_values(id, name, false, 10, 10, 0, 0);
        await this.equip.init(id);
        await this.save_to_db();
    }
}


class Equip {
    async init(id){
        this.id = id;
    }

    get_weapon_range() {
        return 1;
    }
}


class User {
    async create(login, hash, id){
        this.login = login;
        this.id = id;
        await pool.query(new_user_query, [login, hash, id]);
        this.character = new Character();
        this.socket = null;
        await this.character.init(this.id, this.login, true);
    }

    set_socket(socket) {
        this.socket = socket;
    }
}


(async () => {
    try {
        client = await pool.connect();
        await client.query('DROP TABLE IF EXISTS accounts');
        await client.query('DROP TABLE IF EXISTS chars');
        await client.query('DROP TABLE IF EXISTS last_id');
        await client.query('DROP TABLE IF EXISTS battles');
        await client.query('CREATE TABLE accounts (login varchar(200), password_hash varchar(200), id int PRIMARY KEY)');
        await client.query('CREATE TABLE chars (name varchar(200), hp int, max_hp int, exp int, level int, id int PRIMARY KEY, is_player boolean)');
        await client.query('CREATE TABLE last_id (id_type varchar(10), last_id int)');
        await client.query('CREATE TABLE battles (id int PRIMARY KEY, ids int[], teams int[], positions int[])');
        await reset_ids(client);
        await client.end();
        //await client.query();
        console.log('database is ready');
    } catch (e) {
        console.log(e);
    }
})();


async function reset_ids(client) {
    await client.query(reset_id_query, ['battle_id', 0]);
    await client.query(reset_id_query, ['user_id', 0]);
}


//app.set('view engine', 'pug');
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/base.html');
});

io.on('connection', async socket => {
    console.log('a user connected');
    var online = false;
    var current_user = null;
    function new_user_online(login) {
        if (online == false) {
            USERS_ONLINE.push(login);
            io.emit('new-user-online', login);
            online = true;
        }
    }

    function user_disconnects(login) {
        i = USERS_ONLINE.indexOf(login);
        USERS_ONLINE.splice(i, 1);
        io.emit('users-online', USERS_ONLINE);
    }

    socket.emit('users-online', USERS_ONLINE);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (online == true) {
            user_disconnects(current_user.login);
        }
    });
    socket.on('login', async data => {
        console.log(data);
        //socket.emit('new-user-online', data.login);
    });
    socket.on('reg', async data => {
        error_message = validate_reg(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await reg_player(data);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            USERS[current_user.id] = current_user;
            CHARACTERS[current_user.id] = current_user.character;
            new_user_online(data.login);
            socket.emit('log-message', 'hello ' + data.login);
            update_char_info(socket, current_user);
        }
    })

    socket.on('attack', async msg => {
        if (current_user != null && !current_user.character.in_battle) {
            rat = await create_monster(Rat);
            battle = await create_battle([current_user.character], [rat]);
            log = await battle.run();
            await update_char_info(socket, current_user);
            // log.forEach(log_entry => socket.emit('log-message', log_entry));
        }
    })
});

http.listen(port, () => {
    console.log('listening on *:3000');
});


async function kill(character) {
    character.dead = true;
}


async function create_monster(monster_class) {
    monster = new monster_class();
    id = await get_new_id('user_id');
    await monster.init(id);
    CHARACTERS[id] = monster;
    return monster;
}


async function create_battle(attackers, defenders) {
    battle = new Fight();
    id = await get_new_id('battle_id');
    ids =[];
    teams =[];
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
    await battle.init(id, ids, teams);
    return battle;
}

function update_char_info(socket, user) {
    socket.emit('char-info', {login: user.login, hp: user.character.hp, max_hp: user.character.max_hp, exp: user.character.exp});
}

function validate_reg(data) {
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

//check if login is available and create new user
async function reg_player(data) {
    var login_is_available = await check_login(data.login);
    if (!login_is_available) {
        return {reg_promt: 'login-is-not-available', user: null};
    }
    var hash = await bcrypt.hash(data.password, salt);
    new_user = new User();
    id = await get_new_id('user_id');
    await new_user.create(data.login, hash, id);
    USERS[id] = new_user;
    return({reg_promt: 'ok', user: new_user});
}

async function get_new_id(str) {
    x = await pool.query(get_id_query, [str]);
    x = x.rows[0];
    x = x.last_id;
    x += 1;
    await pool.query(set_id_query, [str, x]);
    return x;
}

//check login availability
async function check_login(login) {
    res = await pool.query(find_user_by_login_query, [login]);
//    console.log('select responce', res);
    if (res.rows.length == 0) {
        return true;
    }
    return false;
}
