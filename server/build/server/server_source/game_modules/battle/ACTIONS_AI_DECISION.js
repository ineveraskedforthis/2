"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide_AI_battle_action = void 0;
const inventory_events_1 = require("../events/inventory_events");
const geom_1 = require("../geom");
const TRIGGERS_1 = require("./TRIGGERS");
const actions_1 = require("./actions");
const data_objects_1 = require("../data/data_objects");
function utility_unit_damage(key, action, battle, character, target_character) {
    if (!TRIGGERS_1.BattleTriggers.is_enemy(character, target_character)) {
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    }
    if (target_character.dead())
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    let damage = action.damage(battle, character, target_character) * action.chance(battle, character, target_character);
    let cost = action.ap_cost(battle, character, target_character);
    let enemy_hp = target_character.get_hp();
    return { action_key: key, utility: damage / enemy_hp, ap_cost: cost, target: target_character };
}
function generic_utility_unit(key, action, battle, character, target_character, d_distance, d_ap) {
    if (target_character.dead())
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    if ((0, actions_1.battle_action_character_check)(key, battle, character, target_character, d_distance, d_ap).response != 'OK')
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    if (action.move_closer)
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    if (action.switch_weapon)
        return { action_key: key, utility: 0, ap_cost: 0, target: target_character };
    return utility_unit_damage(key, action, battle, character, target_character);
}
function utility_targeted_value(utility) {
    if (utility.ap_cost <= 1)
        return utility.utility;
    return utility.utility / utility.ap_cost;
}
function best_utility_unit(battle, character, target_character, d_distance, d_ap) {
    let utility = { action_key: 'None', utility: 0, ap_cost: 0, target: target_character };
    for (let [key, action] of Object.entries(actions_1.ActionsUnit)) {
        let current_utility = generic_utility_unit(key, action, battle, character, target_character, d_distance, d_ap);
        // print_utility('per unit', current_utility)
        if (utility_targeted_value(current_utility) > utility_targeted_value(utility)) {
            utility = current_utility;
        }
    }
    return utility;
}
function utility_switch_weapon(battle, character, target_character, d_ap) {
    inventory_events_1.EventInventory.switch_weapon(character);
    let utility = best_utility_unit(battle, character, target_character, 0, d_ap);
    inventory_events_1.EventInventory.switch_weapon(character);
    utility.action_key = 'SwitchWeapon';
    return utility;
}
function utility_move_closer(battle, character, target_character, d_ap) {
    const delta = geom_1.geom.minus(target_character.position, character.position);
    const dist = geom_1.geom.norm(delta);
    const range = character.range();
    const max_move = 1; // potential movement
    if (dist < range) {
        return { action_key: 'MoveCloser', utility: 0, ap_cost: 0, target: target_character };
    }
    let distance_to_walk = dist - range + 0.01;
    let cost = actions_1.ActionsUnit.MoveTowards.ap_cost(battle, character, target_character);
    let result_1 = best_utility_unit(battle, character, target_character, distance_to_walk, d_ap);
    inventory_events_1.EventInventory.switch_weapon(character);
    let result_2 = best_utility_unit(battle, character, target_character, distance_to_walk, d_ap);
    inventory_events_1.EventInventory.switch_weapon(character);
    if (result_1.utility > 0) {
        // console.log('best utility 1 from moving closer', result_1.action_key, result_1.utility, result_1.ap_cost)
    }
    if (result_2.utility > 0) {
        // console.log('best utility 2 from moving closer', result_2.action_key, result_2.utility, result_2.ap_cost)
    }
    result_1.ap_cost += cost;
    result_1.action_key = 'MoveTowards';
    result_2.ap_cost += cost;
    result_2.action_key = 'MoveTowards';
    return best_utility_from_array([result_1, result_2]);
}
function select_targeted_action(battle, character, target_character, d_distance, d_ap) {
    let generic = best_utility_unit(battle, character, target_character, d_distance, d_ap);
    // print_utility('generic', generic)
    let switch_weapon = utility_switch_weapon(battle, character, target_character, d_ap);
    // print_utility('switch_weapon', switch_weapon)
    let move_closer = utility_move_closer(battle, character, target_character, d_ap);
    // print_utility('move_closer', move_closer)
    return best_utility_from_array([generic, switch_weapon, move_closer]);
}
function calculate_utility_end_turn(battle, character, list_of_utility) {
    let best = best_utility_from_array(list_of_utility);
    let utility = 0;
    if (battle.grace_period > 0)
        utility = 0.00001;
    if (best.ap_cost <= character.action_points_left) {
        return { action_key: 'EndTurn', utility: utility, ap_cost: 0, target: character };
    }
    else {
        return { action_key: 'EndTurn', utility: Math.max(utility, utility_targeted_value(best) * 0.8), ap_cost: 0, target: character };
    }
}
function calculate_utility_flee(battle, character, d_ap) {
    if ((0, actions_1.battle_action_self_check)('Flee', battle, character, d_ap).response != 'OK')
        return { action_key: 'Flee', utility: 0, ap_cost: 0, target: character };
    let utility = (character.get_hp()) / character.get_max_hp();
    utility = 0.5 - Math.sqrt(utility);
    if (TRIGGERS_1.BattleTriggers.safe_for_unit(battle, character)) {
        // console.log('safe battle')
        if (battle.grace_period == 0) {
            utility = 1;
        }
        else {
            utility = 0;
        }
    }
    return { action_key: 'Flee', utility: utility, ap_cost: actions_1.ActionsSelf.Flee.ap_cost(battle, character), target: character };
}
function calculate_utility_random_step(battle, character, d_ap) {
    if ((0, actions_1.battle_action_self_check)('RandomStep', battle, character, d_ap).response != 'OK')
        return { action_key: 'RandomStep', utility: 0, ap_cost: 0, target: character };
    let total_utility = 0;
    for (const item of battle.heap) {
        if (item == undefined)
            continue;
        if (item == character.id)
            continue;
        let target = data_objects_1.Data.Characters.from_id(item);
        let distance = geom_1.geom.dist(character.position, target.position);
        if (target.dead())
            continue;
        if (distance < 0.2)
            total_utility += 0.7;
    }
    return { action_key: 'RandomStep', utility: total_utility, ap_cost: actions_1.ActionsSelf.RandomStep.ap_cost(battle, character), target: character };
}
function decide_best_action_self(battle, character, d_ap) {
    let utility_flee = calculate_utility_flee(battle, character, d_ap);
    let utility_random_step = calculate_utility_random_step(battle, character, d_ap);
    return best_utility_from_array([utility_flee, utility_random_step]);
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
function print_utility(name, utility) {
    console.log(name, utility?.action_key, utility?.utility, utility?.ap_cost, utility?.target.get_name());
}
function decide_AI_battle_action(battle, character) {
    // console.log('without end_turn')
    let best_self = decide_best_action_self(battle, character, 0);
    const best_targeted = best_utility_from_array(battle.heap.map(item => {
        if (item == undefined)
            return end_turn;
        let target_character = data_objects_1.Data.Characters.from_id(item);
        const utility = select_targeted_action(battle, character, target_character, 0, 0);
        // print_utility(character.get_name(), utility)
        return utility;
    }));
    // console.log('with end turn')
    const best_self_later = decide_best_action_self(battle, character, 10);
    const best_targeted_later = best_utility_from_array(battle.heap.map(item => {
        if (item == undefined)
            return end_turn;
        let target_character = data_objects_1.Data.Characters.from_id(item);
        const utility = select_targeted_action(battle, character, target_character, 0, 10);
        // print_utility(character.get_name(), utility)
        return utility;
    }));
    let end_turn = calculate_utility_end_turn(battle, character, [best_self_later, best_targeted_later]);
    // print_utility(character.get_name(), best_self)
    // print_utility(character.get_name(), best_targeted)
    // print_utility(character.get_name(), end_turn)
    best_self = best_utility_from_array([best_self, end_turn]);
    // print_utility('best self', best_self)
    // console.log(battle_action_unit_check(best_targeted.action_key, battle, character, best_targeted.target.character, best_targeted.target.unit))
    if (utility_targeted_value(best_targeted) > utility_targeted_value(best_self)) {
        (0, actions_1.battle_action_character)(best_targeted.action_key, battle, character, best_targeted.target);
    }
    else {
        (0, actions_1.battle_action_self)(best_self.action_key, battle, character);
    }
}
exports.decide_AI_battle_action = decide_AI_battle_action;
