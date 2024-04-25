"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare_market_orders = void 0;
const json_1 = require("../json");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
function prepare_market_orders(cell_id) {
    let response = [];
    data_id_1.DataID.Cells.for_each_market_order(cell_id, (item) => {
        let order = data_objects_1.Data.MarketOrders.from_id(item);
        if (order.amount > 0) {
            response.push(json_1.JSONficate.market_order_bulk(order));
        }
    });
    return response;
}
exports.prepare_market_orders = prepare_market_orders;
