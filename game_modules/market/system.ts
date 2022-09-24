import { OrderItemSocketData } from "../../shared/market_order_data";
import { Character } from "../base_game_classes/character/character";
import { CharacterSystem } from "../base_game_classes/character/system";
import { Item } from "../base_game_classes/items/item";
import { ItemSystem } from "../base_game_classes/items/system"
import { material_index } from "../manager_classes/materials_manager";
import { cell_id, money, order_bulk_id, order_item_id } from "../types";
import { OrderBulk, OrderItem, OrderItemJson } from "./classes";

var orders_bulk:OrderBulk[] = []
var orders_item:OrderItem[] = []
var last_id_bulk = 0
var last_id_item = 0

enum AuctionResponce {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    NO_SUCH_ORDER = 'no_such_order',
    OK = 'ok',
    NOT_ENOUGH_MONEY = 'not_enough_money',
    INVALID_ORDER = 'invalid_order'
}


// this file does not handle networking


export namespace BulkOrders {
    export function save() {

    }

    export function load() {

    }

    export function create(amount: number, price: money, typ:'sell'|'buy', tag: material_index, owner: Character) {
        last_id_bulk = last_id_bulk + 1
        let order = new OrderBulk(last_id_bulk as order_bulk_id, amount, price, typ, tag, owner.id)
        orders_bulk[last_id_bulk] = order        
        return order
    }
}

export namespace ItemOrders {
    export function save() {

    }

    export function load() {

    }

    export function number_to_id(id: number): order_item_id|undefined {
        if (orders_item[id] == undefined) return undefined
        return id as order_item_id
    }

    export function id_to_order(id: order_item_id) {
        return orders_item[id]
    }

    export function create(owner: Character, item: Item, price: money, finished: boolean) {
        last_id_item = last_id_item + 1
        let order = new OrderItem(last_id_item as order_item_id, item, price as money, owner.id, finished)
        orders_item[last_id_item] = order
        return order
    }

    export function remove(id: order_item_id, who: Character) {
        const order = id_to_order(id)

        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER
        }

        const owner = CharacterSystem.id_to_character(order.owner_id)

        order.finished = true
        owner.equip.add_item(order.item)
        return AuctionResponce.OK
    }

    export function remove_unsafe(id: number, who: Character) {
        const true_id = number_to_id(id)
        if (true_id == undefined) return AuctionResponce.NO_SUCH_ORDER    
        return remove(true_id, who)
    }

    export function remove_all_character(who:Character) {
        for (let order of orders_item) {
            if (order == undefined) continue;
            if (order.finished) continue;
            console.log(order.owner_id, who.id)
            remove(order.id, who)
        }
    }
    
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

    export function order_to_socket_data(order: OrderItem):OrderItemSocketData {
        let owner = CharacterSystem.id_to_character(order.owner_id)
        return {
            seller_name: owner.name,
            price: order.price,
            item_name: order.item.tag(),
            affixes: [],
            id: order.id
        }
    }

    export function json_to_order(data: OrderItemJson) {
        let item = ItemSystem.create(data.item)
        let order = new OrderItem(data.id, item, data.price, data.owner_id, data.finished)
        return order
    }

    export function sell(seller: Character, backpack_id: number, price: money){
        const item = seller.equip.data.backpack.get_item[backpack_id]
        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }
        const order = create(seller, item, price, false)
        return {responce: AuctionResponce.OK}
    }

    export function buy(id: order_item_id, buyer: Character) {
        const order = id_to_order(id) 
        const owner = CharacterSystem.id_to_character(order.owner_id)

        // make sure that they are in the same cell
        if (owner.cell_id != buyer.cell_id) {return AuctionResponce.NOT_IN_THE_SAME_CELL}
        
        // make sure that buyer has enough money
        // but owner can buy it from himself
        if ((buyer.id != order.owner_id)&&(buyer.savings.get() < order.price)) {return AuctionResponce.NOT_ENOUGH_MONEY}
        
        // make sure that this order is still available to avoid duplication
        if (order.finished) {return AuctionResponce.INVALID_ORDER}

        
        order.finished = true
        buyer.savings.transfer(owner.savings, order.price)
        buyer.equip.add_item(order.item)

        return AuctionResponce.OK
    }

    export function buy_unsafe(id: number, buyer: Character) {
        let true_id = number_to_id(id)
        if (true_id == undefined) return AuctionResponce.NO_SUCH_ORDER
        return buy(true_id, buyer)
    }
}


export function cell_id_to_orders_list(manager: EntityManager, cell_id: number): OrderItem[] {
    let tmp = []
    for (let order of manager.item_orders) {
        if (order == undefined) continue;
        if (order.flags.finished) continue;
        if (order.owner.cell_id == cell_id) {
            tmp.push(order)
        }
    }
    return tmp
}

export function cell_id_to_orders_socket_data_list(manager: EntityManager, cell_id: number): OrderItemSocketData[] {
    let tmp = []
    for (let order of manager.item_orders) {
        if (order == undefined) continue;
        if (order.flags.finished) continue;
        if (order.owner.cell_id == cell_id) {
            tmp.push(AuctionOrderManagement.order_to_socket_data(order))
        }
    }
    return tmp
}

export function cell_id_to_orders_json_list(manager: EntityManager, cell_id: number): OrderItemJson[] {
    let tmp = []
    for (let order of manager.item_orders) {
        if (order == undefined) continue;
        if (order.flags.finished) continue;
        if (order.owner.cell_id == cell_id) {
            tmp.push(AuctionOrderManagement.order_to_json(order))
        }
    }
    return tmp
}