import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { Stash } from "../inventories/stash";
import { Item } from "../items/item";
import { ItemSystem } from "../items/system"
import { material_index } from "@custom_types/inventory";
import { Convert } from "../systems_communication";
import { character_id, market_order_id } from "@custom_types/common";
import { MarketOrder, MarketOrderJson } from "./classes";
import { money } from "@custom_types/common";
import { Data } from "../data/data_objects";
import { DataID } from "../data/data_id";

export enum AuctionResponce {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    NO_SUCH_ORDER = 'no_such_order',
    OK = 'ok',
    NOT_ENOUGH_MONEY = 'not_enough_money',
    INVALID_ORDER = 'invalid_order'
}


const empty_stash = new Stash()

// this file does not handle networking


export namespace MarketOrders {
    export function execute_sell_order(id: market_order_id, amount: number, buyer: Character) {
        const order = Data.MarketOrders.from_id(id)
        const owner = Data.Characters.from_id(order.owner_id)
        const pay = amount * order.price as money

        if (order.amount < amount) amount = order.amount
        if (buyer.savings.get() < pay)  return 'not_enough_money'

        const material = order.material

        // shadow operations with imaginary items
        order.amount -= amount;
        const transaction_stash = new Stash()
        transaction_stash.inc(material, amount)
        CharacterSystem.to_trade_stash(owner, order.material, -amount)

        //actual transaction
        CharacterSystem.transaction(owner, buyer,
                                    0 as money  , transaction_stash,
                                    pay         , empty_stash       )
        return 'ok'
    }

    export function remove(id: market_order_id) {
        const order = Data.MarketOrders.from_id(id)
        const character = Data.Characters.from_id(order.owner_id)
        if (order.typ == 'buy') {
            character.trade_savings.transfer(character.savings, order.amount * order.price as money)
        }
        if (order.typ == 'sell') {
            character.trade_stash.transfer(character.stash, order.material, order.amount)
        }
        order.amount = 0
    }

    export function remove_by_condition(character: Character, tag: material_index) {
        const list = DataID.Character.market_orders_list(character.id)
        for (const id of list) {
            const order = Data.MarketOrders.from_id(id)
            if (order.material == tag) {
                remove(id)
            }
        }
    }

    export function execute_buy_order(id:market_order_id, amount: number, seller: Character) {
        const order = Data.MarketOrders.from_id(id)
        const owner = Data.Characters.from_id(order.owner_id)

        if (order.amount < amount) amount = order.amount
        if (seller.stash.get(order.material) < amount) amount = seller.stash.get(order.material)

        const pay = amount * order.price as money
        const material = order.material

        // shadow operations
        order.amount -= amount;
        const transaction_stash = new Stash()
        transaction_stash.inc(material, amount)
        CharacterSystem.to_trade_savings(owner, -pay as money)

        //transaction
        CharacterSystem.transaction(owner, seller,
                                    pay          , empty_stash,
                                    0 as money   , transaction_stash)
        return 'ok'
    }

    export function new_buy_order(material: material_index, amount: number, price: money, owner: Character) {
        //validation of input
        price = Math.floor(price) as money
        amount = Math.floor(amount)
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.savings.get() < price * amount) return 'not_enough_savings'

        CharacterSystem.to_trade_savings(owner, amount * price as money)
        const order = Data.MarketOrders.create(amount, price, 'buy', material, owner.id)
        return 'ok'
    }

    export function new_sell_order(material: material_index, amount: number, price: money, owner: Character) {
        //validation of input
        price = Math.floor(price) as money
        amount = Math.floor(amount)
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.stash.get(material) < amount) return 'not_enough_material'

        CharacterSystem.to_trade_stash(owner, material, amount)
        const order = Data.MarketOrders.create(amount, price, 'sell', material, owner.id)
        return 'ok'
    }

    export function decrease_amount(id: market_order_id, x: number) {
        const order = Data.MarketOrders.from_id(id)

        if (order.typ == 'sell') {
            const character = Data.Characters.from_id(order.owner_id)
            order.amount -= x
            character.trade_stash.inc(order.material, -x)
        }
    }
}

export namespace ItemOrders {
    export function create(owner: Character, item: Item, price: money, finished: boolean) {
        item.price = price
    }

    export function remove(item: Item, who: Character) {
        item.price = undefined
        return AuctionResponce.OK
    }

    export function remove_all_character(who:Character) {
        // console.log('attempt to remove item orders')
        for (let order of who.equip.data.backpack.items) {
            if (order == undefined) continue;
            remove(order, who)
        }
    }

    export function sell(seller: Character, backpack_id: number, price: money){
        const item = seller.equip.data.backpack.items[backpack_id]
        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }
        create(seller, item, price, false)
        // seller.equip.data.backpack.remove(backpack_id)
        return {responce: AuctionResponce.OK}
    }

    export function buy(id: number, buyer: Character, seller: Character) {
        let item = seller.equip.data.backpack.items[id]
        if (item == undefined) return AuctionResponce.INVALID_ORDER
        if (item.price == undefined) return AuctionResponce.INVALID_ORDER

        // make sure that they are in the same cell
        if (seller.cell_id != buyer.cell_id) {return AuctionResponce.NOT_IN_THE_SAME_CELL}

        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != seller.id)&&(buyer.savings.get() < item.price)) {return AuctionResponce.NOT_ENOUGH_MONEY}

        buyer.savings.transfer(seller.savings, item.price)
        seller.equip.data.backpack.remove(id)
        buyer.equip.data.backpack.add(item)
        item.price = undefined

        return AuctionResponce.OK
    }
}
