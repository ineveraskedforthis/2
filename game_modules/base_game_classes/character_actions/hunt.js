"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hunt = void 0;
exports.hunt = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* INVALID_CELL */;
            }
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
        char.changed = true;
        let skill = char.skills.hunt.practice;
        let dice = Math.random();
        char.change_fatigue(10);
        if (dice * 100 > skill) {
            char.stash.inc(char.world.materials.MEAT, 1);
            char.change_blood(5);
        }
        else {
            let dice = Math.random();
            if (dice * 100 > skill) {
                char.skills.hunt.practice += 1;
            }
            char.change_stress(1);
        }
        char.send_status_update();
        char.send_stash_update();
    },
    start: async function (pool, char, data) {
    },
};
