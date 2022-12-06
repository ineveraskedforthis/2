import { Cell } from "../../../map/cell";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
import { WOOD } from "../../../manager_classes/materials_manager";
import type { Character } from "../../../character/character";
import { Convert } from "../../../systems_communication";
import { map_position } from "../../../types";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";


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
        char.stash.inc(WOOD, 1)

        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
        return CharacterActionResponce.OK
    },

    start: function(char:Character, data: map_position) {
    },
}

export function can_gather_wood(cell:Cell) {
    return cell.development.wild > 0
}