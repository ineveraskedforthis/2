import { equip_slot } from "../../shared/inventory";
import { materials, RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import { Damage } from "../misc/damage_types";
import { ItemJson, ITEM_MATERIAL } from "./item";
import { ItemSystem } from "./system";

function base_resists(material: ITEM_MATERIAL, slot: equip_slot) {
    const size = ItemSystem.size({slot: slot, weapon_tag: 'twohanded'})
    const resists = new Damage(material.density, material.hardness * 2 * size, material.hardness * size, material.density)
    return resists
}

const wood = materials.index_to_material(WOOD)
const skin = materials.index_to_material(RAT_SKIN)
const empty_resists = new Damage()

export const BASIC_BOW_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'ranged',
    model_tag: 'bow',
    resists: empty_resists,
    damage: new Damage(5, 0, 0),
    range: 1
}

export const SPEAR_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'polearms',
    model_tag: 'spear',
    resists: empty_resists,
    damage: new Damage(2, 5, 1),
    range: 2
}

export const BONE_SPEAR_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'polearms',
    model_tag: 'bone_spear',
    resists: empty_resists,
    damage: new Damage(2, 8, 3),
    range: 2
}

export const RAT_SKIN_PANTS_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'legs',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_pants',
    resists: base_resists(skin, 'legs'),
    damage: new Damage(),
    range: 1
}

export const RAT_SKIN_ARMOUR_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'body',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_armour',
    resists: base_resists(skin, 'body'),
    damage: new Damage(),
    range: 1
}

export const RAT_SKIN_HELMET_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'head',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_armour',
    resists: base_resists(skin, 'head'),
    damage: new Damage(),
    range: 1
}

export const RAT_SKIN_BOOTS_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'foot',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_boots',
    resists: base_resists(skin, 'foot'),
    damage: new Damage(),
    range: 1
}

export const RAT_SKIN_GLOVES_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'arms',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_gloves',
    resists: base_resists(skin, 'arms'),
    damage: new Damage(),
    range: 1
}

