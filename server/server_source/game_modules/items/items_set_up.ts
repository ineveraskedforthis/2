import { equip_slot } from "../../../../shared/inventory";
import { ELODINO_FLESH, GRACI_HAIR, materials, RAT_BONE, RAT_SKIN, STEEL, WOOD } from "../manager_classes/materials_manager";
import { Damage } from "../Damage";
import { ItemJson } from "./item";
import { ITEM_MATERIAL } from "./ITEM_MATERIAL";
import { ItemSystem } from "./system";

function base_resists(material: ITEM_MATERIAL, slot: equip_slot) {
    const size = ItemSystem.size({slot: slot, weapon_tag: 'twohanded'})
    const resists = new Damage(material.density, material.hardness * 2 * size, material.hardness * size, material.density)
    return resists
}

const wood = materials.index_to_material(WOOD)
const skin = materials.index_to_material(RAT_SKIN)
const bone = materials.index_to_material(RAT_BONE)
const elodino = materials.index_to_material(ELODINO_FLESH)
const steel = materials.index_to_material(STEEL)
const graci_hair = materials.index_to_material(GRACI_HAIR)
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

export const BONE_DAGGER_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: bone,
    weapon_tag: 'onehand',
    model_tag: 'bone_dagger',
    resists: empty_resists,
    damage: new Damage(1, 6, 12),
    range: 0.8
}

export const SWORD_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: steel,
    weapon_tag: 'onehand',
    model_tag: 'sword',
    resists: empty_resists,
    damage: new Damage(5, 5, 20),
    range: 1.2
}

export const WOODEN_MACE_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'twohanded',
    model_tag: 'wooden_mace',
    resists: empty_resists,
    damage: new Damage(8, 0, 0),
    range: 1.3
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

export const BONE_ARMOUR_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'body',
    material: bone,
    weapon_tag: 'twohanded',
    model_tag: 'bone_armour',
    resists: base_resists(bone, 'body'),
    damage: new Damage(),
    range: 1
}

export const ELODINO_DRESS_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'legs',
    material: elodino,
    weapon_tag: 'twohanded',
    model_tag: 'elodino_dress',
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
    model_tag: 'rat_skin_helmet',
    resists: base_resists(skin, 'head'),
    damage: new Damage(),
    range: 1
}

export const GRACI_HAIR_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'head',
    material: graci_hair,
    weapon_tag: 'twohanded',
    model_tag: 'graci_hair',
    resists: base_resists(skin, 'head'),
    damage: new Damage(),
    range: 1
}

export const RAT_SKULL_HELMET_ARGUMENT: ItemJson = {
    durability: 100,
    affixes: [],
    slot: 'head',
    material: bone,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skull_helmet',
    resists: base_resists(bone, 'head'),
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

