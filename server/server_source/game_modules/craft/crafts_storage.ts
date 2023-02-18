import { ActionTargeted } from "../action_types";
import { skill } from "../character/Skills";
import { ItemJson } from "../items/item";
import { material_index } from "../manager_classes/materials_manager";

export interface box {
    material: material_index;
    amount: number;
}
export interface skill_check {
    skill: skill;
    difficulty: number;
}
export interface CraftBulk {
    id: string;
    input: box[];
    output: box[];
    difficulty: skill_check[];
}
export interface CraftItem {
    id: string;
    input: box[];
    output: ItemJson;
    difficulty: skill_check[];
}

export let crafts_bulk: { [_: string]: CraftBulk; } = {};
export let crafts_items: { [_: string]: CraftItem; } = {};
export let craft_actions: { [_: string]: ActionTargeted; } = {};
