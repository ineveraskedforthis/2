"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardUrbanRoutine = void 0;
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
const actions_1 = require("./actions");
const helpers_1 = require("./helpers");
const triggers_1 = require("./triggers");
function GuardUrbanRoutine(character) {
    if ((0, triggers_1.tired)(character)) {
        let responce = (0, actions_1.rest_building)(character, character.savings.get());
        if (!responce) {
            (0, actions_1.rest_outside)(character);
            return;
        }
        return;
    }
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
