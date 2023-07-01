import { CharacterAction } from "../actions/actions_00";
import { ActionManager } from "../actions/manager";
import { AImemory } from "../character/AIstate";
import { Character } from "../character/character";
import { ARROW_BONE, FOOD } from "../manager_classes/materials_manager";
import { GenericRest } from "./AI_ROUTINE_GENERIC";
import { buy_food_arrows, rat_patrol, rest_at_home, sell_at_market } from "./AI_ROUTINE_RAT_HUNT";
import { loot } from "./actions";

function has_memory(character: Character, memory: AImemory) {
    return character.ai_memories.indexOf(memory) >= 0
}

function rest_utility(character: Character) {
    if (has_memory(character, AImemory.RESTED)) return 0
    return (character.get_stress() + character.get_fatigue()) / 200
}

function eat_utility(character: Character) {
    // if (has_memory(character, AImemory.NO_FOOD)) return 0
    if (character.stash.get(FOOD) < 1) return 0
    return 1 - character.get_hp() / character.get_max_hp()
}

function rat_hunt_utility(character: Character) {
    if (character.ai_map == 'rat_hunter') {
        return 0.4
    }
    return 0
}

function sell_loot_utility(character: Character) {
    return loot(character) / 20
}

function buy_stuff_utility(character: Character) {
    if (has_memory(character, AImemory.NO_MONEY)) return 0
    if (character.savings.get() < 100) return 0

    const required_food = 30
    const required_arrows = 50

    const current_food = character.stash.get(FOOD)
    const current_arrows = character.stash.get(ARROW_BONE)

    return Math.max((required_arrows - current_arrows) / required_arrows, (current_food - required_food) / required_food)
}


export function rat_hunter_decision(character: Character) {
    let rest = rest_utility(character)
    let eat = eat_utility(character)
    let rat_hunt = rat_hunt_utility(character)
    let sell_loot = sell_loot_utility(character)
    let buy_stuff = buy_stuff_utility(character)

    let max = Math.max( ... [rest, eat, rat_hunt, sell_loot, buy_stuff])
    // console.log([rest, eat, rat_hunt, sell_loot, buy_stuff])

    if (rest == max) {
        rest_at_home(character)
        return
    }
    if (eat == max) {
        ActionManager.start_action(CharacterAction.EAT, character, character.cell_id)
        return
    }
    if (rat_hunt == max) {
        rat_patrol(character)
        return
    }
    if (sell_loot == max) {
        sell_at_market(character)
        return
    }
    if (buy_stuff == max) {
        buy_food_arrows(character)
        return
    }    
}