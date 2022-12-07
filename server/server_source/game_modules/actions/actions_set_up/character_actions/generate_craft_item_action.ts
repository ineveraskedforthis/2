import { CharacterActionResponce } from "../../action_manager";
import { material_index } from "../../../manager_classes/materials_manager";
import { Character } from "../../../character/character";
import { map_position } from "../../../types";
import { craft_item } from "../../../craft/craft";
import { ItemJson } from "../../../items/item";
import { skill } from "../../../character/skills";
import { Stash } from "../../../inventories/stash";

interface input {
    material: material_index;
    amount: number;
}

export function check_inputs(inputs: input[], stash: Stash) {
    let flag = true;
    for (let item of inputs) {
        let tmp = stash.get(item.material);
        if ((tmp < item.amount)) {
            flag = false;
        }
    }
    return flag;
}

export function use_inputs(inputs: input[], stash: Stash) {
    for (let item of inputs) {
        stash.inc(item.material, -item.amount);
    }
}
export function generate_craft_item_action(
    inputs: input[],
    item_template: ItemJson,
    durability: (character: Character, tier: number) => number,
    tier: number,
    skill: skill) {
    return {
        duration(char: Character) {
            return 0.5;
        },

        check: function (char: Character, data: map_position): CharacterActionResponce {
            if (char.in_battle())
                return CharacterActionResponce.IN_BATTLE;
            if (check_inputs(inputs, char.stash))
                return CharacterActionResponce.OK;
            return CharacterActionResponce.NO_RESOURCE;
        },

        result: function (char: Character, data: map_position) {
            if (check_inputs(inputs, char.stash)) {
                use_inputs(inputs, char.stash);
                craft_item(char, item_template, durability, skill, tier);
            }
        },

        start: function (char: Character, data: map_position) {
        },
    };
}
