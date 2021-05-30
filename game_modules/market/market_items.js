const common = require("../common.js");
const {constants} = require("../static_data/constants.js");
const hour = 1000 * 60 * 60;
const time_intervals = [1000 * 60, hour * 12, hour * 24, hour * 48];

class MarketItems {
    constructor(world, cell_id) {
        this.world = world;
        this.orders = new Set();
        this.CHANGED = false;
        this.cell_id = cell_id
    }

    async init(pool) {
        this.id = this.load_to_db(pool);
        return this.id;
    }

    async sell(pool, seller, index, buyout_price, starting_price) {
        let item = seller.equip.data.backpack[index]
        if (item == undefined) {
            return 
        }
        seller.equip.data.backpack[index] = undefined;
        await seller.save_to_db(pool);
        await this.new_order(pool, seller, item, buyout_price, starting_price, 1);
    }

    async new_order(pool, seller, item, buyout_price, starting_price, time_interval) {
        let order = new OrderItem(this.world);
        let time = Date.now();
        let dt = time_intervals[time_interval];
        let id = await order.init(pool, seller, item, buyout_price, starting_price, time + dt)
        this.orders.add(id)
        this.world.add_item_order(order);
        this.CHANGED = true
    }

    async buyout(pool, buyer, id) {
        if (!(this.orders.has(id))) {
            return
        }
        let order = this.world.get_item_order(id);
        if (buyer.savings.get() < order.buyout_price) {
            return
        }
        let item = order.item;
        buyer.savings.transfer(order.owner.savings, order.buyout_price);
        let sm = this.world.socket_manager;
        sm.send_savings_update(buyer);
        sm.send_savings_update(order.owner);
        buyer.equip.add_item(item);
        buyer.save_to_db(pool)
        await order.return_money(pool);
        this.orders.delete(id);
        await order.delete_from_db(pool);
        this.CHANGED = true
    }

    async bid(pool, bidder, new_price, id) {
        if (!(id in this.orders)) {
            return
        }
        let order = this.world.get_item_order(id);
        if ((bidder.savings.get() < new_price) || (new_price <= order.current_price)) {
            return
        }
        if (bidder.id == order.owner_id) {
            return
        }
        await order.return_money()
        bidder.savings.inc(-new_price);
        await order.bid(pool, bidder, new_price);
        await order.save_to_db(pool);
        this.CHANGED = true;
    }

    async resolve(pool, i) {
        let order = this.world.get_item_order(i)
        let item = order.item
        let owner = order.owner;
        let winner = this.world.get_from_id_tag(this.latest_bidder, 'chara');
        if (winner == undefined) {
            if (owner != undefined) {
                owner.equip.add_item(item)
                owner.save_to_db(pool);
                return true
            }
            return true
        }
        winner.equip.add_item(item);
        if (owner != undefined) {
            winner.savings.transfer(owner.savings, this.current_price)
            winner.save_to_db(pool);
            owner.save_to_db(pool);
            return true
        }
        return true
    }

    async update(pool) {
        let now = Date.now();
        for (let i of this.orders) {
            let order = this.world.get_item_order(i);
            if ((order.end_time < now) || (order.owner == undefined)) {
                let resp = this.resolve(pool, i);
                if (resp) {
                    await order.delete_from_db(pool);
                    this.orders.delete(i);
                    this.CHANGED = true;
                }
            }
        }
        if (this.CHANGED) {
            this.save_to_db(pool)
            this.world.socket_manager.send_item_market_update(this)
            this.CHANGED = false;
        }        
    }

    get_orders_list() {
        var tmp = [];
        for (let i of this.orders) {
            let order = this.world.get_item_order(i);
            tmp.push(order.get_json());
        }
        return tmp;
    }

    async load_from_json(data) {
        this.orders = new Set(data.orders);
    }

    async load(pool, id) {
        this.id = id
        let tmp = await common.send_query(pool, constants.select_market_items_by_id_query, [this.id]);
        tmp = tmp.rows[0];
        this.load_from_json(tmp)
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_market_items_query, [this.id, Array.from(this.orders.values())]);
    }

    async load_to_db(pool) {
        let result = await common.send_query(pool, constants.insert_market_items_query, [Array.from(this.orders.values())]);
        return result.rows[0].id;
    }
}

class OrderItem {
    constructor(world) {
        this.world = world
    }

    async init(pool, owner, item, buyout_price, starting_price, end_time) {
        this.item = item;
        this.owner = owner;
        this.owner_id = owner.id;
        this.buyout_price = buyout_price;
        this.current_price = starting_price;
        this.latest_bidder = owner.id;
        this.end_time = end_time;
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async bid(pool, bidder, new_price) {
        if (new_price > this.current_price) {
            this.current_price = new_price;
            this.latest_bidder = bidder.id;
            await this.save_to_db(pool);
        }
    }

    async return_money(pool) {
        if (this.latest_bidder != this.owner_id) {
            let char = this.world.get_from_id_tag(this.latest_bidder, 'chara');
            char.savings.inc(this.current_price);
            char.save_to_db(pool);
            this.current_price = 0;
        }
    }

    async load_to_db(pool) {
        let result = await common.send_query(pool, constants.insert_item_order_query, [this.item, this.owner_id, this.buyout_price, this.current_price, this.latest_bidder, this.end_time, this.market_id]);
        return result.rows[0].id;
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_item_order_query, [this.id, this.current_price, this.latest_bidder])
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_item_order_query, [this.id]);
    }

    load_from_json(data) {
        this.id = data.id;
        this.item = data.item;
        this.owner_id = data.owner_id;
        this.owner = this.world.get_from_id_tag(this.owner_id, 'chara');
        this.buyout_price = data.buyout_price;
        this.current_price = data.current_price;
        this.latest_bidder = data.latest_bidder;
        this.end_time = data.end_time;
        this.market_id = data.market_id;
    }

    get_json() {
        var tmp = {};
        tmp.id = this.id;
        tmp.item = this.item;
        tmp.owner_id = this.owner_id;
        tmp.owner_name = this.owner.name;
        tmp.buyout_price = this.buyout_price;
        tmp.current_price = this.current_price;
        tmp.latest_bidder = this.latest_bidder;
        tmp.end_time = this.end_time;
        tmp.market_id = this.market_id;
        return tmp;
    }
}

module.exports = {MarketItems: MarketItems, OrderItem: OrderItem};