"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("./base_game_classes/character/system");
var JSONficate;
(function (JSONficate) {
    function market_order_bulk(order) {
        let owner = system_1.CharacterSystem.id_to_character(order.owner_id);
        return {
            typ: order.typ,
            tag: order.tag,
            owner_id: order.owner_id,
            owner_name: owner.name,
            amount: order.amount,
            price: order.price,
            id: order.id,
            // cell_id: order.cell_id
        };
    }
    JSONficate.market_order_bulk = market_order_bulk;
})(JSONficate || (JSONficate = {}));
