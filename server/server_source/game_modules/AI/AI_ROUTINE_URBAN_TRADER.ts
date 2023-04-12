import { AIstate } from "../character/AIstate";
import { Character } from "../character/character";
import { Data } from "../data";
import { EventMarket } from "../events/market";
import { MaterialsManager, materials } from "../manager_classes/materials_manager";
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
        character.ai_state = AIstate.PatrolPrices
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

    if (character.ai_state == AIstate.PatrolPrices) {
        if (Math.random() < 0.1) {
            console.log('switch to buying')
            character.ai_state = AIstate.Patrol
        }
        let orders = Convert.cell_id_to_bulk_orders(character.cell_id)
        // updating price beliefs as you go
        for (let item of orders) {
            let order = Data.BulkOrders.from_id(item)
            if (order.typ == "buy") {
                let belief = character.ai_price_belief_sell.get(order.tag)
                if (belief == undefined) {
                    character.ai_price_belief_sell.set(order.tag, order.price)
                } else {
                    character.ai_price_belief_sell.set(order.tag, order.price / 10 + belief * 9 / 10 as money)
                }
                console.log(`i think i can sell ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_sell.get(order.tag)}`)
            }

            if (order.typ == "sell") {
                let belief = character.ai_price_belief_buy.get(order.tag)
                if (belief == undefined) {
                    character.ai_price_belief_buy.set(order.tag, order.price)
                } else {
                    character.ai_price_belief_buy.set(order.tag, order.price / 10 + belief * 9 / 10 as money)
                }
                console.log(`i think i can buy ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_buy.get(order.tag)}`)
            }
        }
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

        let orders = Convert.cell_id_to_bulk_orders(character.cell_id)
        let best_profit = 0 as money
        let target = undefined

        // buying stuff according to price beliefs
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
            console.log(`buy ${materials.index_to_material(target.tag).string_tag} for ${target.price} with intention to make ${best_profit} profit`)
            EventMarket.execute_sell_order(character, target.id, 1);
            return
        }
    }
}