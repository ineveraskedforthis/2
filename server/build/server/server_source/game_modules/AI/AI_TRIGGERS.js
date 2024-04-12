"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_TRIGGER = void 0;
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
var AI_TRIGGER;
(function (AI_TRIGGER) {
    function tired(character) {
        return (character.get_fatigue() > 50)
            || (character.get_stress() > 50);
    }
    AI_TRIGGER.tired = tired;
    function low_hp(character) {
        return character.get_hp() < 0.5 * character.get_max_hp();
    }
    AI_TRIGGER.low_hp = low_hp;
    function at_home(character) {
        const home = character.home_location_id;
        if (home != undefined) {
            if (home == character.location_id) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }
    AI_TRIGGER.at_home = at_home;
    function can_buy(character, material_index, budget) {
        let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
        let best_order = undefined;
        let best_price = 9999;
        for (let item of orders) {
            let order = data_objects_1.Data.MarketOrders.from_id(item);
            if (order.typ == 'buy')
                continue;
            if (order.material != material_index)
                continue;
            if ((best_price > order.price) && (order.amount > 0)) {
                best_price = order.price;
                best_order = order;
            }
        }
        if (best_order == undefined)
            return false;
        if (budget >= best_price) {
            return true;
        }
        return false;
    }
    AI_TRIGGER.can_buy = can_buy;
})(AI_TRIGGER = exports.AI_TRIGGER || (exports.AI_TRIGGER = {}));
