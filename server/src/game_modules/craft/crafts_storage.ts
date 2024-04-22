import { CraftBulkTemplate, CraftItemTemplate } from "@custom_types/inventory";
import { Character, CharacterMapAction } from "../data/entities/character";

export let crafts_bulk: { [_: string]: CraftBulkTemplate; } = {};
export let crafts_items: { [_: string]: CraftItemTemplate; } = {};
export let craft_actions: { [_: string]: CharacterMapAction; } = {};export function get_crafts_bulk_list(character: Character) {
    let list = [];
    for (let item of Object.values(crafts_bulk)) {
        list.push(item);
    }
    return list;
}
export function get_crafts_item_list(character: Character) {
    let list = [];
    for (let item of Object.values(crafts_items)) {
        list.push(item);
    }
    return list;
}

