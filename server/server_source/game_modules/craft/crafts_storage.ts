import { CharacterMapAction } from "../actions/types";
import { ItemJson } from "@custom_types/inventory";
import { CraftBulkTemplate, CraftItemTemplate } from "@custom_types/inventory";

export let crafts_bulk: { [_: string]: CraftBulkTemplate; } = {};
export let crafts_items: { [_: string]: CraftItemTemplate; } = {};
export let craft_actions: { [_: string]: CharacterMapAction; } = {};
