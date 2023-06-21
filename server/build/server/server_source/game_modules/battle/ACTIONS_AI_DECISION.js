"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide_AI_battle_action = void 0;
const inventory_events_1 = require("../events/inventory_events");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const TRIGGERS_1 = require("./TRIGGERS");
const actions_1 = require("./actions");
function utility_unit_damage(key, action, battle, character, unit, target_character, target_unit) {
    if (!TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    }
    if (target_character.dead())
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    let damage = action.damage(battle, character, unit, target_character, target_unit) * action.chance(battle, character, unit, target_character, target_unit);
    let cost = action.ap_cost(battle, character, unit, target_character, target_unit);
    let enemy_hp = target_character.get_hp();
    return { action_key: key, utility: damage / enemy_hp, ap_cost: cost, target: { character: target_character, unit: target_unit } };
}
function generic_utility_unit(key, action, battle, character, unit, target_character, target_unit, d_distance, d_ap) {
    if (target_character.dead())
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    let dist = geom_1.geom.dist(unit.position, target_unit.position);
    if (action.range(battle, character, unit) < dist - d_distance)
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    if (action.ap_cost(battle, character, unit, target_character, target_unit) > unit.action_points_left + d_ap)
        return { action_key: 'None', utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    if ((0, actions_1.battle_action_unit_check)(key, battle, character, unit, target_character, target_unit).response != 'OK')
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    if (action.move_closer)
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    if (action.switch_weapon)
        return { action_key: key, utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    return utility_unit_damage(key, action, battle, character, unit, target_character, target_unit);
}
function utility_targeted_value(utility) {
    if (utility.ap_cost <= 1)
        return utility.utility;
    return utility.utility / utility.ap_cost;
}
function best_utility_unit(battle, character, unit, target_character, target_unit, d_distance, d_ap) {
    let utility = { action_key: 'None', utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    for (let [key, action] of Object.entries(actions_1.ActionsUnit)) {
        let current_utility = generic_utility_unit(key, action, battle, character, unit, target_character, target_unit, d_distance, d_ap);
        if (utility_targeted_value(current_utility) > utility_targeted_value(utility)) {
            utility = current_utility;
        }
    }
    return utility;
}
function utility_switch_weapon(battle, character, unit, target_character, target_unit) {
    inventory_events_1.EventInventory.switch_weapon(character);
    let utility = best_utility_unit(battle, character, unit, target_character, target_unit, 0, 0);
    inventory_events_1.EventInventory.switch_weapon(character);
    utility.action_key = 'SwitchWeapon';
    return utility;
}
function utility_move_closer(battle, character, unit, target_character, target_unit) {
    const delta = geom_1.geom.minus(target_unit.position, unit.position);
    const dist = geom_1.geom.norm(delta);
    const range = character.range();
    const max_move = 1; // potential movement
    if (dist < range) {
        return { action_key: 'None', utility: 0, ap_cost: 0, target: { character: target_character, unit: target_unit } };
    }
    let distance_to_walk = dist - range + 0.01;
    let cost = actions_1.ActionsUnit.MoveTowards.ap_cost(battle, character, unit, target_character, target_unit);
    let result_1 = best_utility_unit(battle, character, unit, target_character, target_unit, distance_to_walk, 0);
    inventory_events_1.EventInventory.switch_weapon(character);
    let result_2 = best_utility_unit(battle, character, unit, target_character, target_unit, distance_to_walk, 0);
    inventory_events_1.EventInventory.switch_weapon(character);
    result_1.ap_cost = cost;
    result_1.action_key = 'MoveTowards';
    result_2.ap_cost = cost;
    result_2.action_key = 'MoveTowards';
    return best_utility_from_array([result_1, result_2]);
}
function select_targeted_action(battle, character, unit, target_character, target_unit) {
    let generic = best_utility_unit(battle, character, unit, target_character, target_unit, 0, 0);
    let switch_weapon = utility_switch_weapon(battle, character, unit, target_character, target_unit);
    let move_closer = utility_move_closer(battle, character, unit, target_character, target_unit);
    return best_utility_from_array([generic, switch_weapon, move_closer]);
}
function calculate_utility_end_turn(battle, character, unit) {
    return { action_key: 'EndTurn', utility: 0.51 - unit.action_points_left / 20, ap_cost: 0, target: { character: character, unit: unit } };
}
function calculate_utility_flee(battle, character, unit) {
    if ((0, actions_1.battle_action_self_check)('Flee', battle, character, unit).response != 'OK')
        return { action_key: 'None', utility: 0, ap_cost: 0, target: { character: character, unit: unit } };
    let utility = (character.get_hp()) / character.get_max_hp();
    utility = 1 - utility * utility;
    if (TRIGGERS_1.BattleTriggers.safe_for_unit(battle, unit, character)) {
        if (battle.grace_period == 0) {
            utility = 1;
        }
        else {
            utility = 0;
        }
    }
    return { action_key: 'Flee', utility: utility, ap_cost: actions_1.ActionsSelf.Flee.ap_cost(battle, character, unit), target: { character: character, unit: unit } };
}
function calculate_utility_random_step(battle, character, unit) {
    if ((0, actions_1.battle_action_self_check)('RandomStep', battle, character, unit).response != 'OK')
        return { action_key: 'None', utility: 0, ap_cost: 0, target: { character: character, unit: unit } };
    let total_utility = 0;
    for (const item of Object.values(battle.heap.data)) {
        let distance = geom_1.geom.dist(unit.position, item.position);
        if (item.id == unit.id)
            continue;
        let target = systems_communication_1.Convert.unit_to_character(item);
        if (target.dead())
            continue;
        if (distance < 0.2)
            total_utility += 0.7;
    }
    return { action_key: 'RandomStep', utility: total_utility, ap_cost: actions_1.ActionsSelf.RandomStep.ap_cost(battle, character, unit), target: { character: character, unit: unit } };
}
function decide_best_action_self(battle, character, unit) {
    let utility_end_turn = calculate_utility_end_turn(battle, character, unit);
    let utility_flee = calculate_utility_flee(battle, character, unit);
    let utility_random_step = calculate_utility_random_step(battle, character, unit);
    return best_utility_from_array([utility_end_turn, utility_flee, utility_random_step]);
}
function best_utility_from_array(array) {
    let current = array[0];
    for (let item of array) {
        if (current == undefined) {
            current = item;
        }
        else {
            if (utility_targeted_value(item) > utility_targeted_value(current)) {
                current = item;
            }
        }
    }
    return current;
}
function decide_AI_battle_action(battle, character, unit) {
    const best_action_self = decide_best_action_self(battle, character, unit);
    const targeted_actions = Object.values(battle.heap.data).map(item => {
        let target_character = systems_communication_1.Convert.unit_to_character(item);
        const utility = select_targeted_action(battle, character, unit, target_character, item);
        return utility;
    });
    const best_targeted = best_utility_from_array(targeted_actions);
    console.log(character.name, unit.action_points_left, best_targeted?.action_key, best_targeted?.utility, best_targeted?.ap_cost, best_targeted?.target.character.name);
    console.log(character.name, unit.action_points_left, best_action_self?.action_key, best_action_self?.utility, best_action_self?.ap_cost);
    // console.log(battle_action_unit_check(best_targeted.action_key, battle, character, unit, best_targeted.target.character, best_targeted.target.unit))
    if (utility_targeted_value(best_targeted) > utility_targeted_value(best_action_self)) {
        (0, actions_1.battle_action_unit)(best_targeted.action_key, battle, character, unit, best_targeted.target.character, best_targeted.target.unit);
    }
    else {
        (0, actions_1.battle_action_self)(best_action_self.action_key, battle, character, unit);
    }
}
exports.decide_AI_battle_action = decide_AI_battle_action;
