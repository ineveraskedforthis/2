import { materials, RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import {affix_tag, ArmourConstructorArgument, ARMOUR_TYPE, IMPACT_SIZE, IMPACT_TYPE, ITEM_MATERIAL, SHAFT_LEGTH, WeaponConstructorArgument} from "./item_tags";

export const BASIC_BOW_ARGUMENT: WeaponConstructorArgument = {
    durability: 100,
    shaft_material: materials.index_to_material(WOOD),
    shaft_length: SHAFT_LEGTH.SHORT,
    impact_size: IMPACT_SIZE.SMALL,
    impact_material: materials.index_to_material(WOOD),
    impact_type: IMPACT_TYPE.HEAD,
    impact_quality: 0,
    affixes: [],
    item_type: 'weapon',
    ranged: true
}

export const SPEAR_ARGUMENT: WeaponConstructorArgument = {
    durability: 100,
    shaft_length: SHAFT_LEGTH.LONG,
    shaft_material: materials.index_to_material(WOOD), 
    impact_size: IMPACT_SIZE.SMALL, 
    impact_material: materials.index_to_material(WOOD), 
    impact_type:IMPACT_TYPE.POINT, 
    impact_quality: 50,
    affixes: [],
    item_type: 'weapon'
}

export const BONE_SPEAR_ARGUMENT: WeaponConstructorArgument = {
    durability: 100,
    shaft_length: SHAFT_LEGTH.LONG,
    shaft_material: materials.index_to_material(WOOD), 
    impact_size: IMPACT_SIZE.SMALL, 
    impact_material: materials.index_to_material(RAT_BONE), 
    impact_type:IMPACT_TYPE.POINT, 
    impact_quality: 100,
    affixes: [],
    item_type: 'weapon'
}

export const RAT_SKIN_PANTS_ARGUMENT: ArmourConstructorArgument = {
    durability: 100,
    material: materials.index_to_material(RAT_SKIN),
    type: ARMOUR_TYPE.LEGS,
    quality: 100,
    affixes: [],
    item_type: 'armour'
}

export const RAT_SKIN_ARMOUR_ARGUMENT: ArmourConstructorArgument = {
    durability: 100,
    material: materials.index_to_material(RAT_SKIN),
    type: ARMOUR_TYPE.BODY,
    quality: 100,
    affixes: [],
    item_type: 'armour'
}

export const RAT_SKIN_HELMET_ARGUMENT: ArmourConstructorArgument = {
    durability: 100,
    material: materials.index_to_material(RAT_SKIN),
    type: ARMOUR_TYPE.HEAD,
    quality: 100,
    affixes: [],
    item_type: 'armour'
}

export const RAT_SKIN_BOOTS_ARGUMENT: ArmourConstructorArgument = {
    durability: 100,
    material: materials.index_to_material(RAT_SKIN),
    type: ARMOUR_TYPE.FOOT,
    quality: 100,
    affixes: [],
    item_type: 'armour'
}

export const RAT_SKIN_GLOVES_ARGUMENT: ArmourConstructorArgument = {
    durability: 100,
    material: materials.index_to_material(RAT_SKIN),
    type: ARMOUR_TYPE.ARMS,
    quality: 100,
    affixes: [],
    item_type: 'armour'
}

