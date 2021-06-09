"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = void 0;
exports.rest = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* INVALID_CELL */;
            }
            if (cell.can_rest() || (char.misc.tag == 'rat')) {
                return 1 /* OK */;
            }
            return 3 /* NO_RESOURCE */;
        }
        return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        char.changed = true;
        char.change_fatigue(-20);
        char.change_stress(-5);
        char.send_status_update();
    },
    start: async function (pool, char, data) {
    },
};
