import { equip_slot } from "@custom_types/inventory";
import { Damage } from "../Damage";
import { item_model_tag } from "./model_tags";
import { weapon_tag } from "../types";
import { ITEM_MATERIAL } from "./ITEM_MATERIAL";
import { ELODINO_FLESH, GRACI_HAIR, materials, RAT_BONE, RAT_SKIN, STEEL, TEXTILE, WOOD } from "../manager_classes/materials_manager";


export interface Itemlette {
    slot: equip_slot
    weapon_tag: weapon_tag
}


export function item_size (item: Itemlette): number {
    if (item.slot == 'weapon') {
        switch(item.weapon_tag) {
            case 'onehand':
                return 2
            case 'polearms':
                return 3
            case 'ranged':
                return 2
            case 'twohanded':
                return 4
        }
    }
    switch(item.slot) {
        case 'arms': return 1
        case 'foot': return 1
        case 'head': return 1
        case 'legs': return 3
        case 'body': return 5
    }
}

export const BaseDamage: {[_ in item_model_tag]: Damage} = {
    'graci_hair':                   new Damage(),
    'elodino_dress':                new Damage(),
    'rat_skin_pants':               new Damage(),
    'rat_skin_armour':              new Damage(),
    'rat_skin_boots':               new Damage(),
    'rat_skin_gloves':              new Damage(),
    'rat_skin_helmet':              new Damage(),
    'cloth_gloves':                 new Damage(),
    'cloth_armour':                 new Damage(),
    'cloth_helmet':                 new Damage(),
    'rat_skull_helmet':             new Damage(),
    'bone_armour':                  new Damage(),
    'bone_dagger':                  new Damage(1, 6, 12),
    'spear':                        new Damage(2, 6,  1),
    'bow':                          new Damage(5, 0,  0),
    'bone_spear':                   new Damage(2, 9,  3),
    'sword':                        new Damage(5, 5, 20),
    'wooden_mace':                  new Damage(8, 0,  0)
}

function base_resists(material: ITEM_MATERIAL, slot: equip_slot) {
    const size = item_size({slot: slot, weapon_tag: 'twohanded'})
    const resists = new Damage(material.density, material.hardness * 2 * size, material.hardness * size, material.density)
    return resists
}

const wood = materials.index_to_material(WOOD)
const skin = materials.index_to_material(RAT_SKIN)
const bone = materials.index_to_material(RAT_BONE)
const elodino = materials.index_to_material(ELODINO_FLESH)
const steel = materials.index_to_material(STEEL)
const graci_hair = materials.index_to_material(GRACI_HAIR)
const cloth = materials.index_to_material(TEXTILE)

export const BaseResist: {[_ in item_model_tag]: Damage} = {
    'graci_hair':                   base_resists(graci_hair, 'head'),
    'elodino_dress':                base_resists(elodino, 'body'),
    'rat_skin_pants':               base_resists(skin, 'legs'),
    'rat_skin_armour':              base_resists(skin, 'body'),
    'rat_skin_boots':               base_resists(skin, 'foot'),
    'rat_skin_gloves':              base_resists(skin, 'arms'),
    'rat_skin_helmet':              base_resists(skin, 'head'),
    'cloth_gloves':                 base_resists(cloth, 'arms'),
    'cloth_armour':                 base_resists(cloth, 'body'),
    'cloth_helmet':                 base_resists(cloth, 'head'),
    'rat_skull_helmet':             base_resists(bone, 'head'),
    'bone_armour':                  base_resists(bone, 'body'),
    'bone_dagger':                  new Damage(),
    'spear':                        new Damage(),
    'bow':                          new Damage(),
    'bone_spear':                   new Damage(),
    'sword':                        new Damage(),
    'wooden_mace':                  new Damage()
}

export const BaseRange: {[_ in item_model_tag]: number} = {
    'graci_hair':                   1,
    'elodino_dress':                1,
    'rat_skin_pants':               1,
    'rat_skin_armour':              1,
    'rat_skin_boots':               1,
    'rat_skin_gloves':              1,
    'rat_skin_helmet':              1,
    'cloth_gloves':                 1,
    'cloth_armour':                 1,
    'cloth_helmet':                 1,
    'rat_skull_helmet':             1,
    'bone_armour':                  1,
    'bone_dagger':                  0.8,
    'spear':                        2.0,
    'bow':                          0.9,
    'bone_spear':                   2.0,
    'sword':                        1.2,
    'wooden_mace':                  1.3
}

export const ModelToWeaponTag: {[_ in item_model_tag]: weapon_tag} = {
    'graci_hair':                   'twohanded',
    'elodino_dress':                'twohanded',
    'rat_skin_pants':               'twohanded',
    'rat_skin_armour':              'twohanded',
    'rat_skin_boots':               'twohanded',
    'rat_skin_gloves':              'twohanded',
    'rat_skin_helmet':              'twohanded',
    'cloth_gloves':                 'twohanded',
    'cloth_armour':                 'twohanded',
    'cloth_helmet':                 'twohanded',
    'rat_skull_helmet':             'twohanded',
    'bone_armour':                  'twohanded',
    'bone_dagger':                  'onehand',
    'spear':                        'polearms',
    'bow':                          'ranged',
    'bone_spear':                   'polearms',
    'sword':                        'onehand',
    'wooden_mace':                  'twohanded'
}

export const ModelToEquipSlot: {[_ in item_model_tag]: equip_slot} = {
    'graci_hair':                   'head',
    'elodino_dress':                'body',
    'rat_skin_pants':               'legs',
    'rat_skin_armour':              'body',
    'rat_skin_boots':               'foot',
    'rat_skin_gloves':              'arms',
    'rat_skin_helmet':              'head',
    'cloth_gloves':                 'arms',
    'cloth_armour':                 'body',
    'cloth_helmet':                 'head',
    'rat_skull_helmet':             'head',
    'bone_armour':                  'body',
    'bone_dagger':                  'weapon',
    'spear':                        'weapon',
    'bow':                          'weapon',
    'bone_spear':                   'weapon',
    'sword':                        'weapon',
    'wooden_mace':                  'weapon'
}

export const ModelToMaterial: {[_ in item_model_tag]: ITEM_MATERIAL} = {
    'graci_hair':                   materials.index_to_material(GRACI_HAIR),
    'elodino_dress':                materials.index_to_material(ELODINO_FLESH),
    'rat_skin_pants':               materials.index_to_material(RAT_SKIN),
    'rat_skin_armour':              materials.index_to_material(RAT_SKIN),
    'rat_skin_boots':               materials.index_to_material(RAT_SKIN),
    'rat_skin_gloves':              materials.index_to_material(RAT_SKIN),
    'rat_skin_helmet':              materials.index_to_material(RAT_SKIN),
    'cloth_gloves':                 materials.index_to_material(TEXTILE),
    'cloth_armour':                 materials.index_to_material(TEXTILE),
    'cloth_helmet':                 materials.index_to_material(TEXTILE),
    'rat_skull_helmet':             materials.index_to_material(RAT_BONE),
    'bone_armour':                  materials.index_to_material(RAT_BONE),
    'bone_dagger':                  materials.index_to_material(RAT_BONE),
    'spear':                        materials.index_to_material(WOOD),
    'bow':                          materials.index_to_material(WOOD),
    'bone_spear':                   materials.index_to_material(RAT_BONE),
    'sword':                        materials.index_to_material(STEEL),
    'wooden_mace':                  materials.index_to_material(WOOD),
}