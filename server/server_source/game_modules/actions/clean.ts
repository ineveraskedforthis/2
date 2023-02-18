import { Character } from "../character/character";
import { ActionTargeted, CharacterActionResponce } from "../action_types";
import { WATER } from "../manager_classes/materials_manager";
import { map_position } from "../types";
import { Convert } from "../systems_communication";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";

export const clean:ActionTargeted = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            const cell = Convert.character_to_cell(char)
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_clean()) {
                return CharacterActionResponce.OK
            } 
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) {
            return CharacterActionResponce.INVALID_CELL
        }
        if (cell.can_clean()) {
            char.change_blood(-100)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}