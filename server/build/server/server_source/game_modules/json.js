"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONficate = void 0;
const systems_communication_1 = require("./systems_communication");
var JSONficate;
(function (JSONficate) {
    function market_order_bulk(order) {
        let owner = systems_communication_1.Convert.id_to_character(order.owner_id);
        return {
            typ: order.typ,
            tag: order.tag,
            owner_id: order.owner_id,
            owner_name: owner.get_name(),
            amount: order.amount,
            price: order.price,
            id: order.id,
            // cell_id: order.cell_id
        };
    }
    JSONficate.market_order_bulk = market_order_bulk;
})(JSONficate = exports.JSONficate || (exports.JSONficate = {}));
