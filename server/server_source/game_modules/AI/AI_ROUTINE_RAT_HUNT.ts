// This file is an attempt to make a simple instruction for agents

import { ActionManager } from "../actions/manager";
import { CharacterAction } from "../actions/actions_00";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { FOOD } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { AIhelper } from "./helpers";
import { simple_constraints } from "./constraints";
import { AIstate } from "../character/AIstate";
import { tired, low_hp } from "./triggers";
import { buy_food, loot, market_walk, random_walk, remove_orders, sell_loot, update_price_beliefs } from "./actions";
import { MapSystem } from "../map/system";
import { GenericRest } from "./AI_ROUTINE_GENERIC";

export function RatHunterRoutine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return

    {   
        let target = AIhelper.enemies_in_cell(character)
        const target_char = Convert.id_to_character(target)
        // console.log(character.name)
        // console.log('local enemy is', target_char?.name)
        if (target_char != undefined) {
            Event.start_battle(character, target_char)
            return
        }
    }    

    if (tired(character)) {
        if (!MapSystem.has_market(character.cell_id)) {
            market_walk(character)
            return
        } else {
            GenericRest(character)
            return
        }
    }

    // character at market
    if (!character.trade_stash.is_empty()) {
        update_price_beliefs(character)
        if (character.stash.get(FOOD) < 30) {
            buy_food(character)
        }

        if (Math.random() < 0.5) {
            remove_orders(character)
            sell_loot(character)
        }
        return
    }
    
    if (loot(character) > 10) {
        // console.log('trying to get back to market')
        // let cell = Convert.character_to_cell(character)
        if (MapSystem.has_market(character.cell_id)) {
            update_price_beliefs(character)
            sell_loot(character)
            character.ai_state = AIstate.WaitSale
        } else {
            market_walk(character)
        }
        return
    }

    if ((character.stash.get(FOOD) > 0) && low_hp(character)) {
        ActionManager.start_action(CharacterAction.EAT, character, [0, 0])
        return
    }

    // finding rats if nothing else is needed
    // console.log('looking for rats')
    let target = AIhelper.free_rats_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
    } else {
        random_walk(character, simple_constraints) 
    }
}