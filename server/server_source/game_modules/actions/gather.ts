import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Effect } from "../events/effects";
import { Event } from "../events/events";
import { WOOD, COTTON } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { map_position } from "../types";
import { ActionTargeted, CharacterActionResponce } from "../CharacterActionResponce";
import { Data } from "../data";

export const gather_wood: ActionTargeted = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 50;
    },

    check: function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = char.cell_id;
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (Data.Cells.has_forest(cell)) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: function(char:Character, data: map_position) {

        if (Data.Cells.has_forest(char.cell_id)) {
            Event.remove_tree(char.cell_id)
            Effect.Change.fatigue(char, 10)
            Effect.Change.stress(char, 1)
            char.change('blood', 1)
            Event.change_stash(char, WOOD, 1)
        }

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
            let cell = char.cell_id;
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (Data.Cells.has_cotton(cell)) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: function(char:Character, data: map_position) {

        const cell = Convert.character_to_cell(char)

        if (cell.cotton > 0) {
            cell.cotton -= 1
        }

        Effect.Change.fatigue(char, 10)
        Effect.Change.stress(char, 1)
        char.change('blood', 1)        
        Event.change_stash(char, COTTON, 1)

        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
        return CharacterActionResponce.OK
    },

    start: function(char:Character, data: map_position) {
    },
}