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
var dbname = process.env.DBNAME;
if (stage == 'dev') {
    var pool = new Pool({database: dbname});
} else{
    var pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: true});
}
var salt = process.env.SALT;
const logging = false;
const logging_db_queries = false;

var MESSAGES = [];
var MESSAGE_ID = 0;

var new_user_query = 'INSERT INTO accounts (login, password_hash, id, char_id) VALUES ($1, $2, $3, $4)';
var new_char_query = 'INSERT INTO chars (id, user_id, cell_id, name, hp, max_hp, savings, stash, equip, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
var init_id_query = 'INSERT INTO last_id (id_type, last_id) VALUES ($1, $2)';
var new_battle_query = 'INSERT INTO battles (id, ids, teams, positions) VALUES ($1, $2, $3, $4)';
var new_cell_query = 'INSERT INTO cells (id, x, y, name, market_id, owner_id, pop_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
var new_market_query = 'INSERT INTO markets (id, data) VALUES ($1, $2)';
var new_market_order_query = 'INSERT INTO market_orders (id, typ, tag, owner_id, amount, price, market_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
var insert_agent_query = 'INSERT INTO agents (id, cell_id, name, savings, stash) VALUES ($1, $2, $3, $4, $5)';
var insert_consumer_query = 'INSERT INTO consumers (id, cell_id, name, savings, stash, data) VALUES ($1, $2, $3, $4, $5, $6)';
var insert_pop_query = 'INSERT INTO pops (id, cell_id, name, savings, stash, data, race_tag, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
var insert_enterprise_query = 'INSERT INTO enterprises (id, cell_id, name, savings, stash, data, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7)';


var update_battle_query = 'UPDATE battles SET ids = ($2), teams = ($3), positions = ($4) WHERE id = ($1)';
var update_market_order_query = 'UPDATE market_orders SET amount = ($2) WHERE id = ($1)';
var update_market_query = 'UPDATE markets SET data = ($2) WHERE id = ($1)';
var update_char_query = 'UPDATE chars SET cell_id = ($2), hp = ($3), max_hp = ($4), savings = ($5), stash = ($6), equip = ($7), data = ($8) WHERE id = ($1)';
var update_agent_query = 'UPDATE agents SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5) WHERE id = ($1)';
var update_consumer_query = 'UPDATE consumers SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6) WHERE id = ($1)';
var update_pop_query = 'UPDATE pops SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), race_tag = ($7), ai_tag = ($8) WHERE id = ($1)';
var update_enterprise_query = 'UPDATE enterprises SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), ai_tag = ($7) WHERE id = ($1)';

var delete_market_order_query = 'DELETE FROM market_orders WHERE id = ($1)';
var delete_battle_query = 'DELETE FROM battles WHERE id = ($1)';
var delete_char_query = 'DELETE FROM chars WHERE id = ($1)';

var find_user_by_login_query = 'SELECT * FROM accounts WHERE login = ($1)';
var select_char_by_id_query = 'SELECT * FROM chars WHERE id = ($1)';
var set_hp_query = 'UPDATE chars SET hp = ($1) WHERE id = ($2)';
var set_id_query = 'UPDATE last_id SET last_id = ($2) WHERE id_type = ($1)';
var get_id_query = 'SELECT * FROM last_id WHERE id_type = ($1)';
var save_world_size_query = 'INSERT INTO worlds (x, y) VALUES ($1, $2)';



function sum(a) {
    return a.reduce((x, y) => x + y, 0);
}


function get_next_nevel_req(l) {
    return l * l * 10
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


async function send_query(pool, query, args) {
    if (logging_db_queries) {
        console.log(query)
        console.log(args)
    }
    return pool.query(query, args)
}


class State {
    static Enter(pool, agent, save) {}
    static Execute(pool, agent, save) {}
    static Exit(pool, agent, save) {}
    static tag() {
        return null;
    }
}


class StateMachine {
    constructor(owner, state) {
        this.owner = owner;
        this.prev_state = null;
        this.curr_state = state;
    }

    async init(pool, save) {
        this.curr_state.Enter(pool, this.owner, save);
    }

    async update(pool, save) {
        await this.curr_state.Execute(pool, this.owner, save);
    }

    async change_state(state) {
        this.prev_state = this.state;
        await this.prev_state.Exit(pool, this.owner, save);
        this.curr_state = state;
        await this.curr_state.Enter(pool, this.owner, save);
    }
}

class BasicPopAIstate extends State {
    static async Execute(pool, agent, save) {
        let cell = agent.get_cell();
        var savings = agent.savings.get();
        var tmp = Math.max(agent.get_need('food') - agent.stash.get('food'), 0);
        await agent.clear_orders(pool);
        var estimated_food_cost = agent.get_local_market().guess_tag_cost('food', tmp);
        await agent.buy(pool, 'food', tmp, Math.min(savings, estimated_food_cost * 3));
        for (var tag of world.TAGS) {
            if (tag != 'food') {
                var tmp = Math.max(agent.get_need(tag) - agent.stash.get(tag), 0);
                if (tmp > 0) {
                    var estimated_tag_cost = agent.get_local_market().guess_tag_cost(tag, tmp);
                    var money_to_spend_on_tag = Math.min(savings, Math.max(estimated_tag_cost, Math.floor(savings * 0.1)));
                    await agent.buy(pool, tag, tmp, money_to_spend_on_tag);
                }
            }
        }
        //update desire to change work
    }

    tag() {
        return 'basic_pop_ai_state';
    }
}

class BasicEnterpriseAIstate extends State {
    static async Execute(pool, agent, save) {
        var market = agent.get_local_market();
        for (var i in agent.data.input) {
            await agent.clear_orders(pool, i, save = false);
        }
        for (var i in agent.data.output) {
            await agent.clear_orders(pool, i, save = false);
        }
        // correct prices
        var amount = agent.data.output[tag];
        var tmp_pure_income = null;
        var tdworkers = 0;
        var tdprice = {};
        tdprice[tag] = 0;
        var i = 0;
        var t_x = 0;
        var t_planned_spendings = 0;
        while (i < Math.pow(3, agent.data.output.length)) {
            var tmp = i;
            var dprice = {};
            var no_profit = false;
            for (var tag in agent.data.output) {
                dprice[tag] = (tmp % 3 - 1) // tmp acts here as trit mask
                tmp = Math.floor(tmp / 3);
                if (agent.data.price[tag] + dprice[tag] <= 0) {
                    no_profit = true
                }
            }
            if (no_profit) {
                i += 1;
                continue;
            }
            for (var dworkers = 0; dworkers <= 1; dworkers++) {
                if ((agent.size + dworkers > agent.data.max_size) || (agent.size + dworkers <= 0)) {
                    continue
                }
                var planned_workers = agent.data.size + dworkers;
                var expected_income = {};
                var planned_price = {};
                var max_income = {};
                for (var z in agent.data.output) {
                    expected_income[z] = 0;
                    planned_price[z] = agent.data.price[z] + dprice[z];
                    var total_cost_of_produced_goods = planned_workers * agent.get_production_per_worker() * planned_price[z];
                    max_income[z] = market.planned_money_to_spent[z] - market.get_total_cost_of_placed_goods_with_price_less_or_equal(z, planned_price[z], taxes = true);
                    expected_income[z] = Math.min(max_income[z], total_cost_of_goods);
                }

                var total_income = 0;
                for (var z in agent.data.output) {
                    total_income += expected_income[z];
                }
                var x = market.find_amount_of_goods_for_buying(planned_workers * agent.get_input_consumption_per_worker(), Math.floor(agent.data.savings.get() / 2), agent.data.input);
                var tmp_total_input = {};
                for (var z in agent.data.input) {
                    tmp_total_input[z] = agent.data.input[z] * x;
                }
                var input_cost = market.guess_cost(tmp_total_input);
                var salary_spendings = agent.data.size * agent.salary;
                var planned_income = total_income;
                var planned_spendings = planned_workers * agent.salary + inputs_cost;
                var planned_pure_income = planned_income - planned_spendings;
                if ((tmp_pure_income == null) || ((tmp_pure_income < planned_pure_income))) {
                    t_x = x;
                    tdprice = dprice;
                    tdworkers = dworkers;
                    tmp_pure_income = planned_pure_income;
                    t_planned_spendings = planned_spendings;
                }
            }
            i += 1;
        }
        // saving changes
        for (var tag in agent.data.output) {
            agent.price[tag] += tdprice[tag];
        }
        agent.set_size(agent.data.size + dworkers);
        //seling output with updated prices and buying input
        for (var tag in agent.data.output) {
            await agent.sell(pool, tag, agent.stash.get(tag), agent.price[tag], save = false);
        }
        for (var tag in agent.data.input) {
            await agent.buy(pool, tag, agent.data.input[tag] * t_x, market.guess_tag_cost(tag, agent.data.input[tag] * t_x) * 2, save = false);
        }
        await agent.pay_salary(pool, save = false);
        await agent.pay_profits(pool, save = false);
        await agent.save_to_db(pool, save);
    }

    tag() {
        return 'basic_enterprise_ai_state';
    }
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

class Equip {
    constructor() {
        this.data = {
            right_hand: null
        }
    }

    get_weapon_range() {
        return 1;
    }

    get_weapon_damage(m) {
        if (this.data.right_hand == null) {
            var tmp = {blunt: 3, pierce: 1, slice: 1};
        } else {
            var tmp = {blunt: 10, pierce: 1, slice: 1};
        }
        for (var i in tmp) {
            tmp[i] = Math.floor(tmp[i] * m / 10);
        }
        return tmp
    }

    get_resists() {
        return {blunt: 0, pierce: 0, slice: 0};
    }

    get_json() {
        return this.data;
    }

    load_from_json(json) {
        this.data = json;
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
        await send_query(pool, new_market_order_query, [this.id, this.typ, this.tag, this.owner_id, this.amount, this.price, this.market_id]);
        if (logging) {
            console.log('loading completed');
        }
    }

    async save_to_db(pool) {
        await send_query(pool, update_market_order_query, [this.id, this.amount]);
    }

    async delete_from_db(pool) {
        await send_query(pool, delete_market_order_query, [this.id]);
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

    async clear_agent_orders(pool, agent, tag, save = true) {
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
        for (var i of tmp) {
            await this.cancel_buy_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async get_money_on_hold(pool, agent) {
        var tmp = 0;
        for (var tag of this.world.TAGS) {
            for (var i of this.buy_orders[tag]) {
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
        var amount = order.amount * (order.price + this.taxes[order.tag]);
        await this.savings.transfer(order.owner.savings, amount);
        this.buy_orders[order.tag].delete(order_id);
        await order.owner.save_to_db(pool)
        await this.save_to_db(pool);
        await order.delete_from_db(pool);
    }

    async cancel_sell_order(pool, order_id) {
        var order = this.world.get_order(order_id);
        await this.stash.transfer(order.owner.stash, order.tag, order.amount);
        this.sell_orders[order.tag].delete(order_id);
        await order.owner.save_to_db(pool)
        await this.save_to_db(pool);
        await order.delete_from_db(pool);
    }

    check_cost(list_of_goods) {
        var cost = 0;
        for (var i of list_of_goods) {
            cost += this.check_tag_cost(i[0], i[1]);
        }
        return cost;
    }

    guess_cost(list_of_goods) {
        var cost = 0;
        for (var i of list_of_goods) {
            cost += this.guess_tag_cost(i[0], i[1])
        }
        return cost;
    }

    check_tag_cost(tag, amount) {
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

    guess_tag_cost(tag, amount) {
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
                av_price = this.get_average_tag_price(tag);
                cost += Math.floor(av_price * amount);
            } else {
                cost += this.world.HISTORY_PRICE[tag] * amount;
            }
        }
        return cost;
    }

    get_total_cost_of_placed_goods_with_price_less_or_equal(tag, x) {
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

    get_average_tag_price(pool, tag) {
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

    find_amount_of_goods_for_buying(max_amount, money, goods) {
        var l = 0;
        var r = Math.floor(max_amount + 1);
        while (l + 1 < r) {
            var m = Math.floor((l + r) / 2);
            var list_of_goods = [];
            for (var i in goods) {
                list_of_goods.push(i[0], i[1] * m);
            }
            var estimated_cost = this.guess_cost(list_of_goods);
            if (estimated_cost <= money) {
                l = m;
            } else {
                r = m;
            }
        }
        return l;
    }

    get_most_profitable_building(pool) {}

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
        await send_query(pool, update_market_query, [this.id, tmp]);
    }

    async load_to_db(pool) {
        await send_query(pool, new_market_query, [this.id, this.get_json()]);
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
        market = await this.world.get_market(pool, this.market_id);
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
        await send_query(pool, update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load_to_db(pool) {
        await send_query(pool, new_cell_query, [this.id, this.i, this.j, this.name, this.market_id, this.owner_id, this.pop_id]);
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
        this.agents = {};
        this.BASE_BATTLE_RANGE = 10;
        this.users = {};
        this.chars = {};
        this.orders = {};
        this.users_online = [];
        this.TAGS = ['food', 'clothes'];
        this.map = new Map();
        this.HISTORY_PRICE = {}
        this.HISTORY_PRICE['food'] = 10
        this.HISTORY_PRICE['clothes'] = 10
        await this.map.init(pool, this);
        this.battles = {}
        let pop = await this.create_pop(pool, 0, 0, 100, {'food': 1, 'clothes': 1}, 'pepe', 'random dudes', 100000)
        this.agents[pop.id] = pop
        this.damage_types = new Set(['blunt', 'pierce', 'slice'])
        this.base_stats = {
            pepe: {
                musculature: 10,
                breathing: 10, 
                coordination: 10, 
                vis: 10, 
                int: 10, 
                tac: 0, 
                mem: 10, 
                pow: 10, 
                tou: 10
            },
            rat: {
                musculature: 1,
                breathing: 1, 
                coordination: 1, 
                vis: 1, 
                int: 1, 
                tac: 0, 
                mem: 1, 
                pow: 1, 
                tou: 1
            }}
        this.base_resists = {
            pepe: {
                blunt: 0,
                pierce: 0,
                slice: 0
            },
            rat: {
                blunt: 0,
                pierce: 0,
                slice: 0
            }
        }
        await send_query(pool, save_world_size_query, [x, y])
    }

    async update(pool) {
        for (var i in this.agents) {
            await this.agents[i].update(pool);
        }
        for (var i in this.chars) {
            await this.chars[i].update(pool);
        }
        update_market_info(this.map.cells[0][0])
    }

    get_cell(x, y) {
        return this.map.get_cell(x, y);
    }

    get_cell_by_id(id) {
        return this.map.get_cell_by_id(id);
    }

    get_cell_id_by_x_y(x, y) {
        return x * this.y + y
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
        var x = await send_query(pool, get_id_query, [str]);
        x = x.rows[0];
        // console.log(x);
        x = x.last_id;
        x += 1;
        await send_query(pool, set_id_query, [str, x]);
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
        if (character.data.is_player) {
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

    async create_pop(pool, x, y, size, needs, race_tag, name, savings) {
        let pop = new Pop();
        let cell_id = this.get_cell_id_by_x_y(x, y)
        await pop.init(pool, this, cell_id, size, needs, race_tag, name)
        await pop.savings.inc(savings)
        await pop.save_to_db(pool)
        return pop
    }

    async create_battle(pool, attackers, defenders) {
        var battle = new Battle();
        var ids = [];
        var teams = [];
        for (var i = 0; i < attackers.length; i++) {
            ids.push(attackers[i].id);
            await attackers[i].set(pool, 'in_battle', true);
            teams.push(0);
        }
        for (var i = 0; i < defenders.length; i++) {
            ids.push(defenders[i].id);
            await defenders[i].set(pool, 'in_battle', true);
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
        var res = await send_query(pool, find_user_by_login_query, [login]);
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
        var res = await send_query(pool, select_char_by_id_query, [char_id]);
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
        var res = await send_query(pool, find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }

    get_tick_death_rate(race) {
        return 0.001
    }

    get_tick_max_growth(race) {
        return 0.001
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
                if (character.data.is_player) {
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
            await character.set(pool, 'in_battle', false);
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
        await send_query(pool, new_battle_query, [this.id, this.ids, this.teams, this.positions]);
    }

    async save_to_db(pool) {
        await send_query(pool, update_battle_query, [this.id, this.ids, this.teams, this.positions])
    }

    async delete_from_db(pool) {
        await send_query(pool, delete_battle_query, [this.id]);
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
        var id = await world.get_new_id(pool, 'agent_id');
        this.init_base_values(world, id, cell_id, name);
        await this.load_to_db(pool);
    }

    async update(pool, save = true) {
        this.savings.update();
        await this.save_to_db(pool, save);
    }

    async load_to_db(pool) {
        await send_query(pool, insert_agent_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json()]);
    }

    async save_to_db(pool, save = true) {
        if (!this.save) {
            return
        }
        await send_query(pool, update_agent_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json()]);
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

    async transfer(pool, target, tag, x, save = true, save_target = true) {
        this.stash.transfer(target.stash, tag, x);
        await target.save_to_db(pool, save_target);
        await this.save_to_db(pool, save);
    }

    async transfer_all(pool, target, save = true, save_target = true) {
        for (var tag of this.world.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, target, tag, x, save = false, save_target = false);
        }
        await this.save_to_db(pool, save);
        await target.save_to_db(pool, save_target)
    }

    async buy(pool, tag, amount, money, max_price = null) {
        await this.get_local_market().buy(pool, tag, this, amount, money, max_price);
    }

    async sell(pool, tag, amount, price) {
        await this.get_local_market().sell(pool, tag, this, amount, price);
    }

    async clear_tag_orders(pool, tag, save_market = true) {
        await this.get_local_market().clear_agent_orders(pool, this, tag, save_market)
    }

    async clear_orders(pool, save_market = true) {
        for (var tag of this.world.TAGS) {
            await this.clear_tag_orders(pool, tag, save_market)
        }
    }

    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        return cell.market;
    }

    get_name() {
        return this.name;
    }

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id)
    }
}


class Consumer extends Agent {
    init_base_values(world, id, cell_id, data, name = null) {
        super.init_base_values(world, id, cell_id, name);
        this.data = data;
    }

    update_name() {
        if (this.name == null) {
            this.name = 'consumer ' + this.id;
        }
    }

    get_need(tag) {
        return this.data.needs[tag] * this.data.size
    }

    async init(pool, world, cell_id, data, name = null) {
        var id = await world.get_new_id('consumer');
        this.init_base_values(world, id, cell_id, data, null);
        await this.load_to_db(pool);
    }

    async update(pool, save = true) {
        await super.update(pool, false);
        await this.consume_update(pool, false);
        await this.save_to_db(pool, save);
    }

    async set_size(pool, x, save = true) {
        if (this.data.size.max != null) {
            this.data.size.current = Math.min(x, this.data.size.max);
        } else {
            this.data.size.current = x;
        }
        await this.save_to_db(pool, save);
    }

    async set_max_size(pool, x, save = true) {
        this.data.size.max = x;
        await this.save_to_db(pool, save);
    }

    async transfer_size(pool, target, x, save = true, target_save = true) {
        var tmp = Math.min(x, this.data.size.current);
        this.data.size.current -= tmp;
        target.data.size.current += tmp;
        await this.save_to_db(pool, save)
        await target.save_to_db(pool, target_save)
    }

    async consume_update(pool, save = true) {
        for (var i in this.data.needs) {
            this.consume(pool, i, false);
        }
        await this.save_to_db(pool, save);
    }

    async consume(pool, tag, save = true) {
        this.stash.inc(tag, -this.get_need(tag));
        await this.save_to_db(pool, save);
    }

    async load_to_db(pool) {
        await send_query(pool, insert_consumer_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data]);
    }

    async save_to_db(pool) {
        if (!this.save) {
            return
        }
        await send_query(pool, update_consumer_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data]);
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
    init_base_values(world, id, cell_id, data, race_tag, name = null, AIstate = {state: BasicPopAIstate, tag: 'basic_pop_ai_state'}) {
        super.init_base_values(world, id, cell_id, data, name);
        this.AI = new StateMachine(this, AIstate.state);
        this.race_tag = race_tag;
        this.data.growth_mod = 0;
        this.data.death_mod = 0;
    }

    async init(pool, world, cell_id, size, needs, race_tag, name = null, AIstate = {state: BasicPopAIstate, tag: 'basic_pop_ai_state'}) {
        var id = await world.get_new_id(pool, 'agent_id');
        this.init_base_values(world, id, cell_id, {'size': size, 'needs': needs}, race_tag, name, AIstate);
        await this.load_to_db(pool);
    }

    async update(pool, growth_flag = false, save = true) {
        if (this.data.size.current == 0) {
            return
        }
        super.update(pool, false);
        this.data.death_mod += world.get_tick_death_rate(this.race_tag);
        if (growth_flag) {
            this.growth_update(pool, false);
            this.data.growth_mod = 0;
            this.data.death_mod = 0;
        }
        await this.AI.update(pool, false);
        await this.motions_update(pool, false, true);
        await this.save_to_db(pool, save);
    }

    async set_max_size(pool, x, save = true) {
        this.data.size.max = x;
        await this.save_to_db(pool, save);
    }

    async consume(pool, tag, save = true) {
        if (this.data.size.current == 0) {
            return;
        }
        var total_need = Math.floor(this.data.needs[tag] * this.data.size.current);
        var in_stash = Math.min(this.stash.get(tag), total_need);
        if (total_need == 0) {
            return;
        }
        if (tag == 'food') {
            this.data.growth_mod += (2 * in_stash / total_need - 1) * this.world.get_tick_max_growth(this.race_tag);
        }
        await super.consume(pool, tag, false);
        await this.save_to_db(pool, save);
    }

    async growth_update(pool, save) {
        var size = this.data.size.current
        var growth = Math.floor(this.data.size.current * (1 + this.data.growth_mod));
        this.data.size.current = Math.floor(this.data.size.current * (1 - this.data.death_mod))
        await this.save_to_db(pool, save);
    }

    async motions_update(pool, save = true, save_target = true) {
        return;
    }

    async load_to_db(pool) {
        await send_query(pool, insert_pop_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.race_tag, this.AI.curr_state.tag()]);
    }

    async save_to_db(pool, save = true) {
        await send_query(pool, update_pop_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.race_tag, this.AI.curr_state.tag()]);
    }

    async load_from_json(pool, world, data) {
        super.load_from_json(pool, world, data);
        this.race_tag = data.race_tag;
        this.ai = world.get_ai(data.ai_tag);
    }
}


class Profession {
    async init(pool, world, tag, edges) {
        this.world = world;
        this.tag = tag;
        this.edges = edges;
        this.agents_ids = Set();
        this.enterprises_ids = Set();
    }

    get_total_size() {
        var size = 0;
        for (a of this.agents_ids) {
            size += this.world.agents[a].size;
        }
        return size;
    }

    get_job_places() {
        let tmp = 0
        for (a of this.enterprises_ids) {
            tmp += this.world.agents[a].size;
        }
        return tmp
    }    

    is_full() {
        if (this.get_total_size() >= this.get_job_places()) {
            return true
        }
        return false
    }

    get_average_savings() {
        var total_savings = 0;
        var total_size = 0;
        for (var agent_id of this.agents_ids) {
            var agent = this.world.agents[agent_id];
            total_savings += agent.get_true_savings();
            total_size += agent.data.size;
        }
        if (total_size == 0) {
            return 1000;
        }
        return Math.floor(total_savings / sotal_size);
    }
}

class ProfessionGraph {
    async init(pool, world, professions) {
        this.world = world;
        this.professions = professions;
    }

    get_total_size() {
        var size = 0;
        for (var prof of this.professions) {
            size += prof.get_total_size();
        }
        return size;
    }

    async update(pool) {
        for (var i of this.professions) {
            await i.update(pool);
        }

        for (var i of this.professions) {
            for (var k of i.edges) {
                var j = this.professions[k];
                await this.push(pool, i, j);
            }
        }
    }

    async push(pool, i, j) {
        // if i pops have more savings that j then there is no point in changing prof from i to j
        if ((j.get_average_savings() <= i.get_average_savings()) || (j.is_full)) {
            return;
        }
        actions = [];
        //iterate over i agents
        for (var agent_id of i.agents_ids) {
            let agent = this.world.agents[agent_id];
            if (agent.data.size == 0) {
                continue;
            }
            //iterate over j enterprises
            if (agent.is_pop) {
                target = -1
                max_s = 0
                for (var enterprise_id of j.enterprises_ids) {
                    let enterprise = this.world.agents[enterprise_id];
                    if (enterprise.is_full()) {
                        continue;
                    }
                    if (enterprise.get_active_workers() < enterprise.data.size) {
                        for (var z of enterprise.workers_ids) {
                            var agent2 = this.world.agents[z];
                            if (agent2.is_pop() && agent2.race_tag == agent.race_tag && max_s < agent2.get_savings_per_capita()) {
                                target = agent2
                                max_s = agent2.get_savings_per_capita()
                            }
                        }
                    }
                }
                if (target != -1) {
                    agent.transfer_size(target, 1)
                }
            }
        }
    }
}

class Enterprise extends Consumer {
    init_base_values(world, id, cell_id, data, name = null, AIstate = {state: BasicEnterpriseAIstate, tag: 'basic_enterprise_ai_state'}) {
        super.init_base_values(world, id, data, needs, name)
        this.AI = StateMachine(AIstate);
        this.prices = world.create_zero_prices_list();
    }

    async init(pool, world, cell_id, data, name = null, AIstate = {state: BasicEnterpriseAIstate, tag: 'basic_enterprise_ai_state'}) {
        var id = await world.get_new_id('agent_id');
        this.init_base_values(world, id, cell_id, data, name, AIstate);
        this.load_to_db(pool);
    }

    // async add_worker(pool, worker, save = true) {
    //     this.data.workers.push({id: worker.id, type: worker.get_type()});
    //     this.save_to_db(pool, save);
    // }

    async update(pool, save = true) {
        await this.update_workers_count(pool);
        await super.update(pool, false);
        await this.AI.update(pool, false);
        await this.production_update(pool, false);
        await this.save_to_db(pool, save);
    }

    async production_update(pool, save = true) {
        var production_amount = this.get_production_amount();
        for (var i in this.data.input) {
            if (this.data.input[i] != 0) {
                production_amount = Math.min(production_amount, this.stash.get(i) / (this.data.input[i] * this.get_input_eff()));
            }
        }
        for (var i in this.data.input) {
            this.stash.inc(i, Math.floor(production_amount * this.data.input[i] * this.get_input_eff()));
        }
        for (var i in this.data.output) {
            this.stash.inc(i, Math.floor(production_amount * this.data.output[i] * this.get_output_eff()));
        }
        await this.save_to_db(pool, save);
    }

    // async pay_salary(pool, save = true, save_target = true) {
    //     for (var worker_id of this.data.workers_ids) {
    //         worker = world.agents[worker_id];
    //         this.savings.transfer(worker.savings, worker.data.size * this.data.salary);
    //         await worker.save_to_db(pool, save_targets);
    //     }
    //     await.this.save_to_db(pool, save);
    // }

    async pay_salary(pool, save = true, save_target = true) {
        var g = this.cell.get_job_graph();
        prof = h.get_profession(this.data.profession)
        for (data of prof.enterprise_to_worker[this.id]) {
            worker = world.agents[worker_id]
            this.savings.transfer(worker.savings, )
        }
    }

    async pay_profits(pool, save = true, save_targets = true) {
        var inf = this.get_total_influence();
        var payment = Math.floor(this.savings.get() * 0.01);
        for (var owner_info of this.data.owners) {
            owner = world.agents[owner_info.id];
            this.savings.transfer(owner.savings, Math.floor(payment * owner_info.influence / inf));
            await owner.save_to_db(pool, save_targets);
        }
        await this.save_to_db(pool, save);
    }

    get_total_influence() {
        return this.get_active_workers();
    }

    get_output_eff() {
        return this.data.output_eff;
    }

    get_input_eff() {
        return this.data.input_eff;
    }

    get_production_amount() {
        return this.get_active_workers * this.data.throughput;
    }

    get_active_workers() {
        var x = 0;
        for (var worker_id of this.data.workers_ids) {
            var worker = this.world.get_agent(worker_id);
            x += worker.size;
        }
        return x;
    }

    get_production_per_worker() {
        return (1 / this.get_input_eff) * this.data.throughput * this.get_output_eff();
    }

    async load_to_db(pool) {
        await send_query(pool, insert_enterprise_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.AI.curr_state.tag()]);
    }

    async save_to_db(pool, save = true) {
        await send_query(pool, update_enterprise_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.AI.curr_state.tag()]);
    }

    async load_from_json(pool, world, data) {
        super.load_from_json(pool, world, data);
    }
}

class Character {
    init_base_values(world, id, name, hp, max_hp, exp, level, cell_id, user_id = -1) {
        this.world = world;
        this.name = name;
        if (user_id == -1) {
            var is_player = false;
        } else {
            var is_player = true;
        }
        this.hp = hp;
        this.max_hp = max_hp;
        this.id = id;
        this.equip = new Equip();
        this.equip.data.right_hand = 'fist';
        this.stash = new Stash();
        this.savings = new Savings();
        this.user_id = user_id;
        this.cell_id = cell_id;
        this.data = {
            stats: this.world.base_stats.pepe,
            base_resists: this.world.base_resists.pepe,
            is_player: is_player,
            exp: exp,
            level: level,
            skill_points: 0,
            exp_reward: 5,
            dead: false,
            in_battle: false,
            status: {
                stunned: 0
            },
            skills: {},
            other: {
                rage: 0,
                blood_covering: 0
            }
        }
    }

    async init(pool, world, name, cell_id, user_id = -1) {
        var id = await world.get_new_id(pool, 'char_id');
        this.init_base_values(world, id, name, 100, 100, 0, 0, cell_id, user_id);
        await this.load_to_db(pool);
        return id;
    }

    async update(pool) {
        await this.change_hp(pool, 1, false);
        await this.update_status(pool, false);
        await this.save_to_db(pool)
        if (this.data.is_player) {
            var socket = this.world.users[this.user_id].socket;
        } else {
            var socket = null;
        }
        if (socket != null) {
            socket.emit('char-info', this.get_json());
        }
    }

    get_exp_reward() {
        return this.data.exp_reward;
    }

    get_range() {
        return this.equip.get_weapon_range();
    }

    async set(pool, nani, value) {
        this.data.nani = value
        await this.save_to_db(pool)
    }

    async attack(pool, target) {
        var damage = this.equip.get_weapon_damage(this.data.stats.musculature);
        let total_damage = await target.take_damage(pool, damage);
        return total_damage;
    }

    get_resists() {
        let res = this.data.base_resists;
        let res_e = this.equip.get_resists();
        for (let i of this.world.damage_types) {
            res[i] += res_e[i];
        }
        return res
    }

    async stun(pool) {
        this.data.status.stunned = 2
    }

    async update_status() {
        for (let i of Object.keys(this.data.status)) {
            let x = this.data.status[i];
            this.data.status[i] = Math.max(x - 1, 0);
        }
    }

    async update_status_after_damage(pool, type, x) {
        if (type == 'blunt') {
            if (x > 5) {
                let d = Math.random();
                if (d > 0.5) {
                    await this.stun(pool)
                }
            }
        }
    }

    async take_damage(pool, damage) {
        let res = this.get_resists();
        let total_damage = 0;
        for (let i of this.world.damage_types) {
            let curr_damage = Math.max(1, damage[i] - res[i]);
            total_damage += curr_damage;
            this.update_status_after_damage(pool, i, curr_damage, false);
            await this.change_hp(pool, -curr_damage, false);
        }
        this.data.other.blood_covering = Math.min(this.data.other.blood_covering + 10, 100)
        this.data.other.rage = Math.min(this.data.other.blood_covering + 10, 100)
        await this.save_hp_to_db(pool)
        return total_damage;
    }

    async change_hp(pool, x, save = true) {
        this.hp += x;
        if (this.hp > this.max_hp) {
            this.hp = this.max_hp;
        }
        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this);
        }
        await this.save_hp_to_db(pool, save);
    }

    async save_hp_to_db(pool, save = true) {
        if (save) {
            await send_query(pool, set_hp_query, [this.hp, this.id]);
        }
    }

    async give_exp(pool, x, save = true) {
        await this.set_exp(pool, this.data.exp + x, save);
    }

    async set_exp(pool, x, save = true) {
        this.data.exp = x;
        if (this.data.exp >= get_next_nevel_req(this.data.level)) {
            await this.level_up(pool, false);
        }
        if (save) {
            await this.save_to_db(pool);
        }
    }

    async level_up(pool, save) {
        while (this.data.exp >= get_next_nevel_req(this.data.level)) {
            this.data.exp -= get_next_nevel_req(this.data.level);
            this.data.level += 1;
            this.data.skill_points += 1;
        }
        if (save) {
            await this.save_to_db(pool);
        }
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
        this.user_id = data.user_id;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
        this.cell_id = data.cell_id;
        this.equip = new Equip();
        this.equip.load_from_json(data.equip)
        this.data = data.data
    }

    get_json() {
        return {
            name: this.name,
            hp: this.hp,
            max_hp: this.max_hp,
            savings: this.savings.get_json(),
            stash: this.stash.get_json(),
            equip: this.equip.get_json(),
            data: this.data
        };
    }

    async load_to_db(pool) {
        // console.log(pool);
        await send_query(pool, new_char_query, [this.id, this.user_id, this.cell_id, this.name, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
    }

    async save_to_db(pool) {
        await send_query(pool, update_char_query, [this.id, this.cell_id, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
    }

    async delete_from_db(pool) {
        await send_query(pool, delete_char_query, [this.id]);
    }
}


class Rat extends Character {
    async init(pool, world, cell_id, name = null) {
        var id = await world.get_new_id(pool, 'char_id');
        if (name == null) {
            name = 'rat ' + id;
        }
        this.init_base_values(world, id, name, 10, 10, 0, 0, cell_id);
        this.data.stats = this.world.base_stats.rat
        this.data.base_resists = this.world.base_resists.rat
        this.equip.data.right_hand = 'bite'
        this.stash.inc('food', 1);
        await this.load_to_db(pool);
        return id;
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
        await send_query(pool, new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }

    async save_to_db(pool) {
        await send_query(pool, update_user_query, [this.char_id]);
    }
}


var world = new World();


async function drop_tables(client, tables) {
    for (let i = 0; i < tables.length; i++) {
        await client.query('DROP TABLE IF EXISTS ' + tables[i]);
    }
}


async function init_ids(client) {
    var id_types = ['battle_id', 'user_id', 'char_id', 'market_order_id', 'market_id', 'cell_id', 'agent_id'];
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

function update_market_info(cell) {
    var data = cell.market.get_orders_list();
    if (logging) {
        console.log('sending market orders to client');
        console.log(data);
    }
    io.emit('market-data', data);
}

function send_message(socket, msg, user) {
    if (msg.length > 1000) {
        socket.emit('new-message', 'message-too-long')
        return
    }
    // msg = validator.escape(msg)

    var message = {id: MESSAGE_ID, msg: msg, user: 'аноньчик'};
    if (user != null) {
        message.user = user.login;
    }
    MESSAGES.push(message);
    if (MESSAGES.length > 50) {
        MESSAGES.shift()
    }
    io.emit('new-message', message)
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
    for (var i of MESSAGES) {
        socket.emit('new-message', i);
    }

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
            update_char_info(socket, current_user);
        }
    });

    socket.on('new-message', async msg => {
        send_message(socket, msg + '', current_user)
    });
});

http.listen(port, () => {
    console.log('listening on *:3000');
});


(async () => {
    try {
        var client = await pool.connect();
        let tables = ['accounts', 'chars', 'last_id', 'last_id', 'battles', 'worlds', 'markets', 'cells', 'market_orders', 'agents', 'consumers', 'pops', 'enterprises']
        await drop_tables(client, tables)
        await client.query('CREATE TABLE accounts (login varchar(200), password_hash varchar(200), id int PRIMARY KEY, char_id int)');
        await client.query('CREATE TABLE chars (id int PRIMARY KEY, user_id int, cell_id int, name varchar(200), hp int, max_hp int, savings jsonb, stash jsonb, equip jsonb, data jsonb)');
        await client.query('CREATE TABLE last_id (id_type varchar(30), last_id int)');
        await client.query('CREATE TABLE battles (id int PRIMARY KEY, ids int[], teams int[], positions int[])');
        await client.query('CREATE TABLE worlds (x int, y int)');
        await client.query('CREATE TABLE markets (id int PRIMARY KEY, data jsonb)');
        await client.query('CREATE TABLE cells (id int PRIMARY KEY, x int, y int, name varchar(30), market_id int, owner_id int, pop_id int)');
        await client.query('CREATE TABLE market_orders (id int PRIMARY KEY, typ varchar(5), tag varchar(30), owner_id int, amount int, price int, market_id int)');
        await client.query('CREATE TABLE agents (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb)')
        await client.query('CREATE TABLE consumers (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb)')
        await client.query('CREATE TABLE pops (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb, race_tag varchar(50), ai_tag varchar(50))')
        await client.query('CREATE TABLE enterprises (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb, ai_tag varchar(50))')
        await init_ids(client);
        await client.end();
        await world.init(pool, 1, 1);
        var rat_trader = await world.create_monster(pool, Rat, 0);
        rat_trader.savings.inc(1000);
        await rat_trader.buy(pool, 'food', 1000, 1000);

        console.log('database is ready');
        gameloop.setGameLoop(async delta => await world.update(pool), 2000);
    } catch (e) {
        console.log(e);
    }
})();
// setInterval(async () => await world.update(pool), 2000);
