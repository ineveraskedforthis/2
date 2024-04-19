import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { roll_affix_armour, roll_affix_weapon } from "../base_game_classes/affix";
import { Alerts } from "../client_communication/network_actions/alerts";
import { CHANGE_REASON, Effect } from "../effects/effects";
import { Event } from "./events";
import { CharacterSystem } from "../character/system";
import { EQUIP_SLOT, MATERIAL } from "@content/content";
import { Data } from "../data/data_objects";
import { item_id } from "@custom_types/ids";
import { is_weapon } from "../../content_wrappers/item";

export namespace EventInventory {
    export function equip_from_backpack(character: Character, index: number) {
        character.equip.equip_from_backpack(index, character.model)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function unequip(character: Character, slot: EQUIP_SLOT) {
        character.equip.unequip(slot)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function destroy_in_backpack(character: Character, index: number) {
        const item = character.equip.data.backpack.items[index]
        if (item == undefined) return

        const item_data = Data.Items.from_id(item)

        Event.change_stash(character, item_data.prototype.material, 1)
        character.equip.data.backpack.remove(index)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function destroy_in_backpack_by_item_id(character: Character, item: item_id) {
        console.log("attempt to destroy item with id ", item)
        const index = character.equip.data.backpack.items.indexOf(item)
        destroy_in_backpack(character, index)
    }

    export function switch_weapon(character: Character) {
        character.equip.switch_weapon()
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    }

    export function add_item(character: Character, item: item_id) {
        const response = character.equip.data.backpack.add(item)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
        return response
    }

    export function enchant(character: Character, index: number) {
        let enchant_rating = CharacterSystem.enchant_rating(character)

        let item = Data.Items.from_id(character.equip.data.backpack.items[index])
        if (item == undefined) return;

        if (character.stash.get(MATERIAL.ZAZ) < 1) {
            Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(MATERIAL.ZAZ), 1, undefined)
            return
        }

        Event.change_stash(character, MATERIAL.ZAZ, -1)
        const pure_skill = CharacterSystem.pure_skill(character, 'magic_mastery')
        if (pure_skill < 10) Effect.Change.skill(character, 'magic_mastery', 1, CHANGE_REASON.ENCHANTING)
        if (is_weapon(item)) roll_affix_weapon(enchant_rating, item)
        else roll_affix_armour(enchant_rating, item)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export function reroll_enchant(character: Character, index: number) {
        let enchant_rating = CharacterSystem.enchant_rating(character) * 0.8

        let item = Data.Items.from_id(character.equip.data.backpack.items[index])
        if (item == undefined) return;

        if (character.stash.get(MATERIAL.ZAZ) < 1) {
            Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(MATERIAL.ZAZ), 1, undefined)
            return
        }


        let rolls = item.affixes.length
        Event.change_stash(character, MATERIAL.ZAZ, -1)
        const pure_skill = CharacterSystem.pure_skill(character, 'magic_mastery')
        if (pure_skill < 10 * rolls) Effect.Change.skill(character, 'magic_mastery', 1, CHANGE_REASON.ENCHANTING)


        item.affixes = []
        for (let i = 0; i < rolls; i++) {
            if (is_weapon(item)) roll_affix_weapon(enchant_rating, item)
            else roll_affix_armour(enchant_rating, item)
        }
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    function test(character: Character) {

    }
}