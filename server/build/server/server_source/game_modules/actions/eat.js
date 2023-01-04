"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eat = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const user_manager_1 = require("../client_communication/user_manager");
const events_1 = require("../events/events");
exports.eat = {
    duration(char) {
        return 1 + char.get_fatigue() / 20;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.FOOD);
            if (tmp > 0) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        char.change_hp(10);
        char.change_fatigue(-10);
        char.change_stress(-1);
        events_1.Event.change_stash(char, materials_manager_1.FOOD, -1);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
    },
    start: function (char, data) {
    },
};
