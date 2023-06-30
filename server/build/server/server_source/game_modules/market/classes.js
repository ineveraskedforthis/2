"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBulk = void 0;
class OrderBulk {
    constructor(id, amount, price, typ, tag, owner_id) {
        this.id = id;
        this.typ = typ;
        this.tag = tag;
        this.owner_id = owner_id;
        this.amount = amount;
        this.price = price;
        // this.cell_id = cell_id
    }
}
exports.OrderBulk = OrderBulk;
// export interface OrderItemJson {
//     id: order_item_id
//     owner_id: char_id
//     item: ItemJson
//     price: money
//     finished: boolean
// } 
// export class OrderItem {
//     id: order_item_id
//     owner_id: char_id;
//     // cell_id: cell_id
//     item: Item;
//     price: money
//     finished: boolean
//     constructor(id: order_item_id, item: Item, price: money, owner_id: char_id, finished: boolean) {
//         this.id = id;
//         this.owner_id = owner_id;
//         // this.cell_id = cell_id;
//         this.item = item;
//         this.price = price;
//         this.finished = finished        
//     }
// }
