"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare_market_orders = void 0;
const json_1 = require("../json");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
function prepare_market_orders(cell_id) {
    let data = data_id_1.DataID.Cells.market_order_id_list(cell_id);
    let orders_array = Array.from(data);
    let response = [];
    for (let order_id of orders_array) {
        const order = data_objects_1.Data.MarketOrders.from_id(order_id);
        if (order.amount > 0) {
            response.push(json_1.JSONficate.market_order_bulk(order));
        }
    }
    return response;
}
exports.prepare_market_orders = prepare_market_orders;
