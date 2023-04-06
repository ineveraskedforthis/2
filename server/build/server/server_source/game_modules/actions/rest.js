"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proper_rest = exports.rest = void 0;
const systems_communication_1 = require("../systems_communication");
const user_manager_1 = require("../client_communication/user_manager");
exports.rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, data) {
        if (char.in_battle())
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        if (char.get_fatigue() < 25) {
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 1 /* CharacterActionResponce.OK */;
    },
    result: function (char, data) {
        const cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return;
        char.set_fatigue(25);
        if ((char.archetype.race == 'rat') || (char.race() == 'elo')) {
            char.set_fatigue(0);
            char.change_stress(-4);
        }
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
    },
    start: function (char, data) {
    },
};
exports.proper_rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, data) {
        if (char.in_battle())
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        return 6 /* CharacterActionResponce.INVALID_CELL */;
    },
    result: function (char, data) {
        char.set_fatigue(0);
        char.change_stress(-5);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
    },
    start: function (char, data) {
    },
};
