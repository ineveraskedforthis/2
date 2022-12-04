import { equip_slot } from "../../../../shared/inventory";
import { Character } from "../character/character";
import { Equip } from "../inventories/equip";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Item } from "../items/item";
import { ItemSystem } from "../items/system";
import { roll_affix_armour, roll_affix_weapon } from "../base_game_classes/affix";
import { ZAZ } from "../manager_classes/materials_manager";
import { Alerts } from "../client_communication/network_actions/alerts";

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
        character.equip.unequip_secondary()
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    } 

    export function switch_weapon(character: Character) {
        character.equip.switch_weapon()
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function add_item(character: Character, item: Item) {
        const responce = character.equip.data.backpack.add(item)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        return responce
    }

    export function enchant(character: Character, index: number) {
        const enchant_rating = character.stats.stats.magic_power * character.skills.magic_mastery / 100 
        // so it's ~5 at 50 magic mastery
        // and 1 at 10 magic mastery

        let item = character.equip.data.backpack.items[index]
        if (item == undefined) return 

        if (character.stash.get(ZAZ) < 1) {
            Alerts.not_enough_to_character(character, 'ZAZ', 1, character.stash.get(ZAZ))
            return
        }
        
        character.stash.inc(ZAZ, -1)
        if (item.is_weapon()) roll_affix_weapon(enchant_rating, item)
        else roll_affix_armour(enchant_rating, item)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    function test(character: Character) {
        
    }
}