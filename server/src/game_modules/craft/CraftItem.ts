import { trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { craft_actions, crafts_items } from "./crafts_storage";
import { box, skill_check, CraftItemTemplate } from "@custom_types/inventory";
import { on_craft_update, use_input } from "./helpers";
import { generate_craft_item_action } from "./generate_action";
import { CharacterSystem } from "../character/system";
import { affix } from "@custom_types/inventory";
import { EQUIPMENT_PIECE } from "@custom_types/inventory";
import { ArmourStorage, EQUIP_SLOT, MATERIAL_CATEGORY, MaterialStorage } from "@content/content";
import { Data } from "../data/data_objects";




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
        const material = MaterialStorage.get(item.material)
        if (material.category == MATERIAL_CATEGORY.SKIN) skin_flag = true
        if (material.category == MATERIAL_CATEGORY.LEATHER) skin_flag = true
        if (material.category == MATERIAL_CATEGORY.BONE) bone_flag = true
        if (material.category == MATERIAL_CATEGORY.MEAT) flesh_flag = true
    }

    const template = {
        model_tag: craft.output,
        affixes: craft.output_affixes
    }


    if (craft.output.tag == "weapon") {
        if (character._perks.weapon_maker)
            durability += 10;
    } else {
        const data = ArmourStorage.get(craft.output.value)
        if (character._perks.skin_armour_master && skin_flag)
            durability += 20
        if (character._perks.shoemaker && (data.slot == EQUIP_SLOT.BOOTS)) {
            durability += 20;
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

export function create_item(model_tag: EQUIPMENT_PIECE, affixes: affix[], durability: number) {
    if (model_tag.tag == "armour") {
        const result = Data.Items.create_armour(durability, affixes, model_tag.value)
        result.durability = durability
        result.durability += Math.round(Math.random() * 10);
        return result
    }

    let result = Data.Items.create_weapon(durability, affixes, model_tag.value);
    result.durability = durability
    result.durability += Math.round(Math.random() * 10);
    return result
}

export function event_craft_item(character: Character, craft: CraftItemTemplate) {
    let result = create_item(craft.output, craft.output_affixes.slice(), durability(character, craft))
    let response = character.equip.data.backpack.add(result.id);
    if (response !== false) use_input(craft.input, character);

    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY);
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH);
    on_craft_update(character, craft.difficulty);
}

export function new_craft_item(id: string, input: box[], output: EQUIPMENT_PIECE, output_affixes: affix[], difficulty: skill_check[]) {
    if (difficulty.length == 0) {
        console.log('craft ' + id + " is invalid: no difficulty checks")
    }
    crafts_items[id] = {
        id: id,
        input: input,
        output: output,
        output_affixes: output_affixes,
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