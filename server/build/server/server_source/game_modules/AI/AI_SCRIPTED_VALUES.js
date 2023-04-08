"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AItrade = void 0;
const helpers_1 = require("./helpers");
var AItrade;
(function (AItrade) {
    function buy_price_bulk(character, material) {
        let base = (0, helpers_1.base_price)(character.cell_id, material);
        if (character.archetype.ai_map == 'urban_trader') {
            return Math.floor(base * 0.8);
        }
        return base;
    }
    AItrade.buy_price_bulk = buy_price_bulk;
    function sell_price_bulk(character, material) {
        let base = (0, helpers_1.base_price)(character.cell_id, material);
        if (character.archetype.ai_map == 'urban_trader') {
            return Math.floor(base * 1.5);
        }
        return base;
    }
    AItrade.sell_price_bulk = sell_price_bulk;
})(AItrade = exports.AItrade || (exports.AItrade = {}));
