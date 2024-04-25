import { CraftItemTemplate, EQUIPMENT_PIECE, affix, box, skill_check } from "@custom_types/inventory";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Data } from "../data/data_objects";
import { Character, CharacterMapAction } from "../data/entities/character";
import { craft_actions, crafts_items } from "./crafts_storage";
import { check_inputs, on_craft_update, use_input } from "./helpers";
import { generate_check_funtion } from "./generate_action";
import { cell_id } from "@custom_types/ids";
import { dummy_duration, dummy_start } from "../actions/generic_functions";
import { CraftValues } from "../scripted-values/craft";


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
    let result = create_item(craft.output, craft.output_affixes.slice(), CraftValues.durability(character, craft))
    let response = character.equip.data.backpack.add(result.id);
    if (response !== false) use_input(craft.input, character);

    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.INVENTORY);
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH);
    on_craft_update(character, [{skill_checks: craft.difficulty}]);
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

export function generate_craft_item_action(craft: CraftItemTemplate): CharacterMapAction {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(craft.input),

        result: function (char: Character, cell: cell_id) {
            if (check_inputs(craft.input, char.stash)) {
                event_craft_item(char, craft);
            }
        },

        start: dummy_start
    };
}
