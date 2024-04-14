import { cell_id } from "@custom_types/ids";
import { Character } from "../character/character";
import { event_craft_bulk } from "./CraftBulk";
import { event_craft_item } from "./CraftItem";
import { CraftBulkTemplate, CraftItemTemplate, box } from "@custom_types/inventory";
import { check_inputs } from "./helpers";
import { CharacterMapAction, MapActionTriggerTargeted } from "../actions/types";
import { dummy_duration, dummy_start } from "../actions/generic_functions";

export function generate_check_funtion(inputs: box[]): MapActionTriggerTargeted {
    return (char: Character, cell: cell_id) => {
        if (char.in_battle())
            return { response: 'IN_BATTLE' };
        if (check_inputs(inputs, char.stash))
            return { response: 'OK' };
        return { response: 'NO_RESOURCE'};
    }
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

export function generate_bulk_craft_action(craft: CraftBulkTemplate): CharacterMapAction {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(craft.input),
        result(char: Character, cell: cell_id) {
            if (check_inputs(craft.input, char.stash)) {
                event_craft_bulk(char,craft);
            }
        },
        start: dummy_start
    }
}