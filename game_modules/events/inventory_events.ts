import { Character } from "../base_game_classes/character/character";
import { Equip } from "../base_game_classes/inventories/equip";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";

export namespace EventInventory {
    export function equip_from_backpack(character: Character, index: number) {
        character.equip.equip_from_backpack(index)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    
}