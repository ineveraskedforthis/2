"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fish = exports.hunt = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const user_manager_1 = require("../client_communication/user_manager");
const events_1 = require("../events/events");
exports.hunt = {
    duration(char) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_hunt()) {
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
        let skill = char.skills.hunt;
        let dice = Math.random();
        char.change_fatigue(10);
        if (dice * 100 < skill) {
            events_1.Event.change_stash(char, materials_manager_1.MEAT, 1);
            char.change_blood(5);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            return 1 /* CharacterActionResponce.OK */;
        }
        else {
            let dice = Math.random();
            if (dice * 100 > skill) {
                char.skills.hunt += 1;
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
            }
            char.change_stress(1);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            return 4 /* CharacterActionResponce.FAILED */;
        }
    },
    start: function (char, data) {
    },
};
exports.fish = {
    duration(char) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.fishing) / 100;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_fish()) {
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
        let skill = char.skills.fishing;
        let dice = Math.random();
        char.change_fatigue(10);
        if (dice * 100 < skill) {
            events_1.Event.change_stash(char, materials_manager_1.FISH, 1);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            return 1 /* CharacterActionResponce.OK */;
        }
        else {
            let dice = Math.random();
            if (dice * 100 > skill) {
                char.skills.fishing += 1;
                user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 12 /* UI_Part.SKILLS */);
            }
            char.change_stress(1);
            // UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            return 4 /* CharacterActionResponce.FAILED */;
        }
    },
    start: function (char, data) {
    },
};
