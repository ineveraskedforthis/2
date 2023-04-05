"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.low_hp = exports.tired = void 0;
function tired(character) {
    return (character.get_fatigue() > 70) || (character.get_stress() > 30);
}
exports.tired = tired;
function low_hp(character) {
    return character.get_hp() < 0.5 * character.get_max_hp();
}
exports.low_hp = low_hp;
