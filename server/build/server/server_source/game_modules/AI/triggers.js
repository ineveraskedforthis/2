"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.low_hp = exports.tired = void 0;
const scripted_values_1 = require("../events/scripted_values");
function tired(character) {
    return (character.get_fatigue() > scripted_values_1.ScriptedValue.rest_target_fatigue(0, 0, character.race()) + 10)
        || (character.get_stress() > scripted_values_1.ScriptedValue.rest_target_stress(0, 0, character.race()) + 10);
}
exports.tired = tired;
function low_hp(character) {
    return character.get_hp() < 0.5 * character.get_max_hp();
}
exports.low_hp = low_hp;
