import { Item, ItemJson } from "../items/item.js";
import { material_index } from "../manager_classes/materials_manager.js";
import { cell_id, char_id, money, order_bulk_id, order_item_id } from "../types.js";

// cell_id is commented as i decided to tie orders directly to location of character

export interface OrderBulkJson {
    typ: 'sell'|'buy',
    tag: material_index,
    owner_id: char_id,
    owner_name: string|undefined,
    amount: number
    price: money
    id: order_bulk_id
    // cell_id: number
}

export class OrderBulk {
    id: order_bulk_id;
    owner_id: char_id
    // cell_id: cell_id

    typ: 'sell'|'buy'
    tag: material_index
    amount: number
    price: money
    
    constructor(id: order_bulk_id, amount: number, price: money, typ: 'sell'|'buy', tag: material_index, owner_id: char_id) {
        this.id = id
        this.typ = typ
        this.tag = tag
        this.owner_id = owner_id
        this.amount = amount
        this.price = price
        // this.cell_id = cell_id
    }
}

export interface OrderItemJson {
    id: order_item_id
    owner_id: char_id
    item: ItemJson
    price: money
    finished: boolean
} 

export class OrderItem {
    id: order_item_id
    owner_id: char_id;
    // cell_id: cell_id
    
    item: Item;
    price: money
    
    finished: boolean

    constructor(id: order_item_id, item: Item, price: money, owner_id: char_id, finished: boolean) {
        this.id = id;
        this.owner_id = owner_id;
        // this.cell_id = cell_id;

        this.item = item;
        this.price = price;
        this.finished = finished        
    }
}