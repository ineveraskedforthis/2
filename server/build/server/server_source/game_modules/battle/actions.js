"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../character/system");
function always(character) {
    return true;
}
const ActionsList = {
    'move': {
        ap_cost: (character, unit, distance) => {
            return system_1.CharacterSystem.movement_cost_battle(character) * distance;
        },
        unlocked: always
    }
};
