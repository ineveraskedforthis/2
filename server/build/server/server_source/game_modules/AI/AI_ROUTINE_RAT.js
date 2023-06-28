"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatRoutine = void 0;
const actions_00_1 = require("../actions/actions_00");
const manager_1 = require("../actions/manager");
const actions_1 = require("./actions");
const constraints_1 = require("./constraints");
function RatRoutine(char) {
    if ((char.get_fatigue() > 90) || (char.get_stress() > 90)) {
        // console.log('rest')
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.REST, char, char.cell_id);
        return;
    }
    else if (char.get_fatigue() > 50) {
        // console.log('go home')
        (0, actions_1.rat_go_home)(char, constraints_1.simple_constraints);
        return;
    }
    (0, actions_1.rat_walk)(char, constraints_1.simple_constraints);
}
exports.RatRoutine = RatRoutine;
