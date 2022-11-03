"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare_market_orders = void 0;
const system_1 = require("../market/system");
function prepare_market_orders(cell_id) {
    let data = system_1.BulkOrders.from_cell_id(cell_id);
    let orders_array = Array.from(data);
    let responce = [];
    for (let order_id of orders_array) {
        const order = system_1.BulkOrders.id_to_order(order_id);
        if (order.amount > 0) {
            responce.push(system_1.BulkOrders.json(order));
        }
    }
    return responce;
}
exports.prepare_market_orders = prepare_market_orders;
