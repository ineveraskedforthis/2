"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardUrbanRoutine = void 0;
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const actions_1 = require("./actions");
const helpers_1 = require("./helpers");
function GuardUrbanRoutine(character) {
    (0, AI_ROUTINE_GENERIC_1.GenericRest)(character);
    let target = helpers_1.AIhelper.enemies_in_cell(character);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        events_1.Event.start_battle(character, target_char);
    }
    else {
        (0, actions_1.urban_walk)(character);
        return;
    }
}
exports.GuardUrbanRoutine = GuardUrbanRoutine;
