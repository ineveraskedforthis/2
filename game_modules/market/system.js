"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionManagement = exports.SingularOrders = exports.BulkOrders = void 0;
const system_1 = require("../base_game_classes/character/system");
const system_2 = require("../base_game_classes/items/system");
const classes_1 = require("./classes");
var orders_bulk = [];
var last_id_bulk = 0;
var last_id_sing = 0;
var AuctionResponce;
(function (AuctionResponce) {
    AuctionResponce["NOT_IN_THE_SAME_CELL"] = "not_in_the_same_cell";
    AuctionResponce["EMPTY_BACKPACK_SLOT"] = "empty_backpack_slot";
    AuctionResponce["NO_SUCH_ORDER"] = "no_such_order";
    AuctionResponce["OK"] = "ok";
    AuctionResponce["NOT_ENOUGH_MONEY"] = "not_enough_money";
    AuctionResponce["INVALID_ORDER"] = "invalid_order";
})(AuctionResponce || (AuctionResponce = {}));
var BulkOrders;
(function (BulkOrders) {
    function save() {
    }
    BulkOrders.save = save;
    function load() {
    }
    BulkOrders.load = load;
    function create(amount, price, typ, tag, owner) {
        last_id_bulk = last_id_bulk + 1;
        let order = new classes_1.OrderBulk(last_id_bulk, amount, price, typ, tag, owner.id, owner.cell_id);
        orders_bulk.push(order);
        return order;
    }
    BulkOrders.create = create;
})(BulkOrders = exports.BulkOrders || (exports.BulkOrders = {}));
var SingularOrders;
(function (SingularOrders) {
    function save() {
    }
    SingularOrders.save = save;
    function load() {
    }
    SingularOrders.load = load;
    async function create(owner, item, price, cell_id, finished) {
        last_id_sing = last_id_sing + 1;
        let order = new classes_1.OrderItem(last_id_sing, item, price, owner.id, cell_id, finished);
        return order;
    }
    SingularOrders.create = create;
    function order_to_json(order) {
        let owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        let responce = {
            id: order.id,
            item: order.item.get_json(),
            owner_id: order.owner_id,
            price: order.price,
            // cell_id: owner.cell_id,
            finished: order.finished
        };
        return responce;
    }
    SingularOrders.order_to_json = order_to_json;
    function order_to_socket_data(order) {
        let owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        return {
            seller_name: owner.name,
            price: order.price,
            item_name: order.item.get_tag(),
            affixes: [],
            id: order.id
        };
    }
    SingularOrders.order_to_socket_data = order_to_socket_data;
    function json_to_order(data, entity_manager) {
        let item_data = data.item;
        let item = system_2.ItemSystem;
        null;
        switch (item_data.item_type) {
            case 'armour':
                item = new Armour(data.item);
                break;
            case 'weapon': item = new Weapon(data.item);
        }
        let owner = entity_manager.chars[data.owner_id];
        let latest_bidder = entity_manager.chars[data.latest_bidder_id];
        let order = new classes_1.OrderItem(item, owner, latest_bidder, data.buyout_price, data.current_price, data.end_time, data.id, data.flags);
        return order;
    }
    SingularOrders.json_to_order = json_to_order;
    async function save_db(pool, order) {
        await common.send_query(pool, constants.update_item_order_query, [order.id, order.current_price, order.latest_bidder.id]);
    }
    SingularOrders.save_db = save_db;
    async function delete_db(pool, order) {
        await common.send_query(pool, constants.delete_item_order_query, [order.id]);
    }
    SingularOrders.delete_db = delete_db;
})(SingularOrders = exports.SingularOrders || (exports.SingularOrders = {}));
var AuctionManagement;
(function (AuctionManagement) {
    async function sell(entity_manager, seller, type, backpack_id, buyout_price, starting_price) {
        // if (auction.cell_id != seller.cell_id) {
        //     return {responce: AuctionResponce.NOT_IN_THE_SAME_CELL}
        // }
        let cell = seller.cell_id;
        let item = null;
        switch (type) {
            case 'armour':
                {
                    item = seller.equip.data.backpack.armours[backpack_id];
                    break;
                }
                ;
            case 'weapon':
                {
                    item = seller.equip.data.backpack.weapons[backpack_id];
                    break;
                }
                ;
        }
        if (item == undefined) {
            return { responce: AuctionResponce.EMPTY_BACKPACK_SLOT };
        }
        switch (type) {
            case 'armour':
                {
                    seller.equip.data.backpack.armours[backpack_id] = undefined;
                    break;
                }
                ;
            case 'weapon':
                {
                    seller.equip.data.backpack.weapons[backpack_id] = undefined;
                    break;
                }
                ;
        }
        let time = Date.now() + time_intervals[1];
        let order = await AuctionOrderManagement.build_order(seller, seller, item, buyout_price, starting_price, time, cell, {
            finished: false,
            // item_sent:false, 
            // profit_sent: false
        });
        entity_manager.add_item_order(order);
        socket_manager.send_item_market_update(order.owner.cell_id);
        return { responce: AuctionResponce.OK };
    }
    AuctionManagement.sell = sell;
    async function load(pool, entity_manager) {
        if (nodb_mode_check()) {
            return;
        }
        let responce = await common.send_query(pool, constants.load_item_orders_query);
        for (let data of responce.rows) {
            let order = AuctionOrderManagement.json_to_order(data, entity_manager);
            entity_manager.add_item_order(order);
        }
    }
    AuctionManagement.load = load;
    function cell_id_to_orders_list(manager, cell_id) {
        let tmp = [];
        for (let order of manager.item_orders) {
            if (order == undefined)
                continue;
            if (order.flags.finished)
                continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(order);
            }
        }
        return tmp;
    }
    AuctionManagement.cell_id_to_orders_list = cell_id_to_orders_list;
    function cell_id_to_orders_socket_data_list(manager, cell_id) {
        let tmp = [];
        for (let order of manager.item_orders) {
            if (order == undefined)
                continue;
            if (order.flags.finished)
                continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(AuctionOrderManagement.order_to_socket_data(order));
            }
        }
        return tmp;
    }
    AuctionManagement.cell_id_to_orders_socket_data_list = cell_id_to_orders_socket_data_list;
    function cell_id_to_orders_json_list(manager, cell_id) {
        let tmp = [];
        for (let order of manager.item_orders) {
            if (order == undefined)
                continue;
            if (order.flags.finished)
                continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(AuctionOrderManagement.order_to_json(order));
            }
        }
        return tmp;
    }
    AuctionManagement.cell_id_to_orders_json_list = cell_id_to_orders_json_list;
    /**  Sends money to seller and sends item to buyer
    * */
    async function buyout(manager, buyer, id) {
        let order = manager.raw_id_to_item_order(id);
        if (order == undefined) {
            return AuctionResponce.NO_SUCH_ORDER;
        }
        if (order.owner.cell_id != buyer.cell_id) {
            return AuctionResponce.NOT_IN_THE_SAME_CELL;
        }
        if ((buyer.id != order.owner_id) && (buyer.savings.get() < order.buyout_price)) {
            return AuctionResponce.NOT_ENOUGH_MONEY;
        }
        if (order.flags.finished) {
            return AuctionResponce.INVALID_ORDER;
        }
        // order.return_money()
        order.flags.finished = true;
        order.latest_bidder = buyer;
        let owner = order.owner;
        buyer.savings.transfer(owner.savings, order.buyout_price);
        let item = order.item;
        switch (item.item_type) {
            case 'armour':
                buyer.equip.add_armour(item);
                break;
            case 'weapon': buyer.equip.add_weapon(item);
        }
        // order.flags.item_sent = true
        socket_manager.send_savings_update(buyer);
        socket_manager.send_item_market_update(order.owner.cell_id);
        AuctionOrderManagement.delete_db(pool, order);
        return AuctionResponce.OK;
    }
    AuctionManagement.buyout = buyout;
    function cancel_order(manager, who, order_id) {
        let order = manager.raw_id_to_item_order(order_id);
        if (order == undefined) {
            return AuctionResponce.NO_SUCH_ORDER;
        }
        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER;
        }
        let owner = order.owner;
        order.flags.finished = true;
        let item = order.item;
        switch (item.item_type) {
            case 'armour':
                owner.equip.add_armour(item);
                break;
            case 'weapon': owner.equip.add_weapon(item);
        }
        socket_manager.send_item_market_update(order.owner.cell_id);
        AuctionOrderManagement.delete_db(pool, order);
    }
    AuctionManagement.cancel_order = cancel_order;
    function cancel_order_safe(manager, who, order_id) {
        let order = manager.get_item_order(order_id);
        let owner = order.owner;
        order.flags.finished = true;
        let item = order.item;
        // console.log(item)
        switch (item.item_type) {
            case 'armour':
                owner.equip.add_armour(item);
                break;
            case 'weapon': owner.equip.add_weapon(item);
        }
        socket_manager.send_item_market_update(order.owner.cell_id);
        AuctionOrderManagement.delete_db(pool, order);
    }
    AuctionManagement.cancel_order_safe = cancel_order_safe;
    function cancel_all_orders(manager, who) {
        for (let order of manager.item_orders) {
            if (order == undefined)
                continue;
            if (order.flags.finished)
                continue;
            console.log(order.owner_id, who.id);
            if (order.owner_id == who.id)
                cancel_order_safe(pool, manager, socket_manager, who, order.id);
        }
    }
    AuctionManagement.cancel_all_orders = cancel_all_orders;
})(AuctionManagement = exports.AuctionManagement || (exports.AuctionManagement = {}));
