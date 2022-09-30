"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = void 0;
const systems_communication_1 = require("../../../systems_communication");
const user_manager_1 = require("../../../client_communication/user_manager");
exports.rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            const cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (char.archetype.race == 'rat') {
                return 1 /* CharacterActionResponce.OK */;
            }
            if (cell.can_rest()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            if (char.get_fatigue() < 40) {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
            return 1 /* CharacterActionResponce.OK */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        const cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return;
        if (cell.can_rest() || (char.archetype.race == 'rat')) {
            char.set_fatigue(0);
            char.change_stress(-4);
        }
        else {
            char.set_fatigue(30);
        }
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
    },
    start: function (char, data) {
    },
};
