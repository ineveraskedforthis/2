"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AItrade = void 0;
// import { money } from "../types";
const helpers_1 = require("./helpers");
var AItrade;
(function (AItrade) {
    function buy_price_bulk(character, material) {
        let base = (0, helpers_1.base_price)(character.cell_id, material);
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
            return 1;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(belief * 1.2) as money
        // }
        return belief;
    }
    AItrade.sell_price_bulk = sell_price_bulk;
})(AItrade = exports.AItrade || (exports.AItrade = {}));
