"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
const systems_communication_1 = require("../systems_communication");
const user_manager_1 = require("../client_communication/user_manager");
exports.clean = {
    duration(char) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            const cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_clean()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        const cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined) {
            return 6 /* CharacterActionResponce.INVALID_CELL */;
        }
        if (cell.can_clean()) {
            char.change_blood(-100);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        }
    },
    start: function (char, data) {
    },
};
