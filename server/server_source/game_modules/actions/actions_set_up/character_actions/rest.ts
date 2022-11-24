import { Character } from "../../../character/character";
import {CharacterActionResponce} from '../../action_manager'
import { map_position } from "../../../types";
import { Convert } from "../../../systems_communication";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";

export const rest = {
    duration(char: Character) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            const cell = Convert.character_to_cell(char)
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (char.archetype.race == 'rat') {
                return CharacterActionResponce.OK
            }

            if (cell.can_rest()) {
                 return CharacterActionResponce.OK
            }

            if (char.get_fatigue() < 40) {
                return CharacterActionResponce.NO_RESOURCE
            }

            return CharacterActionResponce.OK
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) return 
        if (cell.can_rest() || (char.archetype.race == 'rat')) {
            char.set_fatigue(0)
            char.change_stress(-4)
        } else {
            char.set_fatigue(30)
        }

        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
    },

    start:  function(char:Character, data: map_position) {
    },
}