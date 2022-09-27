"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_wood_bow = exports.craft_bone_arrow = exports.craft_bone_arrow_probability = exports.craft_bone_spear = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../base_game_classes/items/items_set_up");
const item_tags_1 = require("../../static_data/item_tags");
const craft_spear_1 = require("./craft_spear");
exports.craft_bone_spear = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
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
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp > 2) && (tmp_2 > 3)) {
            char.changed = true;
            let skill = char.skills.woodwork;
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
                    char.skills.woodwork += 1;
                    char.send_skills_update();
                    char.changed = true;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
let BONE_ARROW_DIFFICULTY = 20;
function craft_bone_arrow_probability(character) {
    if (character.skills.perks.fletcher) {
        return 1;
    }
    return 0.7 * Math.min(1, character.skills.woodwork / BONE_ARROW_DIFFICULTY);
}
exports.craft_bone_arrow_probability = craft_bone_arrow_probability;
exports.craft_bone_arrow = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
            if ((tmp >= 1) && (tmp_2 >= 10)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        let tmp_2 = char.stash.get(materials_manager_1.RAT_BONE);
        if ((tmp >= 1) && (tmp_2 >= 10)) {
            char.changed = true;
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -1);
            char.stash.inc(materials_manager_1.RAT_BONE, -10);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let dice = Math.random();
            let amount = Math.round((craft_bone_arrow_probability(char) / dice) * 10);
            char.stash.inc(materials_manager_1.ARROW_BONE, amount);
            char.send_stash_update();
            char.send_status_update();
            if (skill < 10) {
                char.skills.woodwork += 1;
            }
        }
    },
    start: function (char, data) {
    },
};
exports.craft_wood_bow = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            // let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp >= 3)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        // let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp >= 3)) {
            char.changed = true;
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let dice = Math.random();
            if (dice < (0, craft_spear_1.craft_spear_probability)(skill)) {
                let bow = new item_tags_1.Weapon(items_set_up_1.BASIC_BOW_ARGUMENT);
                char.equip.add_weapon(bow);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'bow is finished');
                char.send_stash_update();
                char.send_equip_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.woodwork += 1;
                    char.send_skills_update();
                    char.changed = true;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
