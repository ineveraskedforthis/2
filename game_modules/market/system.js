"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOrders = exports.BulkOrders = void 0;
const system_1 = require("../base_game_classes/character/system");
const stash_1 = require("../base_game_classes/inventories/stash");
const system_2 = require("../base_game_classes/items/system");
const classes_1 = require("./classes");
var orders_bulk = [];
var orders_item = [];
var last_id_bulk = 0;
var last_id_item = 0;
var AuctionResponce;
(function (AuctionResponce) {
    AuctionResponce["NOT_IN_THE_SAME_CELL"] = "not_in_the_same_cell";
    AuctionResponce["EMPTY_BACKPACK_SLOT"] = "empty_backpack_slot";
    AuctionResponce["NO_SUCH_ORDER"] = "no_such_order";
    AuctionResponce["OK"] = "ok";
    AuctionResponce["NOT_ENOUGH_MONEY"] = "not_enough_money";
    AuctionResponce["INVALID_ORDER"] = "invalid_order";
})(AuctionResponce || (AuctionResponce = {}));
const empty_stash = new stash_1.Stash();
// this file does not handle networking
var BulkOrders;
(function (BulkOrders) {
    function save() {
    }
    BulkOrders.save = save;
    function load() {
    }
    BulkOrders.load = load;
    // does not shadow resources, shadowing happens in create_type_order functions
    function create(amount, price, typ, tag, owner) {
        last_id_bulk = last_id_bulk + 1;
        let order = new classes_1.OrderBulk(last_id_bulk, amount, price, typ, tag, owner.id);
        orders_bulk[last_id_bulk] = order;
        return order;
    }
    BulkOrders.create = create;
    function id_to_order(id) {
        return orders_bulk[id];
    }
    BulkOrders.id_to_order = id_to_order;
    function execute_sell_order(id, amount, buyer) {
        const order = id_to_order(id);
        const owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        const pay = amount * order.price;
        if (order.amount < amount)
            return 'invalid_order';
        if (buyer.savings.get() < pay)
            return 'not_enough_money';
        const material = order.tag;
        // shadow operations with imaginary items
        order.amount -= amount;
        const transaction_stash = new stash_1.Stash();
        transaction_stash.inc(material, amount);
        system_1.CharacterSystem.to_trade_stash(owner, order.tag, -amount);
        //actual transaction
        system_1.CharacterSystem.transaction(owner, buyer, 0, transaction_stash, pay, empty_stash);
        return 'ok';
    }
    BulkOrders.execute_sell_order = execute_sell_order;
    function execute_buy_order(id, amount, seller) {
        const order = id_to_order(id);
        const owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        if (order.amount < amount)
            return 'invalid_order';
        if (seller.stash.get(order.tag) < amount)
            return 'not_enough_items_in_stash';
        const pay = amount * order.price;
        const material = order.tag;
        // shadow operations
        order.amount -= amount;
        const transaction_stash = new stash_1.Stash();
        transaction_stash.inc(material, amount);
        system_1.CharacterSystem.to_trade_savings(owner, -pay);
        //transaction
        system_1.CharacterSystem.transaction(owner, seller, pay, empty_stash, 0, transaction_stash);
        return 'ok';
    }
    BulkOrders.execute_buy_order = execute_buy_order;
    function new_buy_order(material, amount, price, owner) {
        //validation of input
        if (price < 0)
            return 'invalid_price';
        if (amount <= 0)
            return 'invalid_amount';
        if (owner.savings.get() < price * amount)
            return 'not_enough_savings';
        system_1.CharacterSystem.to_trade_savings(owner, amount * price);
        const order = create(amount, price, 'buy', material, owner);
        return order;
    }
    BulkOrders.new_buy_order = new_buy_order;
    function new_sell_order(material, amount, price, owner) {
        //validation of input
        if (price < 0)
            return 'invalid_price';
        if (amount <= 0)
            return 'invalid_amount';
        if (owner.stash.get(material) < amount)
            return 'not_enough_material';
        system_1.CharacterSystem.to_trade_stash(owner, material, amount);
        const order = create(amount, price, 'sell', material, owner);
        return order;
    }
    BulkOrders.new_sell_order = new_sell_order;
})(BulkOrders = exports.BulkOrders || (exports.BulkOrders = {}));
var ItemOrders;
(function (ItemOrders) {
    function save() {
    }
    ItemOrders.save = save;
    function load() {
    }
    ItemOrders.load = load;
    function number_to_id(id) {
        if (orders_item[id] == undefined)
            return undefined;
        return id;
    }
    ItemOrders.number_to_id = number_to_id;
    function id_to_order(id) {
        return orders_item[id];
    }
    ItemOrders.id_to_order = id_to_order;
    function create(owner, item, price, finished) {
        last_id_item = last_id_item + 1;
        let order = new classes_1.OrderItem(last_id_item, item, price, owner.id, finished);
        orders_item[last_id_item] = order;
        return order;
    }
    ItemOrders.create = create;
    function remove(id, who) {
        const order = id_to_order(id);
        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER;
        }
        const owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        order.finished = true;
        owner.equip.data.backpack.add(order.item);
        return AuctionResponce.OK;
    }
    ItemOrders.remove = remove;
    function remove_unsafe(id, who) {
        const true_id = number_to_id(id);
        if (true_id == undefined)
            return AuctionResponce.NO_SUCH_ORDER;
        return remove(true_id, who);
    }
    ItemOrders.remove_unsafe = remove_unsafe;
    function remove_all_character(who) {
        for (let order of orders_item) {
            if (order == undefined)
                continue;
            if (order.finished)
                continue;
            console.log(order.owner_id, who.id);
            remove(order.id, who);
        }
    }
    ItemOrders.remove_all_character = remove_all_character;
    // export function order_to_json(order: OrderItem) {
    //     let owner = CharacterSystem.id_to_character(order.owner_id)
    //     let responce:OrderItemJson = {
    //         id: order.id,
    //         item: order.item.get_json(),
    //         owner_id: order.owner_id,
    //         price: order.price,
    //         // cell_id: owner.cell_id,
    //         finished: order.finished
    //     }
    //     return responce
    // }
    function order_to_socket_data(order) {
        let owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        return {
            seller_name: owner.name,
            price: order.price,
            item_name: order.item.tag(),
            affixes: [],
            id: order.id
        };
    }
    ItemOrders.order_to_socket_data = order_to_socket_data;
    function json_to_order(data) {
        let item = system_2.ItemSystem.create(data.item);
        let order = new classes_1.OrderItem(data.id, item, data.price, data.owner_id, data.finished);
        return order;
    }
    ItemOrders.json_to_order = json_to_order;
    function sell(seller, backpack_id, price) {
        const item = seller.equip.data.backpack.items[backpack_id];
        if (item == undefined) {
            return { responce: AuctionResponce.EMPTY_BACKPACK_SLOT };
        }
        const order = create(seller, item, price, false);
        return { responce: AuctionResponce.OK };
    }
    ItemOrders.sell = sell;
    function buy(id, buyer) {
        const order = id_to_order(id);
        const owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        // make sure that they are in the same cell
        if (owner.cell_id != buyer.cell_id) {
            return AuctionResponce.NOT_IN_THE_SAME_CELL;
        }
        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != order.owner_id) && (buyer.savings.get() < order.price)) {
            return AuctionResponce.NOT_ENOUGH_MONEY;
        }
        // make sure that this order is still available to avoid duplication
        if (order.finished) {
            return AuctionResponce.INVALID_ORDER;
        }
        order.finished = true;
        buyer.savings.transfer(owner.savings, order.price);
        buyer.equip.data.backpack.add(order.item);
        return AuctionResponce.OK;
    }
    ItemOrders.buy = buy;
    function buy_unsafe(id, buyer) {
        let true_id = number_to_id(id);
        if (true_id == undefined)
            return AuctionResponce.NO_SUCH_ORDER;
        return buy(true_id, buyer);
    }
    ItemOrders.buy_unsafe = buy_unsafe;
})(ItemOrders = exports.ItemOrders || (exports.ItemOrders = {}));
// export function cell_id_to_orders_list(manager: EntityManager, cell_id: number): OrderItem[] {
//     let tmp = []
//     for (let order of manager.item_orders) {
//         if (order == undefined) continue;
//         if (order.flags.finished) continue;
//         if (order.owner.cell_id == cell_id) {
//             tmp.push(order)
//         }
//     }
//     return tmp
// }
// export function cell_id_to_orders_socket_data_list(manager: EntityManager, cell_id: number): OrderItemSocketData[] {
//     let tmp = []
//     for (let order of manager.item_orders) {
//         if (order == undefined) continue;
//         if (order.flags.finished) continue;
//         if (order.owner.cell_id == cell_id) {
//             tmp.push(AuctionOrderManagement.order_to_socket_data(order))
//         }
//     }
//     return tmp
// }
// export function cell_id_to_orders_json_list(manager: EntityManager, cell_id: number): OrderItemJson[] {
//     let tmp = []
//     for (let order of manager.item_orders) {
//         if (order == undefined) continue;
//         if (order.flags.finished) continue;
//         if (order.owner.cell_id == cell_id) {
//             tmp.push(AuctionOrderManagement.order_to_json(order))
//         }
//     }
//     return tmp
// }
