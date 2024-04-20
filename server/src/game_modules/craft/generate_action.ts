import { cell_id } from "@custom_types/ids";
import { Character } from "../character/character";
import { event_craft_bulk } from "./CraftBulk";
import { event_craft_item } from "./CraftItem";
import { CraftBulkTemplate, CraftItemTemplate, box } from "@custom_types/inventory";
import { check_inputs } from "./helpers";
import { CharacterMapAction, MapActionTriggerTargeted, NotificationResponse, TriggerResponse } from "../actions/types";
import { dummy_duration, dummy_start } from "../actions/generic_functions";
import { MaterialStorage } from "@content/content";

export function generate_check_funtion(inputs: box[]): MapActionTriggerTargeted {
    return (char: Character, cell: cell_id) : TriggerResponse => {
        if (char.in_battle())
            return NotificationResponse.InBattle;
        if (check_inputs(inputs, char.stash)) {
            return { response: 'OK' };
        }
        return { response: "Not enough resources", value: inputs.map((value) => {return {
            required_amount: value.amount,
            required_thing: MaterialStorage.get(value.material).name
        }})};
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