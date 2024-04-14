"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = exports.eat = exports.clean = void 0;
const effects_1 = require("../events/effects");
const generator_1 = require("./generator");
const generic_functions_1 = require("./generic_functions");
const events_1 = require("../events/events");
const system_1 = require("../character/system");
const scripted_values_1 = require("../events/scripted_values");
const user_manager_1 = require("../client_communication/user_manager");
const system_2 = require("../map/system");
const CLEAN_FATIGUE_COST = 5;
function clean_duration_modifier(character) {
    return 1 + character.get_blood() / 50;
}
function clean_trigger(character) {
    if (system_2.MapSystem.can_clean(character.location_id)) {
        return { response: "OK" };
    }
    return { response: "NO_RESOURCE" };
}
function eat_trigger(character, cell) {
    let tmp = character.stash.get(19 /* MATERIAL.MEAT_RAT_FRIED */);
    if (tmp > 0) {
        return { response: "OK" };
    }
    return { response: "NO_RESOURCE" };
}
function clean_effect(character, cell) {
    effects_1.Effect.Change.blood(character, -100);
}
function eat_effect(character, cell) {
    effects_1.Effect.Change.fatigue(character, -2);
    effects_1.Effect.Change.stress(character, -3);
    effects_1.Effect.Change.hp(character, 10);
    events_1.Event.change_stash(character, 19 /* MATERIAL.MEAT_RAT_FRIED */, -1);
}
exports.clean = (0, generator_1.generate_action)(CLEAN_FATIGUE_COST, clean_duration_modifier, clean_trigger, clean_effect, generic_functions_1.dummy_effect);
exports.eat = (0, generator_1.generate_action)(0, generic_functions_1.basic_duration_modifier, eat_trigger, eat_effect, generic_functions_1.dummy_effect);
exports.rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, cell) {
        if (char.in_battle())
            return { response: 'IN_BATTLE' };
        let skill = system_1.CharacterSystem.skill(char, 'travelling');
        let target_fatigue = scripted_values_1.ScriptedValue.rest_target_fatigue(0, skill, char.race);
        let target_stress = scripted_values_1.ScriptedValue.rest_target_stress(0, skill, char.race);
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return { response: 'IMPOSSIBLE_ACTION' };
        }
        return { response: 'OK' };
    },
    result: function (char, cell) {
        let skill = system_1.CharacterSystem.skill(char, 'travelling');
        let target_fatigue = scripted_values_1.ScriptedValue.rest_target_fatigue(0, skill, char.race);
        let target_stress = scripted_values_1.ScriptedValue.rest_target_stress(0, skill, char.race);
        if (target_fatigue < char.get_fatigue())
            char.set_fatigue(target_fatigue);
        if (target_stress < char.get_stress())
            char.set('stress', target_stress);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
    },
    start: function (char, cell) {
    },
};

