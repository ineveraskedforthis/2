"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_spear = void 0;
const items_set_up_1 = require("../../../items/items_set_up");
const system_1 = require("../../../items/system");
const craft_1 = require("../../../calculations/craft");
const user_manager_1 = require("../../../client_communication/user_manager");
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.craft_spear = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            if (tmp > 2) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if (tmp > 2) {
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.change('fatigue', 10);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            let dice = Math.random();
            if (dice < craft_1.CraftProbability.basic_wood(char)) {
                let spear = system_1.ItemSystem.create(items_set_up_1.SPEAR_ARGUMENT);
                char.equip.data.backpack.add(spear);
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 6 /* UI_Part.INVENTORY */);
                if (skill < 10) {
                    char.skills.woodwork += 1;
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
                }
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change('stress', 1);
                if (skill < 20) {
                    char.skills.woodwork += 1;
                    user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
                }
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
