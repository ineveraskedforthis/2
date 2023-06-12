"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatRoutine = void 0;
const action_types_1 = require("../action_types");
const action_manager_1 = require("../actions/action_manager");
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
const actions_1 = require("./actions");
const constraints_1 = require("./constraints");
const helpers_1 = require("./helpers");
function RatRoutine(char) {
    if ((char.get_fatigue() > 90) || (char.get_stress() > 90)) {
        // console.log('rest')
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
        return;
    }
    else if (char.get_fatigue() > 30) {
        // console.log('go home')
        (0, actions_1.rat_go_home)(char, constraints_1.simple_constraints);
        return;
    }
    // console.log('check for enemies')
    let target = helpers_1.AIhelper.enemies_in_cell(char);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        events_1.Event.start_battle(char, target_char);
    }
    else {
        // console.log('walk around')
        (0, actions_1.rat_walk)(char, constraints_1.simple_constraints);
        return;
    }
}
exports.RatRoutine = RatRoutine;
