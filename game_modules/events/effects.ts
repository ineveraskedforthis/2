import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Cell } from "../map/cell";
import { Convert } from "../systems_communication";

export namespace Effect {
    export namespace Update {
        export function cell_market(cell: Cell) {
            const locals = cell.get_characters_list()
            for (let item of locals) {
                const id = item.id
                const local_character = Convert.id_to_character(id)
                UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
            }
        }
    }    
}