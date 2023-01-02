"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gather_cotton = exports.gather_wood = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
exports.gather_wood = {
    duration(char) {
        return 1 + char.get_fatigue() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_gather_wood()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        char.change('fatigue', 10);
        char.change('blood', 1);
        char.change('stress', 1);
        char.stash.inc(materials_manager_1.WOOD, 1);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
        return 1 /* CharacterActionResponce.OK */;
    },
    start: function (char, data) {
    },
};
exports.gather_cotton = {
    duration(char) {
        return 1 + char.get_fatigue() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_gather_cotton()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        char.change('fatigue', 10);
        char.change('blood', 1);
        char.change('stress', 1);
        char.stash.inc(materials_manager_1.COTTON, 1);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
        return 1 /* CharacterActionResponce.OK */;
    },
    start: function (char, data) {
    },
};
