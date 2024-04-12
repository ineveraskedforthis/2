"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONficate = void 0;
const data_objects_1 = require("./data/data_objects");
var JSONficate;
(function (JSONficate) {
    function market_order_bulk(order) {
        let owner = data_objects_1.Data.Characters.from_id(order.owner_id);
        return {
            typ: order.typ,
            tag: order.material,
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
