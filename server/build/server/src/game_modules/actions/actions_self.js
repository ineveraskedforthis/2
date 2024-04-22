"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = exports.clean = void 0;
const effects_1 = require("../effects/effects");
const generator_1 = require("./generator");
const types_1 = require("./types");
const generic_functions_1 = require("./generic_functions");
const scripted_values_1 = require("../events/scripted_values");
const user_manager_1 = require("../client_communication/user_manager");
const system_1 = require("../map/system");
const data_objects_1 = require("../data/data_objects");
const CLEAN_FATIGUE_COST = 5;
function clean_duration_modifier(character) {
    return 1 + character.get_blood() / 50;
}
function clean_trigger(character) {
    if (character.status.blood == 0)
        return { response: "Notification:", value: "You are already clean" };
    if (system_1.MapSystem.can_clean(character.location_id)) {
        return { response: "OK" };
    }
    return { response: "Notification:", value: "Lack of water in this location" };
}
function clean_effect(character, cell) {
    effects_1.Effect.Change.blood(character, -100, "Cleaning" /* CHANGE_REASON.CLEANING */);
}
// function eat_effect(character: Character, cell: cell_id) {
//     Effect.Change.fatigue(character, -2)
//     Effect.Change.stress(character, -3)
//     Effect.Change.hp(character, 10)
//     Event.change_stash(character, MATERIAL.MEAT_RAT_FRIED, -1)
// }
exports.clean = (0, generator_1.generate_action)(CLEAN_FATIGUE_COST, clean_duration_modifier, clean_trigger, clean_effect, generic_functions_1.dummy_effect, "Cleaning" /* CHANGE_REASON.CLEANING */);
exports.rest = {
    duration(char) {
        return 0.1 + char.get_fatigue() / 20;
    },
    check: function (char, cell) {
        if (char.in_battle())
            return types_1.NotificationResponse.InBattle;
        const location = data_objects_1.Data.Locations.from_id(char.location_id);
        const price = scripted_values_1.ScriptedValue.rest_price(char, location);
        if (char.savings.get() < price) {
            const lack_data = {
                required_thing: "Money",
                required_amount: price,
            };
            return { response: "Not enough resources", value: [lack_data] };
        }
        const target_fatigue = scripted_values_1.ScriptedValue.target_fatigue(char, location);
        const target_stress = scripted_values_1.ScriptedValue.target_stress(char, location);
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return { response: 'Notification:', value: `You can't rest further in this location: Only ${target_fatigue} fatigue and ${target_stress} stress is achievable ` };
        }
        return { response: 'OK' };
    },
    result: function (char, cell) {
        const location = data_objects_1.Data.Locations.from_id(char.location_id);
        const target_fatigue = scripted_values_1.ScriptedValue.target_fatigue(char, location);
        const target_stress = scripted_values_1.ScriptedValue.target_stress(char, location);
        if (target_fatigue < char.get_fatigue())
            effects_1.Effect.Set.fatigue(char, target_fatigue, "Rest" /* CHANGE_REASON.REST */);
        if (target_stress < char.get_stress())
            effects_1.Effect.Set.stress(char, target_stress, "Rest" /* CHANGE_REASON.REST */);
        effects_1.Effect.location_quality_reduction_roll(location);
        user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
    },
    start: function (char, cell) {
        const location = data_objects_1.Data.Locations.from_id(char.location_id);
        const price = scripted_values_1.ScriptedValue.rest_price(char, location);
        const location_owner = data_objects_1.Data.Characters.from_id(location.owner_id);
        if (location_owner == undefined)
            return;
        effects_1.Effect.Transfer.savings(char, location_owner, price, "Rest" /* CHANGE_REASON.REST */);
    },
};
