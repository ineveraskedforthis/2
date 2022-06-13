"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gather_wood = void 0;
exports.gather_wood = {
    duration(char) {
        return 2 + char.get_fatigue() / 10;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* INVALID_CELL */;
            }
            if (cell.development.wild > 0) {
                return 1 /* OK */;
            }
            else {
                return 3 /* NO_RESOURCE */;
            }
        }
        else
            return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        char.changed = true;
        char.change_fatigue(10);
        char.stash.inc(char.world.materials.WOOD, 1);
        char.change_blood(1);
        char.change_stress(1);
        char.send_status_update();
        char.send_stash_update();
    },
    start: async function (pool, char, data) {
    },
};
