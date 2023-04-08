import { AIstate } from "../character/AIstate";
import { Character } from "../character/character";
import { Data } from "../data";
import { EventMarket } from "../events/market";
import { MapSystem } from "../map/system";
import { Convert } from "../systems_communication";
import { money } from "../types";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { market_walk, rest_building, rest_outside, sell_all_stash, urban_walk } from "./actions";
import { tired } from "./triggers";

export function TraderRoutine(character: Character) {
    console.log("???")
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return
    if (character.current_building != undefined) return

    if (tired(character)) {
        let responce = rest_building(character, character.savings.get())
        if (!responce) {
            rest_outside(character)
            return
        }
        return
    }

    if (character.ai_state == AIstate.Idle) {
        console.log('start')
        character.ai_state = AIstate.WaitSale
    }

    if (character.ai_state == AIstate.GoToMarket) {
        console.log('going to market')
        let cell = MapSystem.id_to_cell(character.cell_id)
        if (cell == undefined) return 

        if (cell.is_market()) {
            sell_all_stash(character)
            character.ai_state = AIstate.WaitSale
        } else {
            market_walk(character)
        }
    }

    // wait until you earn enough money or sell out
    if (character.ai_state == AIstate.WaitSale) {
        console.log('wait for sales')
        if ((character.savings.get() > 1000) || character.trade_stash.is_empty()) {
            character.ai_state = AIstate.Patrol
        } else return
    }

    //wander aimlessly and buy random stuff
    if (character.ai_state == AIstate.Patrol) {
        if ((character.savings.get() < 100)) {
            character.ai_state = AIstate.GoToMarket
        }

        let orders = Convert.cell_id_to_bulk_orders(character.cell_id)
        let best_profit = 0 as money
        let target = undefined

        for (let item of orders) {
            let order = Data.BulkOrders.from_id(item)
            let profit = AItrade.sell_price_bulk(character, order.tag) - order.price as money

            if ((profit > best_profit) && (order.price < character.savings.get())) {
                best_profit = profit
                target = order
            }
        }

        if (target == undefined) {
            console.log("searching for best deals")
            urban_walk(character)
        } else {
            console.log(`buy ${target.tag} for ${target.price} with intention to make ${best_profit} profit`)
            EventMarket.execute_sell_order(character, target.id, 1);
            return
        }
    }
}