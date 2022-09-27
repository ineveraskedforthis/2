"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cook_elo_to_zaz = exports.cook_meat = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.cook_meat = {
    duration(char) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking) / 20;
        return 0.5;
    },
    check:  function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.MEAT);
            if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result:  function (pool, char, data) {
        let tmp = char.stash.get(materials_manager_1.MEAT);
        if (tmp > 0) {
            char.changed = true;
            let skill = char.skills.cooking;
            let check = cook_meat_probability(skill, char.skills.perks);
            let dice = Math.random();
            char.stash.inc(materials_manager_1.MEAT, -1);
            char.send_stash_update();
            char.change_fatigue(10);
            if (dice < check) {
                char.stash.inc(materials_manager_1.FOOD, 1);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared');
                char.send_stash_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                if (skill < 19) {
                    char.skills.cooking += 1;
                    char.send_skills_update();
                }
                char.change_stress(5);
                char.send_status_update();
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start:  function (pool, char, data) {
    },
};
exports.cook_elo_to_zaz = {
    duration(char) {
        return Math.max(0.5, 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking - char.skills.magic_mastery) / 20);
    },
    check:  function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.ELODINO_FLESH);
            if (tmp >= 5) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result:  function (pool, char, data) {
        let tmp = char.stash.get(materials_manager_1.ELODINO_FLESH);
        if (tmp > 0) {
            char.changed = true;
            let skill1 = char.skills.cooking;
            let skill2 = char.skills.magic_mastery;
            let check = cook_elodino_flesh_probability(skill1, skill2, char.skills.perks);
            let dice = Math.random();
            char.stash.inc(materials_manager_1.ELODINO_FLESH, -5);
            char.send_stash_update();
            char.change_fatigue(10);
            if (dice < check) {
                char.stash.inc(materials_manager_1.ZAZ, 1);
                char.stash.inc(materials_manager_1.MEAT, 1);
                dice = Math.random() * 100;
                if (dice * char.skills.magic_mastery < 5) {
                    char.skills.magic_mastery += 1;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared');
                char.send_stash_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                let dice = Math.random();
                if (skill1 < COOK_ELODINO_DIFFICULTY * dice) {
                    char.skills.cooking += 1;
                }
                char.send_skills_update();
                char.change_stress(5);
                char.send_status_update();
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start:  function (pool, char, data) {
    },
};
