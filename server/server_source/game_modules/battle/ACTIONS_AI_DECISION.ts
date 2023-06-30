import { ActionUnitKeys, action_points } from "@custom_types/battle_data";
import { trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { EventInventory } from "../events/inventory_events";
import { geom } from "../geom";
import { Convert } from "../systems_communication";
import { BattleTriggers } from "./TRIGGERS";
import { BattleValues } from "./VALUES";
import { ActionUnit, ActionsSelf, ActionsUnit, battle_action_position, battle_action_self, battle_action_self_check, battle_action_unit, battle_action_unit_check } from "./actions";
import { Battle } from "./classes/battle";
import { Unit } from "./classes/unit";

type CharacterUnit = {
    character: Character,
    unit: Unit
}

type UtilityObjectTargeted = {
    action_key: string,
    utility: number,
    ap_cost: number,
    target: CharacterUnit
}

function utility_unit_damage(key: string, action: ActionUnit, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): UtilityObjectTargeted {
    if (!BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
        return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    }
    if (target_character.dead()) return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    
    let damage = action.damage(battle, character, unit, target_character, target_unit) * action.chance(battle, character, unit, target_character, target_unit)
    let cost = action.ap_cost(battle, character, unit, target_character, target_unit)
    let enemy_hp = target_character.get_hp()

    return {action_key: key, utility: damage / enemy_hp, ap_cost: cost, target: {character: target_character, unit: target_unit}} 
}

function generic_utility_unit(
    key: string,
    action: ActionUnit, 
    battle: Battle, 
    character: Character, 
    unit: Unit, 
    target_character: Character, 
    target_unit: Unit, 
    d_distance: number, 
    d_ap: number) : UtilityObjectTargeted
{
    if (target_character.dead()) return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    if (battle_action_unit_check(key, battle, character, unit, target_character, target_unit, d_distance, d_ap).response != 'OK') return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    if (action.move_closer) return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    if (action.switch_weapon) return {action_key: key, utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}

    return utility_unit_damage(key, action, battle, character, unit, target_character, target_unit)
}

function utility_targeted_value(utility: UtilityObjectTargeted): number {
    if (utility.ap_cost <= 1) return utility.utility

    return utility.utility / utility.ap_cost
}

function best_utility_unit(battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, d_distance: number, d_ap: action_points): UtilityObjectTargeted {
    let utility = {action_key: 'None', utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    for (let [key, action] of Object.entries(ActionsUnit)) {
        let current_utility = generic_utility_unit(key, action, battle, character, unit, target_character, target_unit, d_distance, d_ap)
        // print_utility('per unit', current_utility)
        if (utility_targeted_value(current_utility) > utility_targeted_value(utility)) {
            utility = current_utility
        }
    }
    return utility
}

function utility_switch_weapon(battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, d_ap: action_points): UtilityObjectTargeted {
    EventInventory.switch_weapon(character)
    let utility = best_utility_unit(battle, character, unit, target_character, target_unit, 0, d_ap)
    EventInventory.switch_weapon(character)

    utility.action_key = 'SwitchWeapon'
    return utility
}

function utility_move_closer(battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, d_ap: action_points): UtilityObjectTargeted {
    const delta = geom.minus(target_unit.position, unit.position);
    const dist = geom.norm(delta)
    const range = character.range()
    const max_move = 1 // potential movement
    if (dist < range) {
        return {action_key: 'MoveCloser', utility: 0, ap_cost: 0, target: {character: target_character, unit: target_unit}}
    }
    let distance_to_walk = dist - range + 0.01

    let cost = ActionsUnit.MoveTowards.ap_cost(battle, character, unit, target_character, target_unit)

    let result_1 =  best_utility_unit(battle, character, unit, target_character, target_unit, distance_to_walk, d_ap)
    EventInventory.switch_weapon(character)
    let result_2 = best_utility_unit(battle, character, unit, target_character, target_unit, distance_to_walk, d_ap)
    EventInventory.switch_weapon(character)

    if (result_1.utility > 0){
        // console.log('best utility 1 from moving closer', result_1.action_key, result_1.utility, result_1.ap_cost)
    }

    if (result_2.utility > 0){
        // console.log('best utility 2 from moving closer', result_2.action_key, result_2.utility, result_2.ap_cost)
    }
    
    result_1.ap_cost += cost
    result_1.action_key = 'MoveTowards'

    result_2.ap_cost += cost
    result_2.action_key = 'MoveTowards'

    return best_utility_from_array([result_1, result_2])
}

function select_targeted_action(battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, d_distance: number, d_ap: action_points): UtilityObjectTargeted {
    let generic = best_utility_unit(battle, character, unit, target_character, target_unit, d_distance, d_ap)
    // print_utility('generic', generic)
    let switch_weapon = utility_switch_weapon(battle, character, unit, target_character, target_unit, d_ap)
    // print_utility('switch_weapon', switch_weapon)
    let move_closer = utility_move_closer(battle, character, unit, target_character, target_unit, d_ap)
    // print_utility('move_closer', move_closer)
    return best_utility_from_array([generic, switch_weapon, move_closer])
}

function calculate_utility_end_turn(battle: Battle, character: Character, unit: Unit, list_of_utility: UtilityObjectTargeted[]): UtilityObjectTargeted {
    let best = best_utility_from_array(list_of_utility)
    let utility = 0
    if (battle.grace_period > 0)
        utility = 0.00001

    if (best.ap_cost <= unit.action_points_left) {        
        return {action_key: 'EndTurn', utility: utility, ap_cost: 0, target: {character: character, unit: unit}}
    } else {
        return {action_key: 'EndTurn', utility: Math.max(utility, utility_targeted_value(best) * 0.8), ap_cost: 0, target: {character: character, unit: unit}}
    }
}

function calculate_utility_flee(battle: Battle, character: Character, unit: Unit, d_ap: action_points): UtilityObjectTargeted {
    if (battle_action_self_check('Flee', battle, character, unit, d_ap).response != 'OK') return {action_key: 'Flee', utility: 0, ap_cost: 0, target: {character: character, unit: unit}}
    
    let utility = (character.get_hp()) / character.get_max_hp()
    utility = 0.5 - Math.sqrt(utility)
    if (BattleTriggers.safe_for_unit(battle, unit, character)) {
        // console.log('safe battle')
        if (battle.grace_period == 0) {
            utility = 1
        }
        else {
            utility = 0
        }
    }
    
    return {action_key: 'Flee', utility: utility , ap_cost: ActionsSelf.Flee.ap_cost(battle, character, unit), target: {character: character, unit: unit}}
}

function calculate_utility_random_step(battle: Battle, character: Character, unit: Unit, d_ap: action_points): UtilityObjectTargeted {
    if (battle_action_self_check('RandomStep', battle, character, unit, d_ap).response != 'OK') return {action_key: 'RandomStep', utility: 0, ap_cost: 0, target: {character: character, unit: unit}}
    let total_utility = 0
    for (const item of Object.values(battle.heap.data)) {
        let distance = geom.dist(unit.position, item.position)
        if (item.id == unit.id) continue
        let target = Convert.unit_to_character(item)
        if (target.dead()) continue
        if (distance < 0.2) total_utility += 0.7
    }    
    return {action_key: 'RandomStep', utility: total_utility, ap_cost: ActionsSelf.RandomStep.ap_cost(battle, character, unit), target: {character: character, unit: unit}}
}

function decide_best_action_self(battle: Battle, character: Character, unit: Unit, d_ap: action_points): UtilityObjectTargeted {
    let utility_flee = calculate_utility_flee(battle, character, unit, d_ap)
    let utility_random_step = calculate_utility_random_step(battle, character, unit, d_ap)
    return best_utility_from_array([utility_flee, utility_random_step])
}

function best_utility_from_array(array: UtilityObjectTargeted[]): UtilityObjectTargeted {
    let current = array[0]

    for (let item of array) {
        if (current == undefined) {
            current = item
        } else {
            if (utility_targeted_value(item) > utility_targeted_value(current)) {
                current = item
            }
        }
    }

    return current
}

function print_utility(name: string, utility: UtilityObjectTargeted) {
    console.log(name, utility?.action_key, utility?.utility, utility?.ap_cost, utility?.target.character.get_name())
    
}

export function decide_AI_battle_action(battle: Battle, character: Character, unit: Unit) {
    // console.log('without end_turn')
    let best_self = decide_best_action_self(battle, character, unit, 0 as action_points)
    const best_targeted = best_utility_from_array(Object.values(battle.heap.data).map(item => {
        let target_character = Convert.unit_to_character(item)
        const utility = select_targeted_action(battle, character, unit, target_character, item, 0, 0 as action_points)
        // print_utility(character.get_name(), utility)
        return utility
    }))


    // console.log('with end turn')
    const best_self_later = decide_best_action_self(battle, character, unit, 10 as action_points)
    const best_targeted_later = best_utility_from_array(Object.values(battle.heap.data).map(item => {
        let target_character = Convert.unit_to_character(item)
        const utility = select_targeted_action(battle, character, unit, target_character, item, 0, 10 as action_points)
        // print_utility(character.get_name(), utility)
        return utility
    }))
    let end_turn = calculate_utility_end_turn(battle, character, unit, [best_self_later, best_targeted_later])

    // print_utility(character.get_name(), best_self)
    // print_utility(character.get_name(), best_targeted)
    // print_utility(character.get_name(), end_turn)

    best_self = best_utility_from_array([best_self, end_turn])

    // print_utility('best self', best_self)

    // console.log(battle_action_unit_check(best_targeted.action_key, battle, character, unit, best_targeted.target.character, best_targeted.target.unit))
    if (utility_targeted_value(best_targeted) > utility_targeted_value(best_self)) {
        battle_action_unit(best_targeted.action_key as ActionUnitKeys, battle, character, unit, best_targeted.target.character, best_targeted.target.unit)
    } else {
        battle_action_self(best_self.action_key, battle, character, unit)
    }
}