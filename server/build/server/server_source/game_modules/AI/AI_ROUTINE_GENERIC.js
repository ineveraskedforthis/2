"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForestPassiveRoutine = exports.SteppePassiveRoutine = exports.SteppeAgressiveRoutine = void 0;
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
const actions_1 = require("./actions");
const constraints_1 = require("./constraints");
const helpers_1 = require("./helpers");
const triggers_1 = require("./triggers");
function SteppeAgressiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        let target = helpers_1.AIhelper.enemies_in_cell(character);
        const target_char = systems_communication_1.Convert.id_to_character(target);
        if (target_char != undefined) {
            events_1.Event.start_battle(character, target_char);
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
function ForestPassiveRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        (0, actions_1.rest_outside)(character);
    }
    else {
        (0, actions_1.random_walk)(character, constraints_1.forest_constraints);
    }
}
exports.ForestPassiveRoutine = ForestPassiveRoutine;
