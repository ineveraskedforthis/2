"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
exports.clean = {
    duration(char) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            const cell = char.cell_id;
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (data_1.Data.Cells.can_clean(cell)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        const cell = char.cell_id;
        if (cell == undefined) {
            return 6 /* CharacterActionResponce.INVALID_CELL */;
        }
        if (data_1.Data.Cells.can_clean(cell)) {
            char.change_blood(-100);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        }
    },
    start: function (char, data) {
    },
};













































