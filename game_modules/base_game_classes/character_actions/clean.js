"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
exports.clean = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* INVALID_CELL */;
            }
            let tmp = char.stash.get('water');
            if (cell.can_clean()) {
                return 1 /* OK */;
            }
            else if (tmp > 0) {
                return 1 /* OK */;
            }
            return 3 /* NO_RESOURCE */;
        }
        return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return 6 /* INVALID_CELL */;
        }
        let tmp = char.stash.get('water');
        if (cell.can_clean()) {
            char.changed = true;
            char.change_blood(-20);
            char.send_status_update();
        }
        else if (tmp > 0) {
            char.changed = true;
            char.change_blood(-20);
            char.stash.inc('water', -1);
            char.send_stash_update();
            char.send_status_update();
        }
    },
    start: async function (pool, char, data) {
    },
};
