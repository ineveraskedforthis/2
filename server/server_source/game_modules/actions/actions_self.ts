import { cell_id } from "@custom_types/common";
import { Character } from "../character/character";
import { Effect } from "../events/effects";
import { generate_action } from "./generator";
import { TriggerResponse } from "./types";
import { basic_duration_modifier, dummy_effect } from "./generic_functions";
import { FOOD } from "../manager_classes/materials_manager";
import { Event } from "../events/events";
import { CharacterSystem } from "../character/system";
import { ScriptedValue } from "../events/scripted_values";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { MapSystem } from "../map/system";

const CLEAN_FATIGUE_COST = 5

function clean_duration_modifier(character: Character) {
    return 1 + character.get_blood() / 50
}
function clean_trigger(character: Character): TriggerResponse {
    if (MapSystem.can_clean(character.location_id)) {
        return { response: "OK" }
    }
    return { response: "NO_RESOURCE" }
}
function eat_trigger(character: Character, cell: cell_id): TriggerResponse {
    let tmp = character.stash.get(FOOD);
    if (tmp > 0) {
        return { response: "OK" }
    }
    return { response: "NO_RESOURCE" }
}
function clean_effect(character: Character, cell: cell_id) {
    Effect.Change.blood(character, -100)
}
function eat_effect(character: Character, cell: cell_id) {
    Effect.Change.fatigue(character, -2)
    Effect.Change.stress(character, -3)
    Effect.Change.hp(character, 10)
    Event.change_stash(character, FOOD, -1)
}

export const clean = generate_action(
    CLEAN_FATIGUE_COST,
    clean_duration_modifier,
    clean_trigger,
    clean_effect,
    dummy_effect
)

export const eat = generate_action(
    0,
    basic_duration_modifier,
    eat_trigger,
    eat_effect,
    dummy_effect
)


export const rest = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, cell: cell_id): TriggerResponse {
        if (char.in_battle()) return { response: 'IN_BATTLE' }
        let skill = CharacterSystem.skill(char, 'travelling')
        let target_fatigue = ScriptedValue.rest_target_fatigue(0, skill, char.race)
        let target_stress = ScriptedValue.rest_target_stress(0, skill, char.race)
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return { response : 'IMPOSSIBLE_ACTION' }
        }
        return { response: 'OK' }
    },

    result:  function(char:Character, cell: cell_id) {
        let skill = CharacterSystem.skill(char, 'travelling')
        let target_fatigue = ScriptedValue.rest_target_fatigue(0, skill, char.race)
        let target_stress = ScriptedValue.rest_target_stress(0, skill, char.race)
        if (target_fatigue < char.get_fatigue()) char.set_fatigue(target_fatigue)
        if (target_stress < char.get_stress()) char.set('stress', target_stress)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
    },

    start:  function(char:Character, cell: cell_id) {
    },
}