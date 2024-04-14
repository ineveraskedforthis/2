"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketOrder = void 0;
const data_id_js_1 = require("../data/data_id.js");
class MarketOrder {
    constructor(id, amount, price, typ, tag, owner_id) {
        if (id == undefined) {
            this.id = data_id_js_1.DataID.MarketOrders.new_id(owner_id);
        }
        else {
            this.id = id;
            data_id_js_1.DataID.MarketOrders.register(id, owner_id);
        }
        this.typ = typ;
        this.material = tag;
        this.amount = amount;
        this.price = price;
    }
    get owner_id() {
        return data_id_js_1.DataID.MarketOrders.owner(this.id);
    }
    toJSON() {
        return {
            id: this.id,
            owner_id: this.owner_id,
            amount: this.amount,
            material: this.material,
            price: this.price,
            typ: this.typ
        };
    }
}
exports.MarketOrder = MarketOrder;

