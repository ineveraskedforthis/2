import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Effect } from "../events/effects";
import { Event } from "../events/events";
import { WOOD, COTTON } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { map_position } from "../types";
import { ActionTargeted, CharacterActionResponce } from "../action_types";

export const gather_wood: ActionTargeted = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 50;
    },

    check: function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = Convert.character_to_cell(char);
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_gather_wood()) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: function(char:Character, data: map_position) {

        char.change('fatigue', 10)
        char.change('blood', 1)
        char.change('stress', 1)
        Event.change_stash(char, WOOD, 1)

        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
        return CharacterActionResponce.OK
    },

    start: function(char:Character, data: map_position) {
    },
}


export const gather_cotton: ActionTargeted = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 50;
    },

    check: function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = Convert.character_to_cell(char);
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_gather_cotton()) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: function(char:Character, data: map_position) {

        char.change('fatigue', 10)
        char.change('blood', 1)
        char.change('stress', 1)
        Event.change_stash(char, COTTON, 1)

        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
        return CharacterActionResponce.OK
    },

    start: function(char:Character, data: map_position) {
    },
}