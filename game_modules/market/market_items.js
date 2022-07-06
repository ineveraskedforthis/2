"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Auction = exports.AuctionManagement = exports.AuctionOrderManagement = void 0;
const savings_1 = require("../base_game_classes/savings");
const item_tags_1 = require("../static_data/item_tags");
const common = require("../common.js");
const { constants } = require("../static_data/constants.js");
const hour = 1000 * 60 * 60;
const time_intervals = [1000 * 60, hour * 12, hour * 24, hour * 48];
function nodb_mode_id() {
    // @ts-ignore: Unreachable code error
    if (global.flag_nodb) {
        // @ts-ignore: Unreachable code error
        global.last_id += 1;
        // @ts-ignore: Unreachable code error
        return global.last_id;
    }
    return undefined;
}
function nodb_mode_check() {
    // @ts-ignore: Unreachable code error
    return global.flag_nodb;
}
var AuctionResponce;
(function (AuctionResponce) {
    AuctionResponce["NOT_IN_THE_SAME_CELL"] = "not_in_the_same_cell";
    AuctionResponce["EMPTY_BACKPACK_SLOT"] = "empty_backpack_slot";
    AuctionResponce["NO_SUCH_ORDER"] = "no_such_order";
    AuctionResponce["OK"] = "ok";
    AuctionResponce["NOT_ENOUGH_MONEY"] = "not_enough_money";
    AuctionResponce["INVALID_ORDER"] = "invalid_order";
})(AuctionResponce || (AuctionResponce = {}));
var AuctionOrderManagement;
(function (AuctionOrderManagement) {
    async function build_order(pool, owner, latest_bidder, item, buyout_price, starting_price, end_time, market_id, flags) {
        let order_id = await AuctionOrderManagement.insert_to_db(pool, item, owner.id, buyout_price, starting_price, owner.id, end_time, market_id);
        let order = new OrderItem(item, owner, latest_bidder, buyout_price, starting_price, end_time, order_id, market_id, flags);
        return order;
    }
    AuctionOrderManagement.build_order = build_order;
    async function insert_to_db(pool, item, owner_id, buyout_price, current_price, latest_bidder, end_time, market_id) {
        let nodb = nodb_mode_id();
        if (nodb != undefined) {
            return nodb;
        }
        let result = await common.send_query(pool, constants.insert_item_order_query, [item.get_json(), owner_id, buyout_price, current_price, latest_bidder, end_time, market_id]);
        return result.rows[0].id;
    }
    AuctionOrderManagement.insert_to_db = insert_to_db;
    function order_to_json(order) {
        let responce = {
            id: order.id,
            item: order.item.get_json(),
            owner_id: order.owner_id,
            owner_name: order.owner.name,
            buyout_price: order.buyout_price,
            current_price: order.current_price,
            latest_bidder_id: order.latest_bidder.id,
            latest_bidder_name: order.latest_bidder.name,
            end_time: order.end_time,
            market_id: order.market_id,
            flags: order.flags
        };
        return responce;
    }
    AuctionOrderManagement.order_to_json = order_to_json;
    function json_to_order(data, entity_manager) {
        let item_data = data.item;
        let item = null;
        switch (item_data.item_type) {
            case 'armour': item = new item_tags_1.Armour(data.item);
            case 'weapon': item = new item_tags_1.Weapon(data.item);
        }
        let owner = entity_manager.chars[data.owner_id];
        let latest_bidder = entity_manager.chars[data.latest_bidder_id];
        let order = new OrderItem(item, owner, latest_bidder, data.buyout_price, data.current_price, data.end_time, data.id, data.market_id, data.flags);
        return order;
    }
    AuctionOrderManagement.json_to_order = json_to_order;
    async function save_db(pool, order) {
        await common.send_query(pool, constants.update_item_order_query, [order.id, order.current_price, order.latest_bidder.id]);
    }
    AuctionOrderManagement.save_db = save_db;
    async function delete_db(pool, order) {
        await common.send_query(pool, constants.delete_item_order_query, [order.id]);
    }
    AuctionOrderManagement.delete_db = delete_db;
    async function check_order(pool, order) {
        if (order.dead()) {
            AuctionOrderManagement.delete_db(pool, order);
            return true;
        }
        return false;
    }
    AuctionOrderManagement.check_order = check_order;
})(AuctionOrderManagement = exports.AuctionOrderManagement || (exports.AuctionOrderManagement = {}));
var AuctionManagement;
(function (AuctionManagement) {
    async function build(pool, cell_id) {
        let id = await AuctionManagement.insert_to_db(pool);
        let auction = new Auction(id, cell_id);
        return auction;
    }
    AuctionManagement.build = build;
    async function insert_to_db(pool) {
        let nodb = nodb_mode_id();
        if (nodb != undefined) {
            return nodb;
        }
        let result = await common.send_query(pool, constants.insert_market_items_query, []);
        return result.rows[0].id;
    }
    AuctionManagement.insert_to_db = insert_to_db;
    async function sell(pool, seller, auction, type, backpack_id, buyout_price, starting_price) {
        if (auction.cell_id != seller.cell_id) {
            return { responce: AuctionResponce.NOT_IN_THE_SAME_CELL };
        }
        let item = null;
        switch (type) {
            case 'armour':
                item = seller.equip.data.backpack.armours[backpack_id];
                break;
            case 'weapon':
                item = seller.equip.data.backpack.weapons[backpack_id];
                break;
        }
        if (item == undefined) {
            return { responce: AuctionResponce.EMPTY_BACKPACK_SLOT };
        }
        let time = Date.now() + time_intervals[1];
        let order = await AuctionOrderManagement.build_order(pool, seller, seller, item, buyout_price, starting_price, time, auction.id, { finished: false,
            item_sent: false,
            profit_sent: false });
        auction.add_order(order);
        return { responce: AuctionResponce.OK };
    }
    AuctionManagement.sell = sell;
    async function save(pool, market) {
        if (nodb_mode_check()) {
            return;
        }
        if (market.changed) {
            await common.send_query(pool, constants.update_market_items_query, [market.id, Array.from(market.orders.values()), market.cell_id]);
        }
    }
    AuctionManagement.save = save;
    async function load(pool, id) {
        if (nodb_mode_check()) {
            return;
        }
        let tmp = await common.send_query(pool, constants.select_market_items_by_id_query, [id]);
        tmp = tmp.rows[0];
        let auction = new Auction(id, tmp.cell_id);
        auction.set_orders(new Set(tmp.orders));
        return auction;
    }
    AuctionManagement.load = load;
    function auction_to_orders_list(manager, market) {
        let tmp = [];
        for (let index of market.orders) {
            let order = manager.get_item_order(index);
            tmp.push(order);
        }
        return tmp;
    }
    AuctionManagement.auction_to_orders_list = auction_to_orders_list;
    function auction_to_orders_json_list(manager, market) {
        let tmp = [];
        for (let index of market.orders) {
            let order = manager.get_item_order(index);
            tmp.push(AuctionOrderManagement.order_to_json(order));
        }
        return tmp;
    }
    AuctionManagement.auction_to_orders_json_list = auction_to_orders_json_list;
    /**  Sends money to market and sets order as finished.
    * Does NOT send item itself: use claim_item to recieve item from order.
    * Does NOT send money to owner: use claim_money to recieve them from order.
    * */
    async function buyout(pool, manager, socket_manager, market, buyer, id) {
        if (!market.orders.has(id)) {
            return AuctionResponce.NO_SUCH_ORDER;
        }
        let order = manager.get_item_order(id);
        if (buyer.savings.get() < order.buyout_price) {
            return AuctionResponce.NOT_ENOUGH_MONEY;
        }
        if (order.flags.finished) {
            return AuctionResponce.INVALID_ORDER;
        }
        // order.return_money()
        order.flags.finished = true;
        order.latest_bidder = buyer;
        buyer.savings.transfer(market.savings, order.buyout_price);
        socket_manager.send_savings_update(buyer);
        AuctionOrderManagement.save_db(pool, order);
    }
    AuctionManagement.buyout = buyout;
    /**
     * Claims item from finished order.
     */
    function claim_order_item(pool, manager, character, order_id, market) {
        if (!market.orders.has(order_id)) {
            return AuctionResponce.NO_SUCH_ORDER;
        }
        let order = manager.get_item_order(order_id);
        if (!order.flags.finished) {
            return AuctionResponce.INVALID_ORDER;
        }
        if (character.id != order.latest_bidder.id) {
            return AuctionResponce.INVALID_ORDER;
        }
        if (order.flags.item_sent) {
            return AuctionResponce.INVALID_ORDER;
        }
        let item = order.item;
        switch (item.item_type) {
            case 'armour': character.equip.add_armour(item);
            case 'weapon': character.equip.add_weapon(item);
        }
        order.flags.item_sent = true;
        AuctionOrderManagement.save_db(pool, order);
    }
    AuctionManagement.claim_order_item = claim_order_item;
    /**
     * Claims money from finished order.
     */
    function claim_order_money(pool, manager, character, order_id, market) {
        if (!market.orders.has(order_id)) {
            return AuctionResponce.NO_SUCH_ORDER;
        }
        let order = manager.get_item_order(order_id);
        if (!order.flags.finished) {
            return AuctionResponce.INVALID_ORDER;
        }
        if (character.id != order.owner.id) {
            return AuctionResponce.INVALID_ORDER;
        }
        if (order.flags.profit_sent) {
            return AuctionResponce.INVALID_ORDER;
        }
        market.savings.transfer(character.savings, order.buyout_price);
        order.flags.profit_sent = true;
        AuctionOrderManagement.save_db(pool, order);
    }
    AuctionManagement.claim_order_money = claim_order_money;
    async function update(pool, manager, socket_manager, market) {
        let now = Date.now();
        for (let i of market.orders) {
            let order = manager.get_item_order(i);
            let responce = await AuctionOrderManagement.check_order(pool, order);
            if (responce) {
                market.changed = true;
            }
        }
        if (market.changed) {
            AuctionManagement.save(pool, market);
            socket_manager.send_item_market_update(market);
            market.changed = false;
        }
    }
})(AuctionManagement = exports.AuctionManagement || (exports.AuctionManagement = {}));
// I will restore only minimal functionalty of auction: only buyouts, 
// i don't want to think too hard about returning money to bidders which moved away.
class Auction {
    constructor(id, cell_id) {
        this.id = id;
        this.orders = new Set();
        this.changed = false;
        this.cell_id = cell_id;
        this.savings = new savings_1.Savings();
    }
    add_order(order) {
        this.orders.add(order.id);
        this.changed = true;
    }
    set_orders(orders) {
        this.orders = orders;
        this.changed = true;
    }
}
exports.Auction = Auction;
class OrderItem {
    constructor(item, owner, latest_bidder, buyout_price, current_price, end_time, id, market_id, flags) {
        this.item = item;
        this.owner = owner;
        this.owner_id = owner.id;
        this.buyout_price = buyout_price;
        this.current_price = current_price;
        this.latest_bidder = latest_bidder;
        this.end_time = end_time;
        this.id = id;
        this.market_id = market_id;
        this.flags = flags;
    }
    dead() {
        return (this.flags.finished && this.flags.item_sent && this.flags.profit_sent);
    }
}
exports.OrderItem = OrderItem;
