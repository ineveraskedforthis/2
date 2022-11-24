"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_rat_boots = exports.craft_rat_helmet = exports.craft_rat_pants = exports.craft_rat_gloves = exports.craft_rat_armour = exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../items/items_set_up");
const system_1 = require("../../../items/system");
const craft_1 = require("../../../calculations/craft");
const user_manager_1 = require("../../../client_communication/user_manager");
const alerts_1 = require("../../../client_communication/network_actions/alerts");
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
                let skill = char.skills.clothier;
                char.stash.inc(materials_manager_1.RAT_SKIN, -cost);
                char.change_fatigue(10);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
                let dice = Math.random();
                if (dice < craft_1.CraftProbability.from_rat_skin(char)) {
                    let armour = system_1.ItemSystem.create(arg);
                    char.equip.data.backpack.add(armour);
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 6 /* UI_Part.INVENTORY */);
                    return 1 /* CharacterActionResponce.OK */;
                }
                else {
                    char.change_stress(1);
                    if (skill < 20) {
                        char.skills.clothier += 1;
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
}
exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = 10;
exports.craft_rat_armour = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT, exports.RAT_SKIN_ARMOUR_SKIN_NEEDED);
exports.craft_rat_gloves = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_GLOVES_ARGUMENT, 5);
exports.craft_rat_pants = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT, 8);
exports.craft_rat_helmet = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_HELMET_ARGUMENT, 5);
exports.craft_rat_boots = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT, 5);
