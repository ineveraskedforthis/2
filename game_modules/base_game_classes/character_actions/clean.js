"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
exports.clean = {
    duration(char) {
        return 1 + char.get_fatigue() / 20;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            let tmp = char.stash.get(char.world.materials.WATER);
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
    result: async function (pool, char, data) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return 6 /* CharacterActionResponce.INVALID_CELL */;
        }
        let tmp = char.stash.get(char.world.materials.WATER);
        if (cell.can_clean()) {
            char.changed = true;
            char.change_blood(-20);
            char.send_status_update();
        }
        else if (tmp > 0) {
            char.changed = true;
            char.change_blood(-20);
            char.stash.inc(char.world.materials.WATER, -1);
            char.send_stash_update();
            char.send_status_update();
        }
    },
    start: async function (pool, char, data) {
    },
};
