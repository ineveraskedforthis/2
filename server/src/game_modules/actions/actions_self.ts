import { cell_id } from "@custom_types/ids";
import { Character } from "../character/character";
import { Effect } from "../events/effects";
import { generate_action } from "./generator";
import { CharacterMapAction, LackData, NotificationResponse, TriggerResponse } from "./types";
import { basic_duration_modifier, dummy_effect } from "./generic_functions";
import { Event } from "../events/events";
import { CharacterSystem } from "../character/system";
import { ScriptedValue } from "../events/scripted_values";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { MapSystem } from "../map/system";
import { MATERIAL } from "@content/content";
import { Data } from "../data/data_objects";

const CLEAN_FATIGUE_COST = 5

function clean_duration_modifier(character: Character) {
    return 1 + character.get_blood() / 50
}
function clean_trigger(character: Character): TriggerResponse {
    if (character.status.blood == 0) return { response: "Notification:", value: "You are already clean"}
    if (MapSystem.can_clean(character.location_id)) {
        return { response: "OK" }
    }
    return { response: "Notification:", value: "Lack of water in this location"}
}
function clean_effect(character: Character, cell: cell_id) {
    Effect.Change.blood(character, -100)
}
// function eat_effect(character: Character, cell: cell_id) {
//     Effect.Change.fatigue(character, -2)
//     Effect.Change.stress(character, -3)
//     Effect.Change.hp(character, 10)
//     Event.change_stash(character, MATERIAL.MEAT_RAT_FRIED, -1)
// }

export const clean = generate_action(
    CLEAN_FATIGUE_COST,
    clean_duration_modifier,
    clean_trigger,
    clean_effect,
    dummy_effect
)

export const rest: CharacterMapAction = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, cell: cell_id): TriggerResponse {
        if (char.in_battle()) return NotificationResponse.InBattle
        const skill = CharacterSystem.skill(char, 'travelling')
        const location = Data.Locations.from_id(char.location_id)
        const price = ScriptedValue.rest_price(char, location)
        if (char.savings.get() < price) {
            const lack_data: LackData = {
                required_thing: "Money",
                required_amount: price,
            }
            return {response: "Not enough resources", value: [lack_data]}
        }
        const target_fatigue = ScriptedValue.rest_target_fatigue(ScriptedValue.rest_tier(char, location), skill, char.race)
        const target_stress = ScriptedValue.rest_target_stress(ScriptedValue.rest_tier(char, location), skill, char.race)
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return { response : 'Notification:', value: `You can't rest further in this location: Only ${target_fatigue} fatigue and ${target_stress} stress is achievable `}
        }
        return { response: 'OK' }
    },

    result:  function(char:Character, cell: cell_id) {
        const skill = CharacterSystem.skill(char, 'travelling')
        const location = Data.Locations.from_id(char.location_id)
        const target_fatigue = ScriptedValue.rest_target_fatigue(ScriptedValue.rest_tier(char, location), skill, char.race)
        const target_stress = ScriptedValue.rest_target_stress(ScriptedValue.rest_tier(char, location), skill, char.race)
        if (target_fatigue < char.get_fatigue()) char.set_fatigue(target_fatigue)
        if (target_stress < char.get_stress()) char.set('stress', target_stress)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
    },

    start:  function(char:Character, cell: cell_id) {
        const location = Data.Locations.from_id(char.location_id)
        const price = ScriptedValue.rest_price(char, location)
        const location_owner = Data.Characters.from_id(location.owner_id)
        if (location_owner == undefined) return

        CharacterSystem.transfer_savings(char, location_owner, price)
    },
}