"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOrders = void 0;
const market_order_1 = require("./market_order");
var orders_bulk = [];
var last_id = 0;
var BulkOrders;
(function (BulkOrders) {
    function save() {
    }
    function load() {
    }
    function create(amount, price, typ, tag, owner) {
        console.log('new market order');
        let order = new market_order_1.OrderBulk(last_id, amount, price, typ, tag, owner.id, owner.cell_id);
        orders_bulk.push(order);
        return order;
    }
})(BulkOrders = exports.BulkOrders || (exports.BulkOrders = {}));
