import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { Stash } from "../inventories/stash";
import { Item } from "../items/item";
import { ItemSystem } from "../items/system"
import { Data } from "../data";
import { material_index } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { cell_id, char_id, money, order_bulk_id, order_item_id } from "../types";
import { OrderBulk, OrderBulkJson, OrderItem, OrderItemJson } from "./classes";

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


export namespace BulkOrders {
    // does not shadow resources, shadowing happens in create_type_order functions
    // private
    function create(amount: number, price: money, typ:'sell'|'buy', tag: material_index, owner: Character) {
        Data.BulkOrders.increase_id()
        let order = new OrderBulk(Data.BulkOrders.id(), amount, price, typ, tag, owner.id)
        Data.BulkOrders.set(Data.BulkOrders.id(), owner.id, order)
        return order
    }

    export function remove(id: order_bulk_id) {
        const order = Data.BulkOrders.from_id(id)
        const character = Data.CharacterDB.from_id(order.owner_id)
        if (order.typ == 'buy') {
            character.trade_savings.transfer(character.savings, order.amount * order.price as money)
        }
        if (order.typ == 'sell') {
            character.trade_stash.transfer(character.stash, order.tag, order.amount)
        }
        order.amount = 0
    }
    
    export function remove_by_condition(character: Character, tag: material_index) {
        const set = Data.BulkOrders.from_char_id(character.id)
        if (set == undefined) return
        for (let [_, id] of set.entries()) {
            const order = Data.BulkOrders.from_id(id)
            if (order.tag == tag) {
                remove(id)
            }
        }
    }

    export function execute_sell_order(id: order_bulk_id, amount: number, buyer: Character) {
        const order = Data.BulkOrders.from_id(id)
        const owner = Convert.id_to_character(order.owner_id)
        const pay = amount * order.price as money

        if (order.amount < amount) amount = order.amount
        if (buyer.savings.get() < pay)  return 'not_enough_money'

        const material = order.tag        

        // shadow operations with imaginary items
        order.amount -= amount;
        const transaction_stash = new Stash()
        transaction_stash.inc(material, amount)
        CharacterSystem.to_trade_stash(owner, order.tag, -amount)

        //actual transaction
        CharacterSystem.transaction(owner, buyer, 
                                    0 as money  , transaction_stash, 
                                    pay         , empty_stash       )
        return 'ok'        
    }

    export function execute_buy_order(id:order_bulk_id, amount: number, seller: Character) {
        const order = Data.BulkOrders.from_id(id)
        const owner = Convert.id_to_character(order.owner_id)
        
        if (order.amount < amount) amount = order.amount    
        if (seller.stash.get(order.tag) < amount) amount = seller.stash.get(order.tag)
        
        const pay = amount * order.price as money
        const material = order.tag   

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
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.savings.get() < price * amount) return 'not_enough_savings'

        CharacterSystem.to_trade_savings(owner, amount * price as money)
        const order = create(amount, price, 'buy', material, owner)
        return 'ok'
    }

    export function new_sell_order(material: material_index, amount: number, price: money, owner: Character) {
        //validation of input
        if (price < 0) return 'invalid_price'
        if (amount <= 0) return 'invalid_amount'
        if (owner.stash.get(material) < amount) return 'not_enough_material'

        CharacterSystem.to_trade_stash(owner, material, amount)
        const order = create(amount, price, 'sell', material, owner)
        return 'ok'
    }
}

export namespace ItemOrders {
    export function create(owner: Character, item: Item, price: money, finished: boolean) {
        Data.ItemOrders.increase_id()
        let order = new OrderItem(Data.ItemOrders.id() as order_item_id, item, price as money, owner.id, finished)
        Data.ItemOrders.set(Data.ItemOrders.id(), owner.id, order)
        return order
    }

    export function remove(id: order_item_id, who: Character) {
        const order = Data.ItemOrders.from_id(id)

        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER
        }

        const owner = Convert.id_to_character(order.owner_id)

        order.finished = true
        owner.equip.data.backpack.add(order.item)
        return AuctionResponce.OK
    }

    export function remove_unsafe(id: number, who: Character) {
        const true_id = Convert.number_to_order_item_id(id)
        if (true_id == undefined) return AuctionResponce.NO_SUCH_ORDER    
        return remove(true_id, who)
    }

    export function remove_all_character(who:Character) {
        // console.log('attempt to remove item orders')
        for (let order of Data.ItemOrders.list()) {
            if (order == undefined) continue;
            if (order.finished) continue;
            if (order.owner_id != who.id) continue;
            // console.log(order.owner_id, who.id)
            remove(order.id, who)
        }
    }
    
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

    

    export function sell(seller: Character, backpack_id: number, price: money){
        const item = seller.equip.data.backpack.items[backpack_id]
        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }
        const order = create(seller, item, price, false)
        seller.equip.data.backpack.remove(backpack_id)
        return {responce: AuctionResponce.OK}
    }

    export function buy(id: order_item_id, buyer: Character) {
        const order = Data.ItemOrders.from_id(id) 
        const owner = Convert.id_to_character(order.owner_id)

        // make sure that they are in the same cell
        if (owner.cell_id != buyer.cell_id) {return AuctionResponce.NOT_IN_THE_SAME_CELL}
        
        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != order.owner_id)&&(buyer.savings.get() < order.price)) {return AuctionResponce.NOT_ENOUGH_MONEY}
        
        // make sure that this order is still available to avoid duplication
        if (order.finished) {return AuctionResponce.INVALID_ORDER}

        
        order.finished = true
        buyer.savings.transfer(owner.savings, order.price)
        buyer.equip.data.backpack.add(order.item)

        return AuctionResponce.OK
    }

    export function buy_unsafe(id: number, buyer: Character) {
        let true_id = Convert.number_to_order_item_id(id)
        if (true_id == undefined) return AuctionResponce.NO_SUCH_ORDER
        return buy(true_id, buyer)
    }
}


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