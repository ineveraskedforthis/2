"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eat = void 0;
exports.eat = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get('food');
            if (tmp > 0) {
                return 1 /* OK */;
            }
            return 3 /* NO_RESOURCE */;
        }
        return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        char.change_hp(10);
        char.stash.inc('food', -1);
        char.send_stash_update();
        char.send_status_update();
    },
    start: async function (pool, char, data) {
    },
};
