"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cook_meat = void 0;
exports.cook_meat = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get('meat');
            if (tmp > 0) {
                return 1 /* OK */;
            }
            return 3 /* NO_RESOURCE */;
        }
        return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let tmp = char.stash.get('meat');
        if (tmp > 0) {
            char.changed = true;
            let skill = char.skills.cooking.practice;
            let check = 0;
            if (char.skills.perks.meat_master) {
                check = 1;
            }
            else if (skill > 20) {
                check = 0.7;
            }
            else {
                check = 0.7 * skill / 20;
            }
            let dice = Math.random();
            char.stash.inc('meat', -1);
            char.send_stash_update();
            if (dice < check) {
                char.change_stress(1);
                char.stash.inc('food', 1);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared');
                char.send_stash_update();
                char.send_status_update();
                return 1 /* OK */;
            }
            else {
                if (skill < 19) {
                    char.skills.cooking.practice += 1;
                    char.send_skills_update();
                }
                char.change_stress(5);
                char.send_status_update();
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* FAILED */;
            }
        }
    },
    start: async function (pool, char, data) {
    },
};
