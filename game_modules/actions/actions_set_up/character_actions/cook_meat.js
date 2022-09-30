"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cook_elo_to_zaz = exports.cook_meat = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const craft_1 = require("../../../calculations/craft");
const user_manager_1 = require("../../../client_communication/user_manager");
const alerts_1 = require("../../../client_communication/network_actions/alerts");
exports.cook_meat = {
    duration(char) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking) / 20;
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.MEAT);
            if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.MEAT);
        if (tmp > 0) {
            let skill = char.skills.cooking;
            let check = craft_1.CraftProbability.meat_to_food(char);
            let dice = Math.random();
            char.stash.inc(materials_manager_1.MEAT, -1);
            char.change_fatigue(10);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            if (dice < check) {
                char.stash.inc(materials_manager_1.FOOD, 1);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                if (skill < 19) {
                    char.skills.cooking += 1;
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.COOKING_SKILL */);
                }
                char.change_stress(5);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                alerts_1.Alerts.failed(char);
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
exports.cook_elo_to_zaz = {
    duration(char) {
        return Math.max(0.5, 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking - char.skills.magic_mastery) / 20);
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.ELODINO_FLESH);
            if (tmp >= 5) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.ELODINO_FLESH);
        if (tmp > 0) {
            let skill1 = char.skills.cooking;
            let skill2 = char.skills.magic_mastery;
            let check = craft_1.CraftProbability.elo_to_food(char);
            let dice = Math.random();
            char.stash.inc(materials_manager_1.ELODINO_FLESH, -5);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            if (dice < check) {
                char.stash.inc(materials_manager_1.ZAZ, 1);
                char.stash.inc(materials_manager_1.MEAT, 1);
                dice = Math.random() * 100;
                if (dice * char.skills.magic_mastery < 5) {
                    char.skills.magic_mastery += 1;
                }
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                let dice = Math.random();
                if (skill1 < craft_1.COOK_ELODINO_DIFFICULTY * dice) {
                    char.skills.cooking += 1;
                }
                char.change_stress(5);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                alerts_1.Alerts.failed(char);
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
