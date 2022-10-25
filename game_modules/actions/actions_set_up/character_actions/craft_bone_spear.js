"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_wood_bow = exports.craft_bone_arrow = exports.craft_bone_spear = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../base_game_classes/items/items_set_up");
const user_manager_1 = require("../../../client_communication/user_manager");
const craft_1 = require("../../../calculations/craft");
const system_1 = require("../../../base_game_classes/items/system");
const alerts_1 = require("../../../client_communication/network_actions/alerts");
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
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.stash.inc(materials_manager_1.RAT_BONE, -4);
            char.change_fatigue(10);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            let dice = Math.random();
            if (dice < craft_1.CraftProbability.basic_wood(char)) {
                let spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
                char.equip.data.backpack.add(spear);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 6 /* UI_Part.INVENTORY */);
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.woodwork += 1;
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
                }
                alerts_1.Alerts.failed(char);
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
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
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -1);
            char.stash.inc(materials_manager_1.RAT_BONE, -10);
            char.change_fatigue(10);
            let dice = Math.random();
            let amount = Math.round((craft_1.CraftProbability.arrow(char) / dice) * 10);
            char.stash.inc(materials_manager_1.ARROW_BONE, amount);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
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
            if ((tmp >= 3)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if ((tmp >= 3)) {
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.change_fatigue(10);
            let dice = Math.random();
            if (dice < craft_1.CraftProbability.basic_wood(char)) {
                let bow = system_1.ItemSystem.create(items_set_up_1.BASIC_BOW_ARGUMENT);
                char.equip.data.backpack.add(bow);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 6 /* UI_Part.INVENTORY */);
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.woodwork += 1;
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
                }
                alerts_1.Alerts.failed(char);
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
