"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cook_elo_to_zaz = exports.cook_fish = exports.cook_meat = exports.ELODINO_TIER = exports.COOKING_TIER = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const user_manager_1 = require("../../../client_communication/user_manager");
const craft_1 = require("../../../craft/craft");
const craft_2 = require("../../../calculations/craft");
exports.COOKING_TIER = 10;
exports.ELODINO_TIER = 30;
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
            char.stash.inc(materials_manager_1.MEAT, -1);
            (0, craft_1.craft_bulk)(char, materials_manager_1.FOOD, craft_2.Craft.Amount.Cooking.meat, 'cooking', 10);
        }
    },
    start: function (char, data) {
    },
};
exports.cook_fish = {
    duration(char) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking) / 20;
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.FISH);
            if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.FISH);
        if (tmp > 0) {
            char.stash.inc(materials_manager_1.FISH, -1);
            (0, craft_1.craft_bulk)(char, materials_manager_1.FOOD, craft_2.Craft.Amount.Cooking.meat, 'cooking', 10);
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
            if (tmp >= 1) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.ELODINO_FLESH);
        if (tmp > 0) {
            char.stash.inc(materials_manager_1.ELODINO_FLESH, -1);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            (0, craft_1.craft_bulk)(char, materials_manager_1.FOOD, craft_2.Craft.Amount.Cooking.elodino, 'cooking', 30);
            (0, craft_1.craft_bulk)(char, materials_manager_1.ZAZ, craft_2.Craft.Amount.elodino_zaz_extraction, 'cooking', 30);
        }
    },
    start: function (char, data) {
    },
};
