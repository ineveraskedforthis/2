// This file is an attempt to make a simple instruction for agents

import { ActionManager } from "../actions/manager";
import { CharacterAction } from "../actions/actions_00";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { ARROW_BONE, FOOD } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { AIhelper } from "./helpers";
import { simple_constraints } from "./constraints";
import { AImemory, AIstate } from "../character/AIstate";
import { tired, low_hp } from "./triggers";
import { buy, loot, market_walk, random_walk, remove_orders, sell_loot, update_price_beliefs } from "./actions";
import { MapSystem } from "../map/system";
import { GenericRest } from "./AI_ROUTINE_GENERIC";

function fight(character: Character) {
    let target = AIhelper.enemies_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
        return
    }
}


function buy_stuff(character: Character) {
    if (!MapSystem.has_market(character.cell_id)) {
        market_walk(character)
        return
    }
    update_price_beliefs(character)
    let flag_food = false
    if ((character.stash.get(FOOD) < 30) && (character.savings.get() > 100)) {
        flag_food = buy(character, FOOD)
    }
    let flag_arrow = false
    if ((character.stash.get(ARROW_BONE) < 100) && (character.savings.get() > 100)) {
        flag_arrow = buy(character, ARROW_BONE)
    }
    if (flag_food || flag_arrow) {
        return
    }

    character.ai_state = AIstate.Idle
    character.ai_memories.push(AImemory.WAS_ON_MARKET)
}

function rest_at_home(character: Character) {
    if (!tired(character)) {
        character.ai_state = AIstate.Idle
        return
    }

    if (!MapSystem.has_market(character.cell_id)) {
        market_walk(character)
        return
    } else {
        GenericRest(character)
        return
    }
}

function patrol(character: Character) {
    let target = AIhelper.free_rats_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
    } else {
        random_walk(character, simple_constraints) 
    }

    if (loot(character) > 10) {
        character.ai_state = AIstate.GoToMarket
    }
    if (low_hp(character)) {
        character.ai_state = AIstate.GoToMarket
    }
}

function sell_at_market(character: Character) {
    if (MapSystem.has_market(character.cell_id)) {
        update_price_beliefs(character)
        sell_loot(character)
        character.ai_state = AIstate.WaitSale
    } else {
        market_walk(character)
    }
    return
}

function waiting_sells(character: Character) {
    {   
        update_price_beliefs(character)
        remove_orders(character)
        sell_loot(character)
    }    
    if (character.trade_stash.is_empty()) {
        character.ai_state = AIstate.Idle
        return
    }
}

export function RatHunterRoutine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return

    if (Math.random() < 0.1) {
        character.ai_memories.shift()
    }

    if ((character.stash.get(FOOD) > 0) && (low_hp(character) || character.get_stress() > 20)) {
        console.log(character.name, " I AM EEEAATING FOOD")
        ActionManager.start_action(CharacterAction.EAT, character, character.cell_id)
    }

    fight(character)
    if (character.ai_state == AIstate.GoToRest) {
        rest_at_home(character)
        return
    }
    if (character.ai_state = AIstate.Patrol) {
        patrol(character)
        return
    }
    if (character.ai_state == AIstate.GoToMarket) {
        sell_at_market(character)
        return
    }
    if (character.ai_state == AIstate.WaitSale) {
        waiting_sells(character)
        return
    }
    if ((character.ai_state == AIstate.Idle) && (character.ai_memories.indexOf(AImemory.WAS_ON_MARKET) < 0) ){
        buy_stuff(character)
        return
    } else if (character.ai_state == AIstate.Idle) {
        character.ai_state = AIstate.Patrol
    }

    if (tired(character)) {
        character.ai_state = AIstate.GoToRest
    }
}