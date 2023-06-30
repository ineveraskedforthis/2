"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOrders = exports.BulkOrders = exports.AuctionResponce = void 0;
const system_1 = require("../character/system");
const stash_1 = require("../inventories/stash");
const data_1 = require("../data");
const systems_communication_1 = require("../systems_communication");
const classes_1 = require("./classes");
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
var BulkOrders;
(function (BulkOrders) {
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
        const character = data_1.Data.CharacterDB.from_id(order.owner_id);
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
            amount = order.amount;
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
            amount = order.amount;
        if (seller.stash.get(order.tag) < amount)
            amount = seller.stash.get(order.tag);
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
        price = Math.floor(price);
        amount = Math.floor(amount);
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
        price = Math.floor(price);
        amount = Math.floor(amount);
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
var ItemOrders;
(function (ItemOrders) {
    function create(owner, item, price, finished) {
        item.price = price;
    }
    ItemOrders.create = create;
    function remove(item, who) {
        item.price = undefined;
        return AuctionResponce.OK;
    }
    ItemOrders.remove = remove;
    // export function remove_unsafe(id: number, who: Character) {
    //     const true_id = Convert.number_to_order_item_id(id)
    //     if (true_id == undefined) return AuctionResponce.NO_SUCH_ORDER    
    //     return remove(true_id, who)
    // }
    function remove_all_character(who) {
        // console.log('attempt to remove item orders')
        for (let order of data_1.Data.CharacterItemOrders(who.id)) {
            if (order == undefined)
                return;
            remove(order, who);
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
        create(seller, item, price, false);
        // seller.equip.data.backpack.remove(backpack_id)
        return { responce: AuctionResponce.OK };
    }
    ItemOrders.sell = sell;
    function buy(id, buyer, seller) {
        let item = seller.equip.data.backpack.items[id];
        if (item == undefined)
            return AuctionResponce.INVALID_ORDER;
        if (item.price == undefined)
            return AuctionResponce.INVALID_ORDER;
        // make sure that they are in the same cell
        if (seller.cell_id != buyer.cell_id) {
            return AuctionResponce.NOT_IN_THE_SAME_CELL;
        }
        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != seller.id) && (buyer.savings.get() < item.price)) {
            return AuctionResponce.NOT_ENOUGH_MONEY;
        }
        buyer.savings.transfer(seller.savings, item.price);
        seller.equip.data.backpack.remove(id);
        buyer.equip.data.backpack.add(item);
        item.price = undefined;
        return AuctionResponce.OK;
    }
    ItemOrders.buy = buy;
})(ItemOrders = exports.ItemOrders || (exports.ItemOrders = {}));
