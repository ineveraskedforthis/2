import { Character } from "../character/character";
import {CharacterActionResponce} from '../../manager_classes/action_manager'
import { MapSystem } from "../../map/system";
import { Convert, Link, Unlink } from "../../systems_communication";
import { UserManagement } from "../../client_communication/user_manager";
import { UI_Part } from "../../client_communication/causality_graph";

export const move ={
    duration(char: Character) {
        return 1 + char.get_fatigue() / 30;
    },

    check: async function (char: Character, data: any) {
        if (char.in_battle()) {
            return CharacterActionResponce.IN_BATTLE
        }
        if (MapSystem.can_move([data.x, data.y])) {
            let [x, y] = MapSystem.id_to_coordinate(char.cell_id)
            let dx = data.x - x;
            let dy = data.y - y;
            if (MapSystem.is_valid_move(dx, dy)) {
                return CharacterActionResponce.OK
            }
            if ((dx == 0 && dy ==0)) {
                return CharacterActionResponce.ZERO_MOTION
            }
            return CharacterActionResponce.CANNOT_MOVE_THERE
        }
        return CharacterActionResponce.CANNOT_MOVE_THERE
    },

    start: async function (char: Character, data: any) {
        char.next_cell = data
    },

    result: async function (character: Character) {
        if (character.next_cell == undefined) return
        const new_cell = MapSystem.SAFE_id_to_cell(character.next_cell)
        const old_cell = Convert.character_to_cell(character)
        Unlink.character_and_cell(character, old_cell)
        Link.character_and_cell(character, new_cell)

        // effect on fatigue
        character.change('fatigue', 2);

        //check if it is user and you need to update status
        const user = Convert.character_to_user(character)
        if (user != undefined) {
            UserManagement.add_user_to_update_queue(user.data.id, UI_Part.STATUS)
        }

        // char.world.entity_manager.transfer_orders(char, char.cell_id)
        // if (old_cell != undefined) char.world.socket_manager.send_item_market_update(old_cell.id);
        // if (new_cell != undefined) char.world.socket_manager.send_item_market_update(new_cell.id);
        // return await char.on_move_default(pool, data)   
    },

    is_move: true
}