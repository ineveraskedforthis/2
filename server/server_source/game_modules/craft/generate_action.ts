import { dummy_duration, dummy_start } from "../actions/action_manager";
import { CharacterActionResponce } from "../action_types";
import { Character } from "../character/character";
import { map_position } from "../types";
import { event_craft_bulk } from "./CraftBulk";
import { event_craft_item } from "./CraftItem";
import { box, CraftItem, CraftBulk } from "./crafts_storage";
import { check_inputs } from "./helpers";

export function generate_check_funtion(inputs: box[]) {
    return (char: Character, data: map_position) => {
        if (char.in_battle())
            return CharacterActionResponce.IN_BATTLE;
        if (check_inputs(inputs, char.stash))
            return CharacterActionResponce.OK;
        return CharacterActionResponce.NO_RESOURCE;
    }
}

export function generate_craft_item_action(craft: CraftItem) {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(craft.input),

        result: function (char: Character, data: map_position) {
            if (check_inputs(craft.input, char.stash)) {
                event_craft_item(char, craft);
            }
        },

        start: dummy_start
    };
}

export function generate_bulk_craft_action(craft: CraftBulk) {
    return {
        duration: dummy_duration,
        check: generate_check_funtion(craft.input),
        result(char: Character, data: map_position) {
            if (check_inputs(craft.input, char.stash)) {
                event_craft_bulk(char,craft);
            }
        },
        start: dummy_start
    }
}