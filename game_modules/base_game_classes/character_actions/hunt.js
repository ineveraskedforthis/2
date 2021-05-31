"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hunt = void 0;
exports.hunt = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell.can_hunt()) {
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
        char.change_stress(5);
        char.stash.inc('meat', 1);
        char.change_blood(5);
        char.send_status_update();
        char.send_stash_update();
    },
    start: async function (pool, char, data) {
    },
};
