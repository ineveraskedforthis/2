// This file is an attempt to make a simple instruction for agents

import { ActionManager } from "../actions/action_manager";
import { CharacterAction } from "../action_types";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { EventMarket } from "../events/market";
import { FOOD, MEAT, RAT_BONE, RAT_SKIN } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { money } from "../types";
import { CampaignAI } from "./ai_manager";
import { AIhelper, base_price } from "./helpers";
import { simple_constraints } from "./constraints";
import { market_walk, random_walk } from "./actions";

function tired(character: Character) {
    return (character.get_fatigue() > 70) || (character.get_stress() > 30)
}

function low_hp(character: Character) {
    return character.get_hp() < 0.5 * character.get_max_hp()
}

const LOOT = [MEAT, RAT_SKIN, RAT_BONE]

function loot(character: Character) {
    let tmp = 0
    for (let tag of LOOT) {
        tmp += character.stash.get(tag)
    }
    return tmp
}

function sell_loot(character: Character) {
    for (let tag of LOOT) {
        EventMarket.sell(
            character, 
            tag, 
            character.stash.get(tag), 
            base_price(character, tag) - 1 as money
        )
    }
}

function RatHunter(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return

    if (tired(character)) {
        ActionManager.start_action(CharacterAction.REST, character, [0, 0])
        return
    }
    
    if (loot(character) > 10) {
        let cell = Convert.character_to_cell(character)
        if (cell.is_market()) {
            sell_loot(character)
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