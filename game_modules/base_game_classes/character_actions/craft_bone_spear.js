"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_bone_spear = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
const items_set_up_1 = require("../../static_data/items_set_up");
const item_tags_1 = require("../../static_data/item_tags");
const craft_spear_1 = require("./craft_spear");
exports.craft_bone_spear = {
    duration(char) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.woodwork.practice) / 20;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
            if ((tmp > 2) && (tmp_2 > 3)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp > 2) && (tmp_2 > 3)) {
            char.changed = true;
            let skill = char.skills.woodwork.practice;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.stash.inc(materials_manager_1.RAT_BONE, -4);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let dice = Math.random();
            if (dice < (0, craft_spear_1.craft_spear_probability)(skill)) {
                let spear = new item_tags_1.Weapon(items_set_up_1.BONE_SPEAR_ARGUMENT);
                char.equip.add_weapon(spear);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'spear is made');
                char.send_stash_update();
                char.send_equip_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.woodwork.practice += 1;
                    char.send_skills_update();
                    char.changed = true;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: async function (pool, char, data) {
    },
};
