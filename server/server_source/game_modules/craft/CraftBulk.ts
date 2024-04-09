import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Stash } from "../inventories/stash";
import { ARROW_BONE, FOOD, ZAZ } from "../manager_classes/materials_manager";
import { generate_bulk_craft_action } from "./generate_action";
import { crafts_bulk, craft_actions } from "./crafts_storage";
import { box, CraftBulkTemplate, skill_check } from "@custom_types/inventory";
import { use_input, on_craft_update, skill_to_ratio, MAX_SKILL_MULTIPLIER_BULK } from "./helpers";
import { Event } from "../events/events";
import { CharacterSystem } from "../character/system";


export function event_craft_bulk(character: Character, craft: CraftBulkTemplate) {
    use_input(craft.input, character);
    produce_output(output_bulk(character, craft), character);
    on_craft_update(character, craft.difficulty);
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH);
}

export function produce_output(output: box[], character: Character) {
    for (let item of output) {
        Event.change_stash(character, item.material, item.amount)
    }
}


export function output_bulk(character: Character, craft: CraftBulkTemplate) {
    let result: box[] = [];
    //calculating skill output
    // min is 0
    // max is 10
    // choose minimum across all skills
    let ratio = MAX_SKILL_MULTIPLIER_BULK;
    for (let check of craft.difficulty) {
        const skill = CharacterSystem.skill(character, check.skill);
        ratio = Math.min(skill_to_ratio(skill, check.difficulty), ratio);
    }

    for (let item of craft.output) {
        //calculate bonus from perks
        let bonus = 0;
        if (item.material == FOOD) {
            if (character._perks.meat_master)
                bonus += 1;
        }

        if (item.material == ZAZ) {
            if (character._perks.alchemist)
                bonus += 2;
            if (character._perks.mage_initiation)
                bonus += 1;
        }

        if (item.material == ARROW_BONE) {
            if (character._perks.fletcher)
                bonus += 5;
        }

        let amount = Math.floor(item.amount * ratio + bonus);
        if (character.race == 'rat') amount = 0;
        if (amount > 0) result.push({ material: item.material, amount: amount });
    }

    return result;
}

export function new_craft_bulk(id: string, input: box[], output: box[], difficulty: skill_check[]) {
    crafts_bulk[id] = {
        id: id,
        input: input,
        output: output,
        difficulty: difficulty,
    };
    craft_actions[id] = generate_bulk_craft_action(crafts_bulk[id]);

    return crafts_bulk[id]
}

export function get_crafts_bulk_list(character: Character) {
    let list = []
    for (let item of Object.values(crafts_bulk)) {
        list.push(item)
    }
    return list
}