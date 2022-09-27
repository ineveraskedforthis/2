"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.clean = {
    duration(char) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            let tmp = char.stash.get(materials_manager_1.WATER);
            if (cell.can_clean()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return 6 /* CharacterActionResponce.INVALID_CELL */;
        }
        let tmp = char.stash.get(materials_manager_1.WATER);
        if (cell.can_clean()) {
            char.changed = true;
            char.change_blood(-100);
            char.send_status_update();
        }
        else if (tmp > 0) {
            char.changed = true;
            char.change_blood(-20);
            char.stash.inc(materials_manager_1.WATER, -1);
            char.send_stash_update();
            char.send_status_update();
        }
    },
    start: function (char, data) {
    },
};
