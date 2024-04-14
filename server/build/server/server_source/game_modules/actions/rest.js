"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proper_rest = exports.rest = void 0;
const systems_communication_1 = require("../systems_communication");
const user_manager_1 = require("../client_communication/user_manager");
const scripted_values_1 = require("../events/scripted_values");
const system_1 = require("../character/system");
exports.rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, data) {
        if (char.in_battle())
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        let skill = system_1.CharacterSystem.skill(char, 'travelling');
        let target_fatigue = scripted_values_1.ScriptedValue.rest_target_fatigue(0, skill, char.race);
        let target_stress = scripted_values_1.ScriptedValue.rest_target_stress(0, skill, char.race);
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 1 /* CharacterActionResponce.OK */;
    },
    result: function (char, data) {
        const cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return;
        let skill = system_1.CharacterSystem.skill(char, 'travelling');
        let target_fatigue = scripted_values_1.ScriptedValue.rest_target_fatigue(0, skill, char.race);
        let target_stress = scripted_values_1.ScriptedValue.rest_target_stress(0, skill, char.race);
        if (target_fatigue < char.get_fatigue())
            char.set_fatigue(target_fatigue);
        if (target_stress < char.get_stress())
            char.set('stress', target_stress);
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













































