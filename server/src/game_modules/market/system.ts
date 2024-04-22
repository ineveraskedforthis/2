import { ARMOUR, MATERIAL, WEAPON } from "@content/content";
import { money } from "@custom_types/common";
import { cell_id, item_id, market_order_id } from "@custom_types/ids";
import { is_armour, is_weapon } from "../../content_wrappers/item";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";
import { Character } from "../data/entities/character";
import { Stash } from "../data/entities/stash";
import { CHANGE_REASON, Effect } from "../effects/effects";

export enum AuctionResponse {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    NO_SUCH_ORDER = 'no_such_order',
    OK = 'ok',
    NOT_ENOUGH_MONEY = 'not_enough_money',
    INVALID_ORDER = 'invalid_order'
}


const empty_stash = new Stash()

// this file does not handle networking

interface MarkerResponseBuyOK {
    tag: "ok",
    amount: number
}

interface MarketResponseBuyNotEnoughMoney {
    tag: 'not_enough_money'
}

interface MarkerResponseSell {
    tag: "ok",
    amount: number
}


export namespace MarketOrders {
    export function execute_sell_order(id: market_order_id, amount: number, buyer: Character) : MarkerResponseBuyOK | MarketResponseBuyNotEnoughMoney {
        const order = Data.MarketOrders.from_id(id)
        const owner = Data.Characters.from_id(order.owner_id)
        const pay = amount * order.price as money

        if (order.amount < amount) amount = order.amount
        if (buyer.savings.get() < pay) return {tag: 'not_enough_money'}

        const material = order.material

        // shadow operations with imaginary items
        order.amount -= amount;
        const transaction_stash = new Stash()
        transaction_stash.inc(material, amount)
        Effect.Transfer.to_trade_stash(owner, order.material, -amount)

        //actual transaction
        Effect.transaction(owner, buyer,
                                    0 as money  , transaction_stash,
                                    pay         , empty_stash       , CHANGE_REASON.TRADE)

        return {tag: "ok", amount: amount}
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

    export function remove_by_condition(character: Character, tag: MATERIAL) {
        const list = DataID.Character.market_orders_list(character.id)
        for (const id of list) {
            const order = Data.MarketOrders.from_id(id)
            if (order.material == tag) {
                remove(id)
            }
        }
    }

    export function remove_by_character(character:Character) {
        const list = DataID.Character.market_orders_list(character.id)
        for (const id of list) {
            remove(id)
        }
    }

    export function execute_buy_order(id:market_order_id, amount: number, seller: Character) : MarkerResponseSell {
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
        Effect.Transfer.to_trade_savings(owner, -pay as money)

        //transaction
        Effect.transaction(owner, seller,
                                    pay          , empty_stash,
                                    0 as money   , transaction_stash, CHANGE_REASON.TRADE)
        return {
            tag: "ok",
            amount: amount
        }
    }

    export function new_buy_order(material: MATERIAL, amount: number, price: money, owner: Character) {
        //validation of input
        price = Math.floor(price) as money
        amount = Math.floor(amount)
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.savings.get() < price * amount) return 'not_enough_savings'

        Effect.Transfer.to_trade_savings(owner, amount * price as money)
        const order = Data.MarketOrders.create(amount, price, 'buy', material, owner.id)
        return 'ok'
    }

    export function new_sell_order(material: MATERIAL, amount: number, price: money, owner: Character) {
        //validation of input
        price = Math.floor(price) as money
        amount = Math.floor(amount)
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.stash.get(material) < amount) return 'not_enough_material'

        Effect.Transfer.to_trade_stash(owner, material, amount)
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

    export function spoilage(character: Character, good: MATERIAL, rate: number) {
        let orders = DataID.Character.market_orders_list(character.id)
        let integer = (Math.random() < 0.5) ? 1 : 0

        for (let order of orders) {
            let order_item = Data.MarketOrders.from_id(order)
            const current_amount = order_item.amount
            if (order_item.material != good) continue
            let spoiled_amount = Math.min(current_amount, Math.max(integer, Math.floor(current_amount * 0.01)))
            MarketOrders.decrease_amount(order, spoiled_amount)
        }

        Effect.Update.cell_market(character.cell_id)
    }
}

export namespace ItemOrders {
    export function create(owner: Character, item: item_id, price: money, finished: boolean) {
        Data.Items.from_id(item).price = price
    }

    export function remove(item: item_id, who: Character) {
        Data.Items.from_id(item).price = undefined
        return AuctionResponse.OK
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
            return {response: AuctionResponse.EMPTY_BACKPACK_SLOT}
        }
        create(seller, item, price, false)
        // seller.equip.data.backpack.remove(backpack_id)
        return {response: AuctionResponse.OK}
    }

    export function count_armour_orders_of_type_of_character(id: ARMOUR, character: Character) : number {
        let result = 0

        for (let order of character.equip.data.backpack.items) {
            if (order == undefined) continue;
            const data = Data.Items.from_id(order)
            if (is_armour(data)) {
                if (data.prototype.id == id) {
                    result += 1
                }
            }
        }

        return result
    }

    export function count_armour_orders_of_type(cell: cell_id, id: ARMOUR) {
        let result = 0

        Data.Cells.for_each_guest(cell, (character) => {
            result += count_armour_orders_of_type_of_character(id, character)
        })

        return result
    }

    export function count_weapon_orders_of_type_of_character(id: WEAPON, character: Character) : number {
        let result = 0

        for (let order of character.equip.data.backpack.items) {
            if (order == undefined) continue;
            const data = Data.Items.from_id(order)
            if (is_weapon(data)) {
                if (data.prototype.id == id) {
                    result += 1
                }
            }
        }

        return result
    }

    export function count_weapon_orders_of_type(cell: cell_id, id: WEAPON) {
        let result = 0

        Data.Cells.for_each_guest(cell,(character) => {
            result += count_weapon_orders_of_type_of_character(id, character)
        })

        return result
    }

    export function buy(id: number, buyer: Character, seller: Character) {
        let item = Data.Items.from_id(seller.equip.data.backpack.items[id])
        if (item == undefined) return AuctionResponse.INVALID_ORDER
        if (item.price == undefined) return AuctionResponse.INVALID_ORDER

        // make sure that they are in the same cell
        if (seller.cell_id != buyer.cell_id) {return AuctionResponse.NOT_IN_THE_SAME_CELL}

        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != seller.id)&&(buyer.savings.get() < item.price)) {return AuctionResponse.NOT_ENOUGH_MONEY}

        buyer.savings.transfer(seller.savings, item.price)
        seller.equip.data.backpack.remove(id)
        buyer.equip.data.backpack.add(item.id)
        item.price = undefined

        return AuctionResponse.OK
    }
}
