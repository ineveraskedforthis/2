import { Character } from "../base_game_classes/character/character";
import { Equip } from "../base_game_classes/inventories/equip";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { equip_slot } from "../types";

export namespace EventInventory {
    export function equip_from_backpack(character: Character, index: number) {
        character.equip.equip_from_backpack(index)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function unequip(character: Character, slot: equip_slot) {
        character.equip.unequip(slot)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function unequip_secondary(character: Character) {
        character.equip.unequip('weapon')
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    } 

    export function switch_weapon(character: Character) {
        character.equip.switch_weapon()
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }


    function test(character: Character) {

    }
}