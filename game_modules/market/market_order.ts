import { material_index } from "../manager_classes/materials_manager.js";
import { auction_order_id, cell_id, char_id, market_order_id, money, order_item_id } from "../types.js";


export interface MarketOrderBulkJson {
    typ: 'sell'|'buy',
    tag: material_index,
    owner_id: number,
    owner_name: string|undefined,
    amount: number
    price: money
    id: market_order_id
    cell_id: number
}

export class OrderBulk {
    id: market_order_id;
    owner_id: char_id
    cell_id: cell_id

    typ: 'sell'|'buy'
    tag: material_index
    amount: number
    price: money
    
    constructor(id: market_order_id, amount: number, price: money, typ: 'sell'|'buy', tag: material_index, owner_id: char_id, cell_id: cell_id) {
        this.id = id
        this.typ = typ
        this.tag = tag
        this.owner_id = owner_id
        this.amount = amount
        this.price = price
        this.cell_id = cell_id
    }
}


export class OrderItem {
    item: Weapon|Armour;
    owner_id: char_id;
    price: money
    id: order_item_id
    finished: boolean

    constructor(id: order_item_id, item: Weapon|Armour, price: money, owner_id: char_id, finished: boolean) {
        this.id = id;

        this.item = item;
        this.price = price;
        this.finished = finished

        this.owner_id = owner_id;
    }
}