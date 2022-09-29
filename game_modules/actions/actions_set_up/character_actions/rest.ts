import { Character } from "../../../base_game_classes/character/character";
import {CharacterActionResponce} from '../../action_manager'
import { PgPool } from "../../../world";

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
            if (char.misc.tag == 'rat') {
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
        char.changed = true
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) return 
        if (cell.can_rest() || (char.misc.tag == 'rat')) {
            char.set_fatigue(0)
            char.change_stress(-4)
        } else {
            char.set_fatigue(40)
        }

        char.send_status_update()
    },

    start:  function(char:Character, data: map_position) {
    },
}