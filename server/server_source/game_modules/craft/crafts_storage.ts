import { affix } from "@custom_types/inventory";
import { CharacterMapAction } from "../actions/types";
import { skill } from "../character/SkillList";
import { ItemJson } from "../items/item";
import { item_model_tag } from "../items/model_tags";
import { material_index } from "../manager_classes/materials_manager";

export interface box {
    material: material_index;
    amount: number;
}
export interface skill_check {
    skill: skill;
    difficulty: number;
}
export interface CraftBulkTemplate {
    id: string;
    input: box[];
    output: box[];
    difficulty: skill_check[];
}
export interface CraftItemTemplate {
    id: string;
    input: box[];
    output_model: item_model_tag;
    output_affixes: affix[]
    difficulty: skill_check[];
}

export let crafts_bulk: { [_: string]: CraftBulkTemplate; } = {};
export let crafts_items: { [_: string]: CraftItemTemplate; } = {};
export let craft_actions: { [_: string]: CharacterMapAction; } = {};
