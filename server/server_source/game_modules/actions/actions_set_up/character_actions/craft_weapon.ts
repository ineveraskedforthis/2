import { RAT_BONE, WOOD } from "../../../manager_classes/materials_manager";
import { BASIC_BOW_ARGUMENT, BONE_DAGGER_ARGUMENT, BONE_SPEAR_ARGUMENT, SPEAR_ARGUMENT, WOODEN_MACE_ARGUMENT } from "../../../items/items_set_up";
import { Craft } from "../../../calculations/craft";
import { generate_craft_item_action } from "./generate_craft_item_action";
const bone_spear_input = [{material: WOOD, amount: 3}, {material: RAT_BONE, amount: 4}]

export const DAGGER_TIER        = 45
export const MACE_TIER          = 10
export const BONE_SPEAR_TIER    = 20
export const WOOD_BOW_TIER      = 35
export const SPEAR_TIER         = 15

export const craft_bone_dagger  = generate_craft_item_action([{material: RAT_BONE, amount: 15}], 
    BONE_DAGGER_ARGUMENT,   Craft.Durability.bone_item, 45, 'bone_carving')
export const craft_wooden_mace  = generate_craft_item_action([{material: WOOD, amount: 8}], 
    WOODEN_MACE_ARGUMENT,   Craft.Durability.wood_item, 10, 'woodwork')
export const craft_bone_spear   = generate_craft_item_action(bone_spear_input, 
    BONE_SPEAR_ARGUMENT,    Craft.Durability.wood_item, 20, 'woodwork')
export const craft_wood_bow     = generate_craft_item_action([{material: WOOD, amount: 3}], 
    BASIC_BOW_ARGUMENT,     Craft.Durability.wood_item, 35, 'woodwork')
export const craft_spear        = generate_craft_item_action([{material: WOOD, amount: 3}], 
    SPEAR_ARGUMENT,         Craft.Durability.wood_item, 15, 'woodwork')