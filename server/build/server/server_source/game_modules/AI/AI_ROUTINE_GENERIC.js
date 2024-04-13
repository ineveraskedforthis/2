"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRest = exports.find_location_to_rest = exports.ForestPassiveRoutine = exports.PassiveRoutine = exports.SteppePassiveRoutine = exports.SteppeAgressiveRoutine = void 0;
const scripted_values_1 = require("../events/scripted_values");
const ACTIONS_BASIC_1 = require("./ACTIONS_BASIC");
const constraints_1 = require("./constraints");
const helpers_1 = require("./helpers");
const effects_1 = require("../events/effects");
const triggers_1 = require("../events/triggers");
const system_1 = require("../battle/system");
const AI_TRIGGERS_1 = require("./AI_TRIGGERS");
const data_objects_1 = require("../data/data_objects");
const data_id_1 = require("../data/data_id");
function SteppeAgressiveRoutine(character) {
    if (AI_TRIGGERS_1.AI_TRIGGER.tired(character)) {
        (0, ACTIONS_BASIC_1.rest_outside)(character);
    }
    else {
        let target = helpers_1.AIhelper.enemies_in_cell(character);
        if (target != undefined) {
            const target_char = data_objects_1.Data.Characters.from_id(target);
            system_1.BattleSystem.start_battle(character, target_char);
        }
        else {
            (0, ACTIONS_BASIC_1.random_walk)(character, constraints_1.steppe_constraints);
        }
    }
}
exports.SteppeAgressiveRoutine = SteppeAgressiveRoutine;
function SteppePassiveRoutine(character) {
    if (AI_TRIGGERS_1.AI_TRIGGER.tired(character)) {
        (0, ACTIONS_BASIC_1.rest_outside)(character);
    }
    else {
        (0, ACTIONS_BASIC_1.random_walk)(character, constraints_1.steppe_constraints);
    }
}
exports.SteppePassiveRoutine = SteppePassiveRoutine;
function PassiveRoutine(character) {
    if (AI_TRIGGERS_1.AI_TRIGGER.tired(character)) {
        (0, ACTIONS_BASIC_1.rest_outside)(character);
    }
    else {
        (0, ACTIONS_BASIC_1.random_walk)(character, constraints_1.simple_constraints);
    }
}
exports.PassiveRoutine = PassiveRoutine;
function ForestPassiveRoutine(character) {
    if (AI_TRIGGERS_1.AI_TRIGGER.tired(character)) {
        (0, ACTIONS_BASIC_1.rest_outside)(character);
    }
    else {
        (0, ACTIONS_BASIC_1.random_walk)(character, constraints_1.forest_constraints);
    }
}
exports.ForestPassiveRoutine = ForestPassiveRoutine;
function find_location_to_rest(character, budget) {
    let cell = character.cell_id;
    let locations = data_id_1.DataID.Cells.locations(cell);
    let fatigue_utility = 1;
    let money_utility = 10;
    let best_utility = 0;
    let target = undefined;
    for (let item of locations) {
        let location = data_objects_1.Data.Locations.from_id(item);
        let price = scripted_values_1.ScriptedValue.rest_price(character, location);
        let tier = scripted_values_1.ScriptedValue.rest_tier(character, location);
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, scripted_values_1.ScriptedValue.max_devastation - location.devastation, character.race);
        let fatigue_change = character.get_fatigue() - fatigue_target;
        let utility = fatigue_change / price;
        if ((utility > best_utility) && (price <= budget)) {
            target = item;
            best_utility = utility;
        }
    }
    return target;
}
exports.find_location_to_rest = find_location_to_rest;
function rest_budget(character) {
    let budget = character.savings.get();
    if (budget < 50) {
        budget = 0;
    }
    return (budget - 50);
}
function GenericRest(character) {
    if (character.action != undefined)
        return undefined;
    if (AI_TRIGGERS_1.AI_TRIGGER.tired(character)) {
        let location_to_rest = find_location_to_rest(character, rest_budget(character));
        if (location_to_rest == undefined) {
            (0, ACTIONS_BASIC_1.rest_outside)(character);
            character.ai_memories.push("no_money" /* AImemory.NO_MONEY */);
        }
        else {
            let result = effects_1.Effect.enter_location(character.id, location_to_rest);
            if (result.response == triggers_1.ResponseNegative.no_money) {
                (0, ACTIONS_BASIC_1.rest_outside)(character);
                character.ai_memories.push("no_money" /* AImemory.NO_MONEY */);
            }
        }
        let location = data_objects_1.Data.Locations.from_id(character.location_id);
        let fatigue_target = scripted_values_1.ScriptedValue.target_fatigue(character, location);
        const stress_target = scripted_values_1.ScriptedValue.target_stress(character, location);
        if ((fatigue_target + 1 >= character.get_fatigue()) && (stress_target + 1 >= character.get_stress())) {
            character.ai_memories.push("rested" /* AImemory.RESTED */);
            return false;
        }
        else
            return true;
    }
    return false;
}
exports.GenericRest = GenericRest;
