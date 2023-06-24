import { trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";
import { ELODINO_FLESH, MEAT, RAT_BONE, RAT_SKIN } from "../manager_classes/materials_manager";
import { craft_actions, crafts_items, box, skill_check, CraftItemTemplate } from "./crafts_storage";
import { on_craft_update, use_input } from "./helpers";
import { generate_craft_item_action } from "./generate_action";
import { CharacterSystem } from "../character/system";




function base_durability(skill: number, difficulty: number) {
    const base = Math.round(skill / difficulty * 100)
    return trim(base, 5, 150)
}
function bonus_durability(character: Character, craft: CraftItemTemplate) {
    let durability = 0
    let skin_flag = false
    let bone_flag = false
    let flesh_flag = false

    for (let item of craft.input) {
        if (item.material == RAT_SKIN)      skin_flag = true
        if (item.material == RAT_BONE)      bone_flag = true
        if (item.material == MEAT)          flesh_flag = true
        if (item.material == ELODINO_FLESH) flesh_flag = true
    }

    const template = craft.output
    if (template.slot == 'weapon') {
        if (character._perks.weapon_maker)
            durability += 10;
    } else {
        if (character._perks.skin_armour_master && skin_flag)
            durability += 20
        if (character._perks.shoemaker && (template.slot == 'foot')) {
            durability += 10;
        }
    }

    return durability
}

export function durability(character: Character, craft: CraftItemTemplate): number {
    // calculate base durability as average
    let durability = 0
    for (let item of craft.difficulty) {
        durability += base_durability(CharacterSystem.skill(character, item.skill), item.difficulty)
    }
    durability = durability / craft.difficulty.length
    return Math.floor(durability + bonus_durability(character, craft))
}

export function create_item(template: ItemJson, durability: number) {
    let result = ItemSystem.create(template);
    // introduce some luck
    result.durability = durability
    result.durability += Math.round(Math.random() * 10);

    return result
}

export function event_craft_item(character: Character, craft: CraftItemTemplate) {
    use_input(craft.input, character);
    let result = create_item(craft.output, durability(character, craft))
    character.equip.data.backpack.add(result);

    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY);
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH);
    on_craft_update(character, craft.difficulty);
}

export function new_craft_item(id: string, input: box[], output: ItemJson, difficulty: skill_check[]) {
    crafts_items[id] = {
        id: id,
        input: input,
        output: output,
        difficulty: difficulty,
    };
    craft_actions[id] = generate_craft_item_action(crafts_items[id]);

    return crafts_items[id]
}

export function get_crafts_item_list(character: Character) {
    let list = []
    for (let item of Object.values(crafts_items)) {
        list.push(item)
    }
    return list
}