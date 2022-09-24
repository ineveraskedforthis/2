"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.OrderBulk = void 0;
class OrderBulk {
    constructor(id, amount, price, typ, tag, owner_id, cell_id) {
        this.id = id;
        this.typ = typ;
        this.tag = tag;
        this.owner_id = owner_id;
        this.amount = amount;
        this.price = price;
        this.cell_id = cell_id;
    }
}
exports.OrderBulk = OrderBulk;
class OrderItem {
    constructor(id, item, price, owner_id, cell_id, finished) {
        this.id = id;
        this.owner_id = owner_id;
        this.cell_id = cell_id;
        this.item = item;
        this.price = price;
        this.finished = finished;
    }
}
exports.OrderItem = OrderItem;
