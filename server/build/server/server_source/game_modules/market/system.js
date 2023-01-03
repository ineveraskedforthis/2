"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOrders = exports.BulkOrders = exports.AuctionResponce = void 0;
const system_1 = require("../character/system");
const stash_1 = require("../inventories/stash");
const system_2 = require("../items/system");
const data_1 = require("../data");
const systems_communication_1 = require("../systems_communication");
const classes_1 = require("./classes");
const fs_1 = __importDefault(require("fs"));
const SAVE_GAME_PATH_1 = require("../../SAVE_GAME_PATH");
var path = require('path');
var AuctionResponce;
(function (AuctionResponce) {
    AuctionResponce["NOT_IN_THE_SAME_CELL"] = "not_in_the_same_cell";
    AuctionResponce["EMPTY_BACKPACK_SLOT"] = "empty_backpack_slot";
    AuctionResponce["NO_SUCH_ORDER"] = "no_such_order";
    AuctionResponce["OK"] = "ok";
    AuctionResponce["NOT_ENOUGH_MONEY"] = "not_enough_money";
    AuctionResponce["INVALID_ORDER"] = "invalid_order";
})(AuctionResponce = exports.AuctionResponce || (exports.AuctionResponce = {}));
const empty_stash = new stash_1.Stash();
// this file does not handle networking
const save_path_bulk = path.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'bulk_market.txt');
var BulkOrders;
(function (BulkOrders) {
    function save() {
        console.log('saving bulk market orders');
        let str = '';
        for (let item of data_1.Data.BulkOrders.list()) {
            if (item.amount == 0)
                continue;
            str = str + JSON.stringify(item) + '\n';
        }
        fs_1.default.writeFileSync(save_path_bulk, str);
        console.log('bulk market orders saved');
    }
    BulkOrders.save = save;
    function load() {
        console.log('loading bulk market orders');
        if (!fs_1.default.existsSync(save_path_bulk)) {
            fs_1.default.writeFileSync(save_path_bulk, '');
        }
        let data = fs_1.default.readFileSync(save_path_bulk).toString();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            const order = JSON.parse(line);
            // console.log(order)
            data_1.Data.BulkOrders.set(order.id, order.owner_id, order);
            const last_id = data_1.Data.BulkOrders.id();
            data_1.Data.BulkOrders.set_id(Math.max(order.id, last_id));
        }
        console.log('bulk market orders loaded');
    }
    BulkOrders.load = load;
    // does not shadow resources, shadowing happens in create_type_order functions
    // private
    function create(amount, price, typ, tag, owner) {
        data_1.Data.BulkOrders.increase_id();
        let order = new classes_1.OrderBulk(data_1.Data.BulkOrders.id(), amount, price, typ, tag, owner.id);
        data_1.Data.BulkOrders.set(data_1.Data.BulkOrders.id(), owner.id, order);
        return order;
    }
    function remove(id) {
        const order = data_1.Data.BulkOrders.from_id(id);
        const character = data_1.Data.Character.from_id(order.owner_id);
        if (order.typ == 'buy') {
            character.trade_savings.transfer(character.savings, order.amount * order.price);
        }
        if (order.typ == 'sell') {
            character.trade_stash.transfer(character.stash, order.tag, order.amount);
        }
        order.amount = 0;
    }
    BulkOrders.remove = remove;
    function remove_by_condition(character, tag) {
        const set = data_1.Data.BulkOrders.from_char_id(character.id);
        if (set == undefined)
            return;
        for (let [_, id] of set.entries()) {
            const order = data_1.Data.BulkOrders.from_id(id);
            if (order.tag == tag) {
                remove(id);
            }
        }
    }
    BulkOrders.remove_by_condition = remove_by_condition;
    function execute_sell_order(id, amount, buyer) {
        const order = data_1.Data.BulkOrders.from_id(id);
        const owner = systems_communication_1.Convert.id_to_character(order.owner_id);
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
        const order = data_1.Data.BulkOrders.from_id(id);
        const owner = systems_communication_1.Convert.id_to_character(order.owner_id);
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
        return 'ok';
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
        return 'ok';
    }
    BulkOrders.new_sell_order = new_sell_order;
})(BulkOrders = exports.BulkOrders || (exports.BulkOrders = {}));
const save_path_item = path.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'item_market.txt');
var ItemOrders;
(function (ItemOrders) {
    function save() {
        console.log('saving item market orders');
        let str = '';
        for (let item of data_1.Data.ItemOrders.list()) {
            if (item.finished)
                continue;
            str = str + JSON.stringify(item) + '\n';
        }
        fs_1.default.writeFileSync(save_path_item, str);
        console.log('item market orders saved');
    }
    ItemOrders.save = save;
    function load() {
        console.log('loading item market orders');
        if (!fs_1.default.existsSync(save_path_item)) {
            fs_1.default.writeFileSync(save_path_item, '');
        }
        let data = fs_1.default.readFileSync(save_path_item).toString();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            const order_raw = JSON.parse(line);
            const item = system_2.ItemSystem.from_string(JSON.stringify(order_raw.item));
            const order = new classes_1.OrderItem(order_raw.id, item, order_raw.price, order_raw.owner_id, order_raw.finished);
            data_1.Data.ItemOrders.set(order.id, order.owner_id, order);
            const last_id = data_1.Data.ItemOrders.id();
            data_1.Data.ItemOrders.set_id(Math.max(order.id, last_id));
        }
        console.log('item market orders loaded');
    }
    ItemOrders.load = load;
    function create(owner, item, price, finished) {
        data_1.Data.ItemOrders.increase_id();
        let order = new classes_1.OrderItem(data_1.Data.ItemOrders.id(), item, price, owner.id, finished);
        data_1.Data.ItemOrders.set(data_1.Data.ItemOrders.id(), owner.id, order);
        return order;
    }
    ItemOrders.create = create;
    function remove(id, who) {
        const order = data_1.Data.ItemOrders.from_id(id);
        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER;
        }
        const owner = systems_communication_1.Convert.id_to_character(order.owner_id);
        order.finished = true;
        owner.equip.data.backpack.add(order.item);
        return AuctionResponce.OK;
    }
    ItemOrders.remove = remove;
    function remove_unsafe(id, who) {
        const true_id = systems_communication_1.Convert.number_to_order_item_id(id);
        if (true_id == undefined)
            return AuctionResponce.NO_SUCH_ORDER;
        return remove(true_id, who);
    }
    ItemOrders.remove_unsafe = remove_unsafe;
    function remove_all_character(who) {
        // console.log('attempt to remove item orders')
        for (let order of data_1.Data.ItemOrders.list()) {
            if (order == undefined)
                continue;
            if (order.finished)
                continue;
            if (order.owner_id != who.id)
                continue;
            // console.log(order.owner_id, who.id)
            remove(order.id, who);
        }
    }
    ItemOrders.remove_all_character = remove_all_character;
    // export function order_to_json(order: OrderItem) {
    //     let owner = Convert.id_to_character(order.owner_id)
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
    function sell(seller, backpack_id, price) {
        const item = seller.equip.data.backpack.items[backpack_id];
        if (item == undefined) {
            return { responce: AuctionResponce.EMPTY_BACKPACK_SLOT };
        }
        const order = create(seller, item, price, false);
        seller.equip.data.backpack.remove(backpack_id);
        return { responce: AuctionResponce.OK };
    }
    ItemOrders.sell = sell;
    function buy(id, buyer) {
        const order = data_1.Data.ItemOrders.from_id(id);
        const owner = systems_communication_1.Convert.id_to_character(order.owner_id);
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
        let true_id = systems_communication_1.Convert.number_to_order_item_id(id);
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
