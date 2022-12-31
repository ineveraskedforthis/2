import { Character } from "../character/character";
import { skill } from "../character/skills";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Event } from "../events/events";
import { ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";
import { material_index } from "../manager_classes/materials_manager";

export function craft_item(character: Character, item: ItemJson, durability: (character: Character, tier: number) => number, skill: skill, tier: number) {
    let result = ItemSystem.create(item)
    result.durability = durability(character, tier)
    result.durability += Math.round(Math.random() * 10)
    if (result.slot == 'weapon') {
        if (character.perks.weapon_maker) result.durability += 10
    } else {
        if (character.perks.skin_armour_master && (item.material.string_tag == 'rat_skin')) {
            result.durability += 10
        }
        if (character.perks.shoemaker && (item.slot == 'foot')) {
            result.durability += 10
        }
    }
    character.equip.data.backpack.add(result)
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY)
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
    Event.on_craft_update(character, skill, tier)
}

export function craft_bulk(character: Character, material: material_index, amount: (character: Character, tier: number) => number, skill: skill, tier: number) {
    character.stash.inc(material, amount(character, tier))
    Event.on_craft_update(character, skill, tier)
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
}