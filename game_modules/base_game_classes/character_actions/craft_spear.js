"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_spear = void 0;
const item_tags_1 = require("../../static_data/item_tags");
exports.craft_spear = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.WOOD);
            if (tmp > 2) {
                return 1 /* OK */;
            }
            return 3 /* NO_RESOURCE */;
        }
        return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let tmp = char.stash.get(char.world.materials.WOOD);
        if (tmp > 2) {
            char.changed = true;
            // let skill = char.skills.cooking.practice
            // let check = 0;
            // if (char.skills.perks.meat_master) {
            //     check = 1
            // } else if (skill > 20) {
            //     check = 0.7
            // } else {
            //     check = 0.7 * skill / 20
            // }
            // let dice = Math.random()
            char.stash.inc(char.world.materials.WOOD, -3);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let spear = new item_tags_1.Weapon(char.world.spear_argument);
            char.equip.add_weapon(spear);
            char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared');
            char.send_stash_update();
            char.send_status_update();
            return 1 /* OK */;
            // } else {
            //     if (skill < 19) {
            //         char.skills.cooking.practice += 1
            //         char.send_skills_update()
            //     }
            //     char.change_stress(5)
            //     char.send_status_update()
            //     char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
            //     return CharacterActionResponce.FAILED
            // }
        }
    },
    start: async function (pool, char, data) {
    },
};
