"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.can_gather_wood = exports.gather_wood = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.gather_wood = {
    duration(char) {
        return 1 + char.get_fatigue() / 50;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.development.wild > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        char.changed = true;
        char.change_fatigue(10);
        char.stash.inc(materials_manager_1.WOOD, 1);
        char.change_blood(1);
        char.change_stress(1);
        char.send_status_update();
        char.send_stash_update();
        return 1 /* CharacterActionResponce.OK */;
    },
    start: async function (pool, char, data) {
    },
};
function can_gather_wood(cell) {
    return cell.development.wild > 0;
}
exports.can_gather_wood = can_gather_wood;
