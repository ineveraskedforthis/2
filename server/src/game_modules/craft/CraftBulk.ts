import { CraftBulkTemplate, box, skill_check, skilled_box } from "@custom_types/inventory";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Character, CharacterMapAction } from "../data/entities/character";
import { Event } from "../events/events";
import { craft_actions, crafts_bulk } from "./crafts_storage";
import { check_inputs, on_craft_update, use_input } from "./helpers";
import { generate_check_funtion } from "./generate_action";
import { cell_id } from "@custom_types/ids";
import { dummy_duration, dummy_start } from "../actions/generic_functions";
import { CraftValues } from "../scripted-values/craft";

export function event_craft_bulk(character: Character, craft: CraftBulkTemplate) {
    use_input(craft.input, character);
    produce_output(CraftValues.output_bulk(character, craft), character);
    on_craft_update(character, craft.output);
    UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH);
}

export function produce_output(output: box[], character: Character) {
    for (let item of output) {
        Event.change_stash(character, item.material, item.amount)
    }
}

export function new_craft_bulk(id: string, input: box[], output: skilled_box[]) {
    crafts_bulk[id] = {
        id: id,
        input: input,
        output: output,
    };
    craft_actions[id] = generate_bulk_craft_action(crafts_bulk[id]);

    return crafts_bulk[id]
}

export function generate_bulk_craft_action(craft: CraftBulkTemplate): CharacterMapAction {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(craft.input),
        result(char: Character, cell: cell_id) {
            if (check_inputs(craft.input, char.stash)) {
                event_craft_bulk(char, craft);
            }
        },
        start: dummy_start
    };
}
