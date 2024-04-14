"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gather_cotton = exports.gather_wood = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const effects_1 = require("../events/effects");
const events_1 = require("../events/events");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const data_1 = require("../data");
exports.gather_wood = {
    duration(char) {
        return 1 + char.get_fatigue() / 50;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = char.cell_id;
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (data_1.Data.Cells.has_forest(cell)) {
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
        if (data_1.Data.Cells.has_forest(char.cell_id)) {
            events_1.Event.remove_tree(char.cell_id);
            effects_1.Effect.Change.fatigue(char, 10);
            effects_1.Effect.Change.stress(char, 1);
            char.change('blood', 1);
            events_1.Event.change_stash(char, materials_manager_1.WOOD, 1);
        }
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
            let cell = char.cell_id;
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (data_1.Data.Cells.has_cotton(cell)) {
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
        const cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell.cotton > 0) {
            cell.cotton -= 1;
        }
        effects_1.Effect.Change.fatigue(char, 10);
        effects_1.Effect.Change.stress(char, 1);
        char.change('blood', 1);
        events_1.Event.change_stash(char, materials_manager_1.COTTON, 1);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
        return 1 /* CharacterActionResponce.OK */;
    },
    start: function (char, data) {
    },
};













































