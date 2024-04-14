"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AItrade = exports.base_price = void 0;
const CraftBulk_1 = require("../craft/CraftBulk");
function base_price(cell_id, material) {
    return 50;
}
exports.base_price = base_price;
var AItrade;
(function (AItrade) {
    function buy_price_bulk(character, material) {
        let base = base_price(character.cell_id, material);
        let belief = character.ai_price_belief_buy.get(material);
        if (belief != undefined)
            base = belief;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(base * 0.8) as money;
        // }
        return base;
    }
    AItrade.buy_price_bulk = buy_price_bulk;
    function sell_price_bulk(character, material) {
        let belief = character.ai_price_belief_sell.get(material);
        if (belief == undefined)
            return base_price(character.cell_id, material);
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(belief * 1.2) as money
        // }
        return belief;
    }
    AItrade.sell_price_bulk = sell_price_bulk;
    function price_norm(character, items_vector) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * item.price;
        }
        return norm;
    }
    AItrade.price_norm = price_norm;
    function price_norm_box(character, items_vector, price_estimator) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * price_estimator(character, item.material);
        }
        return norm;
    }
    AItrade.price_norm_box = price_norm_box;
    function craft_bulk_profitability(character, craft) {
        const input_price = price_norm_box(character, craft.input, buy_price_bulk);
        const output_price = price_norm_box(character, (0, CraftBulk_1.output_bulk)(character, craft), sell_price_bulk);
        const profit = output_price - input_price;
        return profit;
    }
    AItrade.craft_bulk_profitability = craft_bulk_profitability;
})(AItrade || (exports.AItrade = AItrade = {}));

