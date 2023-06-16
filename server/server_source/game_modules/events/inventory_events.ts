import { equip_slot } from "../../../../shared/inventory";
import { Character } from "../character/character";
import { Equip } from "../inventories/equip";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Item } from "../items/item";
import { ItemSystem } from "../items/system";
import { roll_affix_armour, roll_affix_weapon } from "../base_game_classes/affix";
import { materials, ZAZ } from "../manager_classes/materials_manager";
import { Alerts } from "../client_communication/network_actions/alerts";
import { Effect } from "./effects";
import { Event } from "./events";
import { CharacterSystem } from "../character/system";

export namespace EventInventory {
    export function equip_from_backpack(character: Character, index: number) {
        character.equip.equip_from_backpack(index, character.model())
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function unequip(character: Character, slot: equip_slot) {
        character.equip.unequip(slot)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function destroy_in_backpack(character: Character, index: number) {
        const item = character.equip.data.backpack.items[index]
        if (item == undefined) return

        const material = materials.tag_to_index(item.material.string_tag)
        Event.change_stash(character, material, 1)
        character.equip.data.backpack.remove(index)
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
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
        return responce
    }

    export function enchant(character: Character, index: number) {
        let enchant_rating = CharacterSystem.enchant_rating(character)

        let item = character.equip.data.backpack.items[index]
        if (item == undefined) return 

        if (character.stash.get(ZAZ) < 1) {
            Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(ZAZ), 1, undefined)
            return
        }
        
        Event.change_stash(character, ZAZ, -1)
        const pure_skill = CharacterSystem.pure_skill(character, 'magic_mastery')
        if (pure_skill < 10) Effect.Change.skill(character, 'magic_mastery', 1)
        if (item.is_weapon()) roll_affix_weapon(enchant_rating, item)
        else roll_affix_armour(enchant_rating, item)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export function reroll_enchant(character: Character, index: number) {
        let enchant_rating = CharacterSystem.enchant_rating(character) * 0.8

        let item = character.equip.data.backpack.items[index]
        if (item == undefined) return 

        if (character.stash.get(ZAZ) < 1) {
            Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(ZAZ), 1, undefined)
            return
        }


        let rolls = item.affixes.length
        Event.change_stash(character, ZAZ, -1)
        const pure_skill = CharacterSystem.pure_skill(character, 'magic_mastery')
        if (pure_skill < 10 * rolls) Effect.Change.skill(character, 'magic_mastery', 1)

        
        item.affixes = []
        for (let i = 0; i < rolls; i++) {
            if (item.is_weapon()) roll_affix_weapon(enchant_rating, item)
            else roll_affix_armour(enchant_rating, item)
        }
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    function test(character: Character) {
        
    }
}