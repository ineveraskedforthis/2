"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRest = exports.ForestPassiveRoutine = exports.PassiveRoutine = exports.SteppePassiveRoutine = exports.SteppeAgressiveRoutine = void 0;
const data_1 = require("../data");
const scripted_values_1 = require("../events/scripted_values");
const systems_communication_1 = require("../systems_communication");
const actions_1 = require("./actions");
const constraints_1 = require("./constraints");
const helpers_1 = require("./helpers");
const triggers_1 = require("./triggers");
const effects_1 = require("../events/effects");
const DATA_LAYOUT_BUILDING_1 = require("../DATA_LAYOUT_BUILDING");
const triggers_2 = require("../events/triggers");
const system_1 = require("../battle/system");
function SteppeAgressiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        let target = helpers_1.AIhelper.enemies_in_cell(character);
        const target_char = systems_communication_1.Convert.id_to_character(target);
        if (target_char != undefined) {
            system_1.BattleSystem.start_battle(character, target_char);
        }
        else {
            (0, actions_1.random_walk)(character, constraints_1.steppe_constraints);
        }
    }
}
exports.SteppeAgressiveRoutine = SteppeAgressiveRoutine;
function SteppePassiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        (0, actions_1.random_walk)(character, constraints_1.steppe_constraints);
    }
}
exports.SteppePassiveRoutine = SteppePassiveRoutine;
function PassiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        (0, actions_1.random_walk)(character, constraints_1.simple_constraints);
    }
}
exports.PassiveRoutine = PassiveRoutine;
function ForestPassiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        (0, actions_1.random_walk)(character, constraints_1.forest_constraints);
    }
}
exports.ForestPassiveRoutine = ForestPassiveRoutine;
function find_building_to_rest(character, budget) {
    let cell = character.cell_id;
    let buildings = data_1.Data.Buildings.from_cell_id(cell);
    if (buildings == undefined)
        return undefined;
    let fatigue_utility = 1;
    let money_utility = 10;
    let best_utility = 0;
    let target = undefined;
    for (let item of buildings) {
        let price = scripted_values_1.ScriptedValue.room_price(item, character.id);
        let building = data_1.Data.Buildings.from_id(item);
        let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race);
        let fatigue_change = character.get_fatigue() - fatigue_target;
        let utility = fatigue_change * fatigue_utility - price * money_utility;
        if ((utility > best_utility) && (price <= budget) && (data_1.Data.Buildings.occupied_rooms(item) < (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type))) {
            target = item;
            best_utility = utility;
        }
    }
    return target;
}
function rest_budget(character) {
    let budget = character.savings.get();
    if (budget < 50) {
        budget = 0;
    }
    return (budget - 50);
}
function GenericRest(character) {
    if (character.action != undefined)
        return;
    if ((0, triggers_1.tired)(character)) {
        if (character.current_building == undefined) {
            let building_to_rest = find_building_to_rest(character, rest_budget(character));
            if (building_to_rest == undefined) {
                (0, actions_1.rest_outside)(character);
                character.ai_memories.push("no_money" /* AImemory.NO_MONEY */);
            }
            else {
                let result = effects_1.Effect.rent_room(character.id, building_to_rest);
                if (result.response == triggers_2.ResponceNegative.no_money) {
                    (0, actions_1.rest_outside)(character);
                    character.ai_memories.push("no_money" /* AImemory.NO_MONEY */);
                }
            }
        }
        else {
            let building = data_1.Data.Buildings.from_id(character.current_building);
            let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
            let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race);
            const stress_target = scripted_values_1.ScriptedValue.rest_target_stress(tier, building.durability, character.race);
            if ((fatigue_target >= character.get_fatigue()) && (stress_target >= character.get_stress())) {
                effects_1.Effect.leave_room(character.id);
            }
        }
    }
}
exports.GenericRest = GenericRest;
