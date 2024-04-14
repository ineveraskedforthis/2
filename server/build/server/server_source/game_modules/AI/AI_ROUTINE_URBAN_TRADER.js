"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderRoutine = void 0;
const market_1 = require("../events/market");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const ACTIONS_BASIC_1 = require("./ACTIONS_BASIC");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const AI_TRIGGERS_1 = require("./AI_TRIGGERS");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
function TraderRoutine(character) {
    // console.log("???")
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    (0, AI_ROUTINE_GENERIC_1.GenericRest)(character);
    if (character.ai_state == "idle" /* AIstate.Idle */) {
        // console.log('start')
        character.ai_state = "patrol_prices" /* AIstate.PatrolPrices */;
    }
    if (character.ai_state == "go_to_market" /* AIstate.GoToMarket */) {
        // console.log('going to market')
        if (AI_TRIGGERS_1.AI_TRIGGER.at_home(character)) {
            (0, ACTIONS_BASIC_1.sell_all_stash)(character);
            character.ai_state = "wait_sale" /* AIstate.WaitSale */;
        }
        else {
            (0, ACTIONS_BASIC_1.home_walk)(character);
        }
    }
    // wait until you earn enough money or sell out
    if (character.ai_state == "wait_sale" /* AIstate.WaitSale */) {
        // console.log('wait for sales')
        if ((character.savings.get() > 1000) || character.trade_stash.is_empty()) {
            character.ai_state = "patrol" /* AIstate.Patrol */;
        }
        else
            return;
    }
    if (character.ai_state == "patrol_prices" /* AIstate.PatrolPrices */) {
        if (Math.random() < 0.1) {
            // console.log('switch to buying')
            character.ai_state = "patrol" /* AIstate.Patrol */;
        }
        (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
        (0, ACTIONS_BASIC_1.urban_walk)(character);
    }
    //wander aimlessly and buy random stuff
    if (character.ai_state == "patrol" /* AIstate.Patrol */) {
        // if we had spent most of our money -> go back to market and sell stuff
        if ((character.savings.get() < 100)) {
            character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
            return;
        }
        //sometimes switch to checking prices again
        if ((Math.random() < 0.1)) {
            character.ai_state = "patrol_prices" /* AIstate.PatrolPrices */;
            return;
        }
        let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
        let best_profit = 0;
        let target = undefined;
        // buying stuff according to price beliefs
        for (let item of orders) {
            let order = data_objects_1.Data.MarketOrders.from_id(item);
            let profit = AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, order.material) - order.price;
            if ((profit > best_profit) && (order.price < character.savings.get())) {
                best_profit = profit;
                target = order;
            }
        }
        if (target == undefined) {
            // console.log("searching for best deals")
            (0, ACTIONS_BASIC_1.urban_walk)(character);
        }
        else {
            // console.log(`buy ${materials.index_to_material(target.tag).string_tag} for ${target.price} with intention to make ${best_profit} profit`)
            market_1.EventMarket.execute_sell_order(character, target.id, 1);
            return;
        }
    }
}
exports.TraderRoutine = TraderRoutine;

