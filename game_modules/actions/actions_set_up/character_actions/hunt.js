"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.character_to_hunt_probability = exports.hunt_probability = exports.hunt = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.hunt = {
    duration(char) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_hunt()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        char.changed = true;
        let skill = char.skills.hunt;
        let dice = Math.random();
        char.change_fatigue(10);
        if (dice * 100 < skill) {
            char.stash.inc(materials_manager_1.MEAT, 1);
            char.change_blood(5);
            char.send_status_update();
            char.send_stash_update();
            return 1 /* CharacterActionResponce.OK */;
        }
        else {
            let dice = Math.random();
            if (dice * 100 > skill) {
                char.skills.hunt += 1;
                char.send_skills_update();
            }
            char.change_stress(1);
            char.send_status_update();
            char.send_stash_update();
            return 4 /* CharacterActionResponce.FAILED */;
        }
    },
    start: function (char, data) {
    },
};
function hunt_probability(skill) {
    return Math.min(skill / 100, 1);
}
exports.hunt_probability = hunt_probability;
function character_to_hunt_probability(character) {
    let skill = character.skills.hunt;
    return hunt_probability(skill);
}
exports.character_to_hunt_probability = character_to_hunt_probability;
