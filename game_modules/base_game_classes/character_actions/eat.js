"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eat = void 0;
exports.eat = {
    duration(char) {
        return 1 + char.get_fatigue() / 20;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.FOOD);
            if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        char.changed = true;
        char.change_hp(10);
        char.stash.inc(char.world.materials.FOOD, -1);
        char.send_stash_update();
        char.send_status_update();
    },
    start: async function (pool, char, data) {
    },
};
