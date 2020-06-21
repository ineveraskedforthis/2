var Savings = require("./savings.js");
var Stash = require("./stash.js");
var MarketOrder = require("./market_order")
var common = require("./common.js");
const constants = require("./constants.js");

// remember to check how taxes are working (spoiler: wrong)
module.exports = class Market {
    constructor(world, owner) {
        this.owner = owner;
        this.owner_tag = owner.tag;
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
    }

    async init(pool) {
        this.id = await this.world.get_new_id(pool, 'market_id');
        for (var tag of this.world.constants.TAGS) {
            this.taxes[tag] = 0;
            this.planned_money_to_spent[tag] = 0;
            this.total_cost_of_placed_goods[tag] = 0;
            this.tmp_planned_money_to_spent[tag] = 0;
            this.tmp_total_cost_of_placed_goods[tag] = 0;
            this.sell_orders[tag] = new Set([]);
            this.buy_orders[tag] = new Set([]);
            this.max_price[tag] = 0;
            this.total_sold[tag] = new Array(10);
            this.total_sold[tag].fill(0);
            this.total_sold_cost[tag] = new Array(10);
            this.total_sold_cost[tag].fill(0);
            this.total_sold_new[tag] = 0;
            this.total_sold_cost_new[tag] = 0;
            this.sells[tag] = [];
            this.tmp_sells[tag] = [];
        }
        await this.load_to_db(pool);
        return this.id
    }

    async load(pool, id) {
        this.id = id
        let tmp = await common.send_query(pool, constants.select_market_by_id_query, [this.id]);
        tmp = tmp.rows[0];
        this.load_from_json(tmp.data)
    }

    async update(pool) {
        for (var tag of this.world.constants.TAGS) {
            this.planned_money_to_spent[tag] = this.tmp_planned_money_to_spent[tag];
            this.tmp_planned_money_to_spent[tag] = 0;
            this.total_cost_of_placed_goods[tag] = this.tmp_total_cost_of_placed_goods[tag];
            this.tmp_total_cost_of_placed_goods[tag] = 0;
            // console.log(this.total_sold[tag]);
            this.total_sold[tag] = this.total_sold[tag].slice(1);
            this.total_sold[tag].push(this.total_sold_new[tag]);
            this.total_sold_new[tag] = 0;
            this.total_sold_cost[tag] = this.total_sold_cost[tag].slice(1)
            this.total_sold_cost[tag].push(this.total_sold_cost_new[tag]);
            this.total_sold_cost_new[tag] = 0;
            this.sells[tag] = this.tmp_sells[tag];
        }
        await this.save_to_db(pool);
    }

    async set_taxes(pool, tag, x) {
        this.taxes[tag] = x;
        await this.save_to_db(pool);
    }

    async buy(pool, tag, buyer, amount, money, max_price = undefined, save = true) {
        common.flag_log('market buy' + [tag, buyer.name, amount, money], constants.logging.market_order.buy);
        if (buyer.savings.get() < money) {
            money = buyer.savings.get(pool);
        }
        this.tmp_planned_money_to_spent[tag] += money;
        var tmp = [];
        for (let i of this.sell_orders[tag]) {
            tmp.push(this.world.get_order(i));
        }
        tmp.sort((a, b) => (a.price - b.price));
        var i = 0;
        var j = 0;
        var total_spendings = 0;
        // var y = money;
        while ((i < tmp.length) && (amount > 0) && ((max_price == undefined) || (tmp[i].price <= max_price))) {
            var tmp_amount = 0;
            while ((i < tmp.length) && (tmp[i].price == tmp[j].price)) {
                tmp_amount += tmp[i].amount;
                i += 1;
            }
            if ((money - total_spendings) < (amount * (tmp[j].price + this.taxes[tag]))) {
                amount = Math.floor((money - total_spendings) / (tmp[j].price + this.taxes[tag]));
            }
            if (tmp_amount <= amount) {
                for (let k = j; k < i; k++) {
                    total_spendings += await this.execute_sell_order(pool, tmp[k], tmp[k].amount, buyer);
                }
                amount -= tmp_amount;
            } else {
                var u_amount = amount;
                for (let k = j; k < i; k++) {
                    let memelord = Math.floor((tmp[k].amount / tmp_amount) * u_amount);
                    amount -= memelord;
                    total_spendings += await this.execute_sell_order(pool, tmp[k], memelord, buyer);
                }
                for (let k = j; k < i; k++) {
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
        await this.clear_empty_sell_orders(pool, tag);
        await this.save_to_db(pool, save);
        return total_spendings;
    }

    async sell(pool, tag, seller, amount, price) {
        common.flag_log('market sell' + [tag, seller.name, amount, price], constants.logging.market.sell);
        if (amount > seller.stash.get(tag)) {
            amount = seller.stash.get(tag);
        }
        this.tmp_total_cost_of_placed_goods[tag] += amount * price;
        var tmp = [];
        for (let i of this.buy_orders[tag]) {
            tmp.push(this.world.get_order(i));
        }
        tmp.sort((a, b) => (b.price - a.price));
        common.flag_log('buy orders', constants.logging.market.sell);
        common.flag_log(tmp, constants.logging.market.sell);
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
                let u_amount = amount;
                for (let k = j; k < i; k++) {
                    let memelord = Math.floor((tmp[k].amount / tmp_amount) * u_amount);
                    amount -= memelord;
                    await this.execute_buy_order(pool, tmp[k], memelord, seller);
                }
                for (let k = j; k < i; k++) {
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
        amount = Math.floor(amount);
        price = Math.floor(price);
        if (typ == 'SELL') {
            var tmp = agent.stash.transfer(this.stash, tag, amount);
            var order = new MarketOrder(this.world);
            var order_id = await order.init(pool, typ, tag, agent, tmp, price, this.id);
            this.sell_orders[tag].add(order_id);
            await this.world.add_order(pool, order);
        }
        if (typ == 'BUY') {
            if (price != 0) {
                let savings = agent.savings.get();
                let true_amount = Math.min(amount, Math.floor(savings / price));
                agent.savings.transfer(this.savings, true_amount * price);
                let order = new MarketOrder(this.world);
                let order_id = await order.init(pool, typ, tag, agent, true_amount, price, this.id);
                this.buy_orders[tag].add(order_id);
                await this.world.add_order(pool, order);
            } else {
                let order = new MarketOrder();
                let order_id = await order.init(pool, typ, tag, agent, amount, price, this.id);
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
        // this.savings.transfer(this.owner.savings, amount * this.taxes[order.tag]);
        seller.stash.transfer(order.owner.stash, order.tag, amount);
        order.owner.savings_changed = true;
        seller.savings_changed = true;
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
        order.owner.savings_changed = true;
        buyer.savings_changed = true;
        // buyer.savings.transfer(this.owner.savings, amount * this.taxes[order.tag]);
        this.total_sold_new[order.tag] += amount;
        this.total_sold_cost_new[order.tag] += amount * order.price;
        await this.save_to_db(pool);
        await buyer.save_to_db(pool);
        await order.owner.save_to_db(pool);
        return amount * (order.price + this.taxes[order.tag]);
    }

    async clear_empty_sell_orders(pool, tag) {
        var tmp = new Set();
        for (let i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (let i of tmp) {
            await this.cancel_sell_order(pool, i);
        }
        await this.save_to_db(pool);
    }

    async clear_empty_buy_orders(pool, tag, save) {
        var tmp = new Set();
        for (let i of this.buy_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.amount == 0) {
                tmp.add(i);
            }
        }
        for (let i of tmp) {
            await this.cancel_buy_order(pool, i, save);
        }
        await this.save_to_db(pool, save);
    }

    async clear_agent_orders(pool, agent, tag, save) {
        this.clear_agent_buy_orders(pool, agent, tag, save, false);
        this.clear_agent_sell_orders(pool, agent, tag, save, false);
        this.save_to_db(pool, save)
    }

    async clear_agent_sell_orders(pool, agent, tag, save, save_market) {
        var tmp = new Set();
        for (let i of this.sell_orders[tag]) {
            let order = this.world.get_order(i);
            if (order.owner == agent) {
                tmp.add(i);
            }
        }
        for (let i of tmp) {
            this.cancel_sell_order(pool, i, save);
        }
        await this.save_to_db(pool, save_market);
    }

    async clear_agent_buy_orders(pool, agent, tag, save, save_market) {
        var tmp = new Set();
        for (let i of this.buy_orders[tag]) {
            let order = this.world.get_order(i);
            if (order.owner == agent) {
                tmp.add(i);
            }
        }
        for (let i of tmp) {
            await this.cancel_buy_order(pool, i, save);
        }
        await this.save_to_db(pool, save_market);
    }

    async get_money_on_hold(pool, agent) {
        let tmp = 0;
        for (let tag of this.world.constants.TAGS) {
            for (let i of this.buy_orders[tag]) {
                let order = this.world.get_order(i);
                if (order.owner == agent) {
                    tmp += i.amount * (i.price + this.taxes[order.tag]);
                }
            }
        }
        return tmp;
    }

    async cancel_buy_order(pool, order_id, save) {
        var order = this.world.get_order(order_id);
        var amount = order.amount * (order.price + this.taxes[order.tag]);
        this.savings.transfer(order.owner.savings, amount);
        this.buy_orders[order.tag].delete(order_id);
        await order.owner.save_to_db(pool, save)
        await this.save_to_db(pool, save);
        await order.delete_from_db(pool, save);
    }

    async cancel_sell_order(pool, order_id, save) {
        var order = this.world.get_order(order_id);
        this.stash.transfer(order.owner.stash, order.tag, order.amount);
        this.sell_orders[order.tag].delete(order_id);
        await order.owner.save_to_db(pool, save)
        await this.save_to_db(pool, save);
        await order.delete_from_db(pool, save);
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
        var cost = 0;
        for (let i of tmp) {
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
        for (let i of this.sell_orders[tag]) {
            let order = this.world.get_order(i);
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var cost = 0;
        for (let i of tmp) {
            if (i.amount <= amount) {
                cost += i.amount * (i.price + this.taxes[tag]);
                amount -= i.amount;
            } else if (amount > 0) {
                cost += amount * (i.price + this.taxes[tag]);
                amount = 0;
            }
        }
        if (amount > 0) {
            if (common.sum(this.total_sold[tag]) != 0) {
                var av_price = this.get_average_tag_price(tag);
                cost += Math.floor(av_price * amount);
            } else {
                cost += this.world.HISTORY_PRICE[tag] * amount;
            }
        }
        return cost;
    }

    get_total_cost_of_placed_goods_with_price_less_or_equal(tag, x) {
        var cost = 0;
        for (let i of this.tmp_sells[tag]) {
            if (i[1] <= x) {
                cost += i[0] * i[1];
            }
        }
        for (let i of this.sell_orders[tag]) {
            var order = this.world.get_order(i);
            if (order.price <= x) {
                cost += i.amount * i.price;
            }
        }
        return cost;
    }

    get_average_tag_price(pool, tag) {
        var total_count = common.sum(this.total_sold[tag]) + this.total_sold_new[tag];
        var total_cost = common.sum(this.total_sold_cost[tag]) + this.total_sold_cost_new[tag];
        for (let i of this.sell_orders[tag]) {
            let order = this.world.get_order(i);
            total_count += order.amount;
            total_cost += order.amount * (order.price + this.taxes[tag]);
        }
        for (let i of this.buy_orders[tag]) {
            let order = this.world.get_order(i);
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

    // get_most_profitable_building(pool) {}

    get_orders_list() {
        var tmp = [];
        for (var tag of this.world.constants.TAGS) {
            for (let i of this.buy_orders[tag]) {
                let order = this.world.get_order(i);
                tmp.push(order.get_json());
            }
            for (let i of this.sell_orders[tag]) {
                let order = this.world.get_order(i);
                tmp.push(order.get_json());
            }
        }
        return tmp;
    }

    async save_to_db(pool) {
        var tmp = this.get_json();
        await common.send_query(pool, constants.update_market_query, [this.id, tmp]);
        // console.log(tmp.buy_orders);
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_market_query, [this.id, this.get_json()]);
    }

    get_json() {
        var tmp = {};
        tmp.id = this.id;
        tmp.owner = this.owner.id;
        tmp.owner_tag = this.owner_tag;
        tmp.savings = this.savings.get_json();
        tmp.stash = this.stash.get_json();
        tmp.buy_orders = {}
        tmp.sell_orders = {}

        for (let tag of this.world.constants.TAGS) {
            tmp.buy_orders[tag] = Array.from(this.buy_orders[tag].values())
            tmp.sell_orders[tag] = Array.from(this.sell_orders[tag].values())
        }

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

    load_from_json(data) {
        this.owner = this.world.get_from_id_tag(data.owner, data.owner_tag);
        this.owner_tag = data.owner_tag;
        this.savings.load_from_json(data.savings);
        this.stash.load_from_json(data.stash);
        
        this.planned_money_to_spent = data.planned_money_to_spent;
        this.tmp_planned_money_to_spent = data.planned_money_to_spent;
        this.total_cost_of_placed_goods = data.total_cost_of_placed_goods;
        this.tmp_total_cost_of_placed_goods = data.tmp_total_cost_of_placed_goods;
        this.max_price = data.max_price;
        this.total_sold = data.total_sold;
        this.total_sold_cost = data.total_sold_cost;
        this.total_sold_new = data.total_sold_new;
        this.total_sold_cost_new = data.total_sold_cost_new;
        this.sells = data.sells;
        this.tmp_sells = data.tmp_sells;
        this.taxes = data.taxes;
        for (let tag of this.world.constants.TAGS) {
            this.buy_orders[tag] = new Set(data.buy_orders[tag])
            this.sell_orders[tag] = new Set(data.sell_orders[tag])
        }
    }
}