import { Character } from "../character/character";
import { CharacterActionResponce } from "../CharacterActionResponce";
import { map_position } from "../types";
import { Convert } from "../systems_communication";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { Data } from "../data";

export const rest = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (char.in_battle()) return CharacterActionResponce.IN_BATTLE
        if (char.get_fatigue() < 25) {
            return CharacterActionResponce.NO_RESOURCE
        }
        return CharacterActionResponce.OK
    },

    result:  function(char:Character, data: map_position) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) return 
        char.set_fatigue(25)
        if ((char.archetype.race == 'rat') || (char.race() == 'elo')) {
            char.set_fatigue(0)
            char.change_stress(-4)
        }
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