"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOrders = exports.MarketOrders = exports.AuctionResponse = void 0;
const content_1 = require("../../.././../game_content/src/content");
const item_1 = require("../../content_wrappers/item");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
const stash_1 = require("../data/entities/stash");
const effects_1 = require("../effects/effects");
var AuctionResponse;
(function (AuctionResponse) {
    AuctionResponse["NOT_IN_THE_SAME_CELL"] = "not_in_the_same_cell";
    AuctionResponse["EMPTY_BACKPACK_SLOT"] = "empty_backpack_slot";
    AuctionResponse["NO_SUCH_ORDER"] = "no_such_order";
    AuctionResponse["OK"] = "ok";
    AuctionResponse["NOT_ENOUGH_MONEY"] = "not_enough_money";
    AuctionResponse["INVALID_ORDER"] = "invalid_order";
})(AuctionResponse || (exports.AuctionResponse = AuctionResponse = {}));
const empty_stash = new stash_1.Stash();
var MarketOrders;
(function (MarketOrders) {
    function validate_character(character) {
        let temp = content_1.MaterialConfiguration.zero_record;
        let orders = data_id_1.DataID.Character.market_orders_list(character);
        for (let item of orders) {
            let order = data_objects_1.Data.MarketOrders.from_id(item);
            if (order.typ == "sell") {
                temp[order.material] += order.amount;
            }
        }
        let fat_character = data_objects_1.Data.Characters.from_id(character);
        for (let item of content_1.MaterialConfiguration.MATERIAL) {
            let amount = fat_character.trade_stash.get(item);
            if (amount != temp[item]) {
                throw new Error(content_1.MaterialStorage.get(item).name + " INVALID TRADE STASH " + character + " expected: " + temp[item] + " has: " + amount);
            }
        }
    }
    MarketOrders.validate_character = validate_character;
    function execute_sell_order(id, amount, buyer) {
        const order = data_objects_1.Data.MarketOrders.from_id(id);
        const owner = data_objects_1.Data.Characters.from_id(order.owner_id);
        amount = Math.max(0, amount);
        if (order.amount < amount)
            amount = order.amount;
        const pay = amount * order.price;
        if (buyer.savings.get() < pay)
            return { tag: 'not_enough_money' };
        amount = Math.floor(amount);
        const material = order.material;
        // console.log(`${buyer.id} buys from ${owner.id} ${amount} of ${material}`)
        // console.log(`${order.owner_id} has ${order.amount} of ${material} available to sell for this price`)
        // console.log(`there are ${owner.trade_stash.get(material)} in his trade stash.`)
        // console.log(`there are ${owner.stash.get(material)} in his stash.`)
        // shadow operations with imaginary items
        order.amount -= amount;
        const transaction_stash = new stash_1.Stash();
        transaction_stash.inc(material, amount);
        effects_1.Effect.Transfer.to_trade_stash(owner, order.material, -amount);
        //actual transaction
        effects_1.Effect.transaction(owner, buyer, 0, transaction_stash, pay, empty_stash, "Trade" /* CHANGE_REASON.TRADE */);
        // console.log(`${buyer.id} buys from ${owner.id} ${amount} of ${material}`)
        // console.log(`${order.owner_id} has ${order.amount} of ${material} available to sell for this price`)
        // console.log(`there are ${owner.trade_stash.get(material)} in his trade stash.`)
        // console.log(`there are ${owner.stash.get(material)} in his stash.`)
        MarketOrders.validate_character(owner.id);
        MarketOrders.validate_character(buyer.id);
        return { tag: "ok", amount: amount };
    }
    MarketOrders.execute_sell_order = execute_sell_order;
    function remove(id) {
        const order = data_objects_1.Data.MarketOrders.from_id(id);
        const character = data_objects_1.Data.Characters.from_id(order.owner_id);
        if (order.typ == 'buy') {
            effects_1.Effect.Transfer.to_trade_savings(character, -order.amount * order.price);
        }
        if (order.typ == 'sell') {
            effects_1.Effect.Transfer.to_trade_stash(character, order.material, -order.amount);
        }
        order.amount = 0;
    }
    MarketOrders.remove = remove;
    function remove_by_condition(character, tag) {
        const list = data_id_1.DataID.Character.market_orders_list(character.id);
        const to_remove = [];
        for (const id of list) {
            const order = data_objects_1.Data.MarketOrders.from_id(id);
            if (order.material == tag) {
                to_remove.push(id);
            }
        }
        for (let id of to_remove) {
            remove(id);
        }
    }
    MarketOrders.remove_by_condition = remove_by_condition;
    function remove_by_character(character) {
        const list = data_id_1.DataID.Character.market_orders_list(character.id);
        const to_remove = [];
        for (const id of list) {
            to_remove.push(id);
        }
        for (let id of to_remove) {
            remove(id);
        }
    }
    MarketOrders.remove_by_character = remove_by_character;
    function execute_buy_order(id, amount, seller) {
        amount = Math.max(0, amount);
        const order = data_objects_1.Data.MarketOrders.from_id(id);
        const owner = data_objects_1.Data.Characters.from_id(order.owner_id);
        console.log(seller.id + " sells to " + owner.id);
        // console.log(seller)
        if (order.amount < amount)
            amount = order.amount;
        if (seller.stash.get(order.material) < amount)
            amount = seller.stash.get(order.material);
        amount = Math.floor(amount);
        const pay = amount * order.price;
        const material = order.material;
        // shadow operations
        order.amount -= amount;
        const transaction_stash = new stash_1.Stash();
        seller.stash.transfer(transaction_stash, material, amount);
        effects_1.Effect.Transfer.to_trade_savings(owner, -pay);
        //transaction
        effects_1.Effect.transaction(owner, seller, pay, empty_stash, 0, transaction_stash, "Trade" /* CHANGE_REASON.TRADE */);
        return {
            tag: "ok",
            amount: amount
        };
    }
    MarketOrders.execute_buy_order = execute_buy_order;
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
        effects_1.Effect.Transfer.to_trade_savings(owner, amount * price);
        const order = data_objects_1.Data.MarketOrders.create(amount, price, 'buy', material, owner.id);
        validate_character(owner.id);
        return 'ok';
    }
    MarketOrders.new_buy_order = new_buy_order;
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
        effects_1.Effect.Transfer.to_trade_stash(owner, material, amount);
        const order = data_objects_1.Data.MarketOrders.create(amount, price, 'sell', material, owner.id);
        validate_character(owner.id);
        return 'ok';
    }
    MarketOrders.new_sell_order = new_sell_order;
    function decrease_amount(id, x) {
        const order = data_objects_1.Data.MarketOrders.from_id(id);
        if (order.typ == 'sell') {
            const character = data_objects_1.Data.Characters.from_id(order.owner_id);
            order.amount -= x;
            character.trade_stash.inc(order.material, -x);
        }
    }
    MarketOrders.decrease_amount = decrease_amount;
    function spoilage(character, good, rate) {
        let orders = data_id_1.DataID.Character.market_orders_list(character.id);
        let integer = (Math.random() < 0.5) ? 1 : 0;
        for (let order of orders) {
            let order_item = data_objects_1.Data.MarketOrders.from_id(order);
            const current_amount = order_item.amount;
            if (order_item.material != good)
                continue;
            let spoiled_amount = Math.min(current_amount, Math.max(integer, Math.floor(current_amount * 0.01)));
            MarketOrders.decrease_amount(order, spoiled_amount);
        }
        effects_1.Effect.Update.cell_market(character.cell_id);
    }
    MarketOrders.spoilage = spoilage;
})(MarketOrders || (exports.MarketOrders = MarketOrders = {}));
var ItemOrders;
(function (ItemOrders) {
    function create(owner, item, price, finished) {
        data_objects_1.Data.Items.from_id(item).price = price;
    }
    ItemOrders.create = create;
    function remove(item, who) {
        data_objects_1.Data.Items.from_id(item).price = undefined;
        return AuctionResponse.OK;
    }
    ItemOrders.remove = remove;
    function remove_all_character(who) {
        // console.log('attempt to remove item orders')
        for (let order of who.equip.data.backpack.items) {
            if (order == undefined)
                continue;
            remove(order, who);
        }
    }
    ItemOrders.remove_all_character = remove_all_character;
    function sell(seller, backpack_id, price) {
        const item = seller.equip.data.backpack.items[backpack_id];
        if (item == undefined) {
            return { response: AuctionResponse.EMPTY_BACKPACK_SLOT };
        }
        create(seller, item, price, false);
        // seller.equip.data.backpack.remove(backpack_id)
        return { response: AuctionResponse.OK };
    }
    ItemOrders.sell = sell;
    function count_armour_orders_of_type_of_character(id, character) {
        let result = 0;
        for (let order of character.equip.data.backpack.items) {
            if (order == undefined)
                continue;
            const data = data_objects_1.Data.Items.from_id(order);
            if ((0, item_1.is_armour)(data)) {
                if (data.prototype.id == id) {
                    result += 1;
                }
            }
        }
        return result;
    }
    ItemOrders.count_armour_orders_of_type_of_character = count_armour_orders_of_type_of_character;
    function count_armour_orders_of_type(cell, id) {
        let result = 0;
        data_objects_1.Data.Cells.for_each_guest(cell, (character) => {
            result += count_armour_orders_of_type_of_character(id, character);
        });
        return result;
    }
    ItemOrders.count_armour_orders_of_type = count_armour_orders_of_type;
    function count_weapon_orders_of_type_of_character(id, character) {
        let result = 0;
        for (let order of character.equip.data.backpack.items) {
            if (order == undefined)
                continue;
            const data = data_objects_1.Data.Items.from_id(order);
            if ((0, item_1.is_weapon)(data)) {
                if (data.prototype.id == id) {
                    result += 1;
                }
            }
        }
        return result;
    }
    ItemOrders.count_weapon_orders_of_type_of_character = count_weapon_orders_of_type_of_character;
    function count_weapon_orders_of_type(cell, id) {
        let result = 0;
        data_objects_1.Data.Cells.for_each_guest(cell, (character) => {
            result += count_weapon_orders_of_type_of_character(id, character);
        });
        return result;
    }
    ItemOrders.count_weapon_orders_of_type = count_weapon_orders_of_type;
    function buy(id, buyer, seller) {
        let item = data_objects_1.Data.Items.from_id(seller.equip.data.backpack.items[id]);
        if (item == undefined)
            return AuctionResponse.INVALID_ORDER;
        if (item.price == undefined)
            return AuctionResponse.INVALID_ORDER;
        // make sure that they are in the same cell
        if (seller.cell_id != buyer.cell_id) {
            return AuctionResponse.NOT_IN_THE_SAME_CELL;
        }
        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != seller.id) && (buyer.savings.get() < item.price)) {
            return AuctionResponse.NOT_ENOUGH_MONEY;
        }
        buyer.savings.transfer(seller.savings, item.price);
        seller.equip.data.backpack.remove(id);
        buyer.equip.data.backpack.add(item.id);
        item.price = undefined;
        return AuctionResponse.OK;
    }
    ItemOrders.buy = buy;
})(ItemOrders || (exports.ItemOrders = ItemOrders = {}));

