import { money } from "@custom_types/common";
import { AIstate } from "../character/AIstate";
import { Character } from "../character/character";
import { EventMarket } from "../events/market";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { home_walk, sell_all_stash, update_price_beliefs, urban_walk } from "./ACTIONS_BASIC";
import { GenericRest } from "./AI_ROUTINE_GENERIC";
import { AI_TRIGGER } from "./AI_TRIGGERS";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";

export function TraderRoutine(character: Character) {
    // console.log("???")
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return

    GenericRest(character);

    if (character.ai_state == AIstate.Idle) {
        // console.log('start')
        character.ai_state = AIstate.PatrolPrices
    }

    if (character.ai_state == AIstate.GoToMarket) {
        // console.log('going to market')
        if (AI_TRIGGER.at_home(character)) {
            sell_all_stash(character)
            character.ai_state = AIstate.WaitSale
        } else {
            home_walk(character)
        }
    }

    // wait until you earn enough money or sell out
    if (character.ai_state == AIstate.WaitSale) {
        // console.log('wait for sales')
        if ((character.savings.get() > 1000) || character.trade_stash.is_empty()) {
            character.ai_state = AIstate.Patrol
        } else return
    }

    if (character.ai_state == AIstate.PatrolPrices) {
        if (Math.random() < 0.1) {
            // console.log('switch to buying')
            character.ai_state = AIstate.Patrol
        }
        update_price_beliefs(character)
        urban_walk(character)
    }

    //wander aimlessly and buy random stuff
    if (character.ai_state == AIstate.Patrol) {
        // if we had spent most of our money -> go back to market and sell stuff
        if ((character.savings.get() < 100)) {
            character.ai_state = AIstate.GoToMarket
            return
        }

        //sometimes switch to checking prices again
        if ((Math.random() < 0.1)) {
            character.ai_state = AIstate.PatrolPrices
            return
        }

        let orders = DataID.Cells.market_order_id_list(character.cell_id)
        let best_profit = 0 as money
        let target = undefined

        // buying stuff according to price beliefs
        for (let item of orders) {
            let order = Data.MarketOrders.from_id(item)
            let profit = AItrade.sell_price_bulk(character, order.material) - order.price as money

            if ((profit > best_profit) && (order.price < character.savings.get())) {
                best_profit = profit
                target = order
            }
        }

        if (target == undefined) {
            // console.log("searching for best deals")
            urban_walk(character)
        } else {
            // console.log(`buy ${materials.index_to_material(target.tag).string_tag} for ${target.price} with intention to make ${best_profit} profit`)
            EventMarket.execute_sell_order(character, target.id, 1);
            return
        }
    }
}