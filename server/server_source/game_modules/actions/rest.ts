import { Character } from "../character/character";
import { CharacterActionResponce } from "../CharacterActionResponce";
import { map_position } from "../types";
import { Convert } from "../systems_communication";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { Data } from "../data";
import { ScriptedValue } from "../events/scripted_values";

export const rest = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (char.in_battle()) return CharacterActionResponce.IN_BATTLE
        let target_fatigue = ScriptedValue.rest_target_fatigue(0, char.skills.travelling, char.race())
        let target_stress = ScriptedValue.rest_target_stress(0, char.skills.travelling, char.race())
        if ((char.get_fatigue() <= target_fatigue) && (char.get_stress() <= target_stress)) {
            return CharacterActionResponce.NO_RESOURCE
        }
        return CharacterActionResponce.OK
    },

    result:  function(char:Character, data: map_position) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) return
        let target_fatigue = ScriptedValue.rest_target_fatigue(0, char.skills.travelling, char.race())
        let target_stress = ScriptedValue.rest_target_stress(0, char.skills.travelling, char.race())
        if (target_fatigue < char.get_fatigue()) char.set_fatigue(target_fatigue)
        if (target_stress < char.get_stress()) char.set('stress', target_stress)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const proper_rest = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (char.in_battle()) return CharacterActionResponce.IN_BATTLE;
        return CharacterActionResponce.INVALID_CELL
    },

    result:  function(char:Character, data: map_position) {
        char.set_fatigue(0)
        char.change_stress(-5)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
    },

    start:  function(char:Character, data: map_position) {
    },
}