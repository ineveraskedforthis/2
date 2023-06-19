"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide_AI_battle_action = void 0;
const basic_functions_1 = require("../calculations/basic_functions");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const ACTIONS_AI_1 = require("./ACTIONS_AI");
function decide_AI_battle_action(battle, character, unit) {
    let max_utility_basic = -1;
    let best_action_basic = undefined;
    for (let [key, action] of Object.entries(ACTIONS_AI_1.BattleActionsBasicAI)) {
        let utility = action.utility(battle, character, unit);
        utility = (0, basic_functions_1.trim)(utility, 0, action.max_utility);
        if (unit.action_points_left < action.ap_cost(battle, character, unit)) {
            utility = 0;
        }
        if (utility > max_utility_basic) {
            max_utility_basic = utility;
            best_action_basic = action;
        }
        console.log(character.name, key, utility);
    }
    let max_utility_targeted = -1;
    let best_action_targeted = undefined;
    let best_action_target = undefined;
    let best_action_target_character = undefined;
    let best_key = undefined;
    for (let [key, action] of Object.entries(ACTIONS_AI_1.BattleActionsPerUnitAI)) {
        for (let target of Object.values(battle.heap.data)) {
            let target_character = systems_communication_1.Convert.unit_to_character(target);
            let utility = (0, basic_functions_1.trim)(action.utility(battle, character, unit, target_character, target), 0, action.max_utility);
            if (unit.action_points_left < action.ap_cost(battle, character, unit, target_character, target)) {
                utility = 0;
            }
            if (geom_1.geom.dist(unit.position, target.position) > action.range(battle, character, unit)) {
                utility = 0;
            }
            if (utility > max_utility_targeted) {
                max_utility_targeted = utility;
                best_action_targeted = action;
                best_action_target = target;
                best_action_target_character = target_character;
                best_key = key;
            }
            console.log(key, utility, unit.action_points_left, action.ap_cost(battle, character, unit, target_character, target));
        }
    }
    console.log(character.name, best_key, max_utility_targeted, best_action_target_character?.name);
    if ((max_utility_basic < max_utility_targeted) && (best_action_target_character != undefined) && (best_action_target != undefined)) {
        best_action_targeted?.execute(battle, character, unit, best_action_target_character, best_action_target);
    }
    else {
        best_action_basic?.execute(battle, character, unit);
    }
    console.log();
}
exports.decide_AI_battle_action = decide_AI_battle_action;
