import { trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { geom } from "../geom";
import { Convert } from "../systems_communication";
import { BattleActionsBasicAI, BattleActionsPerUnitAI } from "./ACTIONS_AI";
import { Battle } from "./classes/battle";
import { Unit } from "./classes/unit";

export function decide_AI_battle_action(battle: Battle, character: Character, unit: Unit) {
    let max_utility_basic = -1
    let best_action_basic = undefined
    for (let [key, action] of Object.entries(BattleActionsBasicAI)) {
        let utility = action.utility(battle, character, unit)
        utility = trim(utility, 0, action.max_utility)
        if (unit.action_points_left < action.ap_cost(battle, character, unit)) {
            utility = 0
        }

        if (utility > max_utility_basic) {
            max_utility_basic = utility
            best_action_basic = action
        }
        console.log(character.name, key, utility)
    }

    let max_utility_targeted = -1
    let best_action_targeted = undefined
    let best_action_target = undefined
    let best_action_target_character = undefined
    let best_key = undefined


    for (let [key, action] of Object.entries(BattleActionsPerUnitAI)) {
        for (let target of Object.values(battle.heap.data)) {
            let target_character = Convert.unit_to_character(target)
            let utility = trim(action.utility(battle, character, unit, target_character, target), 0, action.max_utility)
            if (unit.action_points_left < action.ap_cost(battle, character, unit, target_character, target)) {
                utility = 0
            }
            if (geom.dist(unit.position, target.position) > action.range(battle, character, unit)) {
                utility = 0
            }

            if (utility > max_utility_targeted) {
                max_utility_targeted = utility
                best_action_targeted = action 
                best_action_target = target
                best_action_target_character = target_character
                best_key = key
            }

            console.log(key, utility, unit.action_points_left, action.ap_cost(battle, character, unit, target_character, target))
        }
    }

    console.log(character.name, best_key, max_utility_targeted, best_action_target_character?.name)

    if ((max_utility_basic < max_utility_targeted)&&(best_action_target_character != undefined)&&(best_action_target != undefined)) {
        best_action_targeted?.execute(battle, character, unit, best_action_target_character, best_action_target)
    } else {
        best_action_basic?.execute(battle, character, unit)
    }

    console.log()
}