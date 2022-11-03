"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare_market_orders = void 0;
const json_1 = require("../json");
const systems_communication_1 = require("../systems_communication");
function prepare_market_orders(cell_id) {
    let data = systems_communication_1.Convert.cell_id_to_bulk_orders(cell_id);
    let orders_array = Array.from(data);
    let responce = [];
    for (let order_id of orders_array) {
        const order = systems_communication_1.Convert.id_to_bulk_order(order_id);
        if (order.amount > 0) {
            responce.push(json_1.JSONficate.market_order_bulk(order));
        }
    }
    return responce;
}
exports.prepare_market_orders = prepare_market_orders;
