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
        let cell = char.get_cell();
        if (cell == undefined)
            return;
        if (cell.can_rest() || (char.misc.tag == 'rat')) {
            char.change_fatigue(-20);
            char.change_stress(-5);
        }
        else {
            let df = 10;
            if (char.get_fatigue() - df < 40) {
                df = char.get_fatigue() - 40;
            }
            char.change_fatigue(df);
        }
        char.send_status_update();
    },
    start: async function (pool, char, data) {
    },
};
