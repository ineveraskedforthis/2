"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_spear = void 0;
const items_set_up_1 = require("../../../items/items_set_up");
const user_manager_1 = require("../../../client_communication/user_manager");
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const craft_1 = require("../../../calculations/craft");
const craft_2 = require("../../../craft/craft");
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
        if (tmp >= 3) {
            char.stash.inc(materials_manager_1.WOOD, -3);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            (0, craft_2.craft_item)(char, items_set_up_1.SPEAR_ARGUMENT, craft_1.Craft.Durability.wood_item, 'woodwork', 1);
        }
    },
    start: function (char, data) {
    },
};
