// This file is an attempt to make a simple instruction for agents

import { ActionManager } from "../actions/action_manager";
import { CharacterAction } from "../action_types";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { FOOD } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { CampaignAI } from "./ai_manager";
import { AIhelper } from "./helpers";
import { simple_constraints } from "./constraints";
import { AIstate } from "../character/AIstate";
import { tired, low_hp } from "./triggers";
import { buy_food, loot, market_walk, random_walk, remove_orders, rest_building, rest_outside, sell_loot, update_price_beliefs } from "./actions";
import { MapSystem } from "../map/system";
import { money } from "@custom_types/common";

function rat_hunter_rest_budget(character: Character) {
    let budget = character.savings.get()
    if (budget < 100) {
        budget = 0 as money
    }
    return budget
}

export function RatHunterRoutine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return
    if (tired(character)) {
        if (!MapSystem.has_market(character.cell_id)) {
            market_walk(character)
            return
        } else {
            let responce = rest_building(character, rat_hunter_rest_budget(character))
            if (!responce) {
                rest_outside(character)
                return
            }
            return
        }
    }

    // character at market
    if (!character.trade_stash.is_empty()) {
        update_price_beliefs(character)
        if (character.stash.get(FOOD) < 10) {
            buy_food(character)
        }
        rest_building(character, character.savings.get())

        if (Math.random() < 0.5) {
            remove_orders(character)
            sell_loot(character)
        }
        return
    }
    
    if (loot(character) > 10) {
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
    let target = AIhelper.free_rats_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
    } else {
        random_walk(character, simple_constraints) 
    }
}