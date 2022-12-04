"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_rat_boots = exports.craft_rat_helmet = exports.craft_rat_pants = exports.craft_rat_gloves = exports.craft_rat_armour = exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../items/items_set_up");
const user_manager_1 = require("../../../client_communication/user_manager");
const craft_1 = require("../../../craft/craft");
const craft_2 = require("../../../calculations/craft");
function generate_rat_skin_craft(arg, cost) {
    return {
        duration(char) {
            return 0.5;
            return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier) / 20;
        },
        check: function (char, data) {
            if (!char.in_battle()) {
                let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
                if (tmp >= cost) {
                    return 1 /* CharacterActionResponce.OK */;
                }
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        },
        result: function (char, data) {
            let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
            if (tmp >= cost) {
                char.stash.inc(materials_manager_1.RAT_SKIN, -cost);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                (0, craft_1.craft_item)(char, arg, craft_2.Craft.Durability.skin_item, 'clothier', 2);
            }
        },
        start: function (char, data) {
        },
    };
}
exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = 10;
exports.craft_rat_armour = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT, exports.RAT_SKIN_ARMOUR_SKIN_NEEDED);
exports.craft_rat_gloves = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_GLOVES_ARGUMENT, 5);
exports.craft_rat_pants = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT, 8);
exports.craft_rat_helmet = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_HELMET_ARGUMENT, 5);
exports.craft_rat_boots = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT, 5);
