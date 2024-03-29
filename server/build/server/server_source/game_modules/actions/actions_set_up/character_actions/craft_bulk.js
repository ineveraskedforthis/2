"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cook_elo_to_zaz = exports.process_cotton = exports.cook_fish = exports.cook_meat = exports.ELODINO_TIER = exports.COOKING_TIER = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const user_manager_1 = require("../../../client_communication/user_manager");
const craft_1 = require("../../../craft/craft");
const craft_2 = require("../../../calculations/craft");
const generate_craft_item_action_1 = require("./generate_craft_item_action");
exports.COOKING_TIER = 10;
exports.ELODINO_TIER = 30;
exports.cook_meat = (0, generate_craft_item_action_1.generate_bulk_craft)([{ material: materials_manager_1.MEAT, amount: 1 }], materials_manager_1.FOOD, craft_2.Craft.Amount.Cooking.meat, 'cooking', exports.COOKING_TIER);
exports.cook_fish = (0, generate_craft_item_action_1.generate_bulk_craft)([{ material: materials_manager_1.FISH, amount: 1 }], materials_manager_1.FOOD, craft_2.Craft.Amount.Cooking.meat, 'cooking', exports.COOKING_TIER);
exports.process_cotton = (0, generate_craft_item_action_1.generate_bulk_craft)([{ material: materials_manager_1.COTTON, amount: 1 }], materials_manager_1.TEXTILE, craft_2.Craft.Amount.textile, 'clothier', 5);
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
