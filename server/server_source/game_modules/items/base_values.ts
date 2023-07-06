import { equip_slot } from "@custom_types/inventory";
import { Damage } from "../Damage";
import { item_model_tag, item_model_tags } from "./model_tags";
import { weapon_tag } from "../types";
import { ITEM_MATERIAL } from "./ITEM_MATERIAL";
import { ELODINO_FLESH, GRACI_HAIR, materials, RAT_BONE, RAT_SKIN, STEEL, TEXTILE, WOOD } from "../manager_classes/materials_manager";


export interface Itemlette {
    slot: equip_slot
    weapon_tag: undefined | weapon_tag
}

export function weapon_size(type: weapon_tag) {
    switch(type) {
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

export function item_size (item: Itemlette): number {
    let size = 1
    if (item.weapon_tag != undefined) {
        size = weapon_size(item.weapon_tag)
    }
    switch(item.slot) {
        case "weapon": return size
        case "secondary": return size
        case "amulet": return 1
        case "mail": return 15
        // case "greaves": return 4
        case "left_pauldron": return 4
        case "right_pauldron": return 4
        case "left_gauntlet": return 4
        case "right_gauntlet": return 4
        case "boots": return 6
        case "helmet": return 4
        case "belt": return 2
        case "robe": return 25
        case "shirt": return 10
        case "pants": return 15
        case "dress": return 10
        case "socks": return 6
    }
}

export const BaseDamage: {[_ in item_model_tag]?: Damage} = {
    'bone_dagger':                  new Damage(1, 6, 12),
    'spear':                        new Damage(2, 6,  1),
    'bow':                          new Damage(5, 0,  0),
    'bone_spear':                   new Damage(2, 9,  3),
    'sword':                        new Damage(5, 5, 20),
    'wooden_mace':                  new Damage(8, 0,  0)
}

export function base_damage(model: item_model_tag) {
    let response = BaseDamage[model]
    if (response == undefined) return new Damage()
    return response
}

function generic_resists(material: ITEM_MATERIAL, slot: equip_slot) {
    const size = item_size({slot: slot, weapon_tag: 'twohanded'})
    if (slot == 'weapon') return new Damage()
    const resists = new Damage(material.density * size, material.hardness * size, Math.round(material.hardness * 0.5) * size, material.density)
    return resists
}

export const BaseRange: {[_ in item_model_tag]?: number} = {
    'bone_dagger':                  0.8,
    'spear':                        2.0,
    'bow':                          0.9,
    'bone_spear':                   2.0,
    'sword':                        1.2,
    'wooden_mace':                  1.3
}

export const ModelToWeaponTag: {[_ in item_model_tag]?: weapon_tag} = {
    'bone_dagger':                  'onehand',
    'spear':                        'polearms',
    'bow':                          'ranged',
    'bone_spear':                   'polearms',
    'sword':                        'onehand',
    'wooden_mace':                  'twohanded'
}

export const ModelToEquipSlot: {[_ in item_model_tag]: equip_slot} = {
    'graci_hair':                   'helmet',
    'elodino_dress':                'dress',
    'rat_skin_pants':               'pants',
    'rat_skin_armour':              'mail',
    'rat_skin_boots':               'boots',
    'rat_skin_glove_left':          'left_gauntlet',
    'rat_skin_glove_right':         'right_gauntlet',
    'rat_skin_helmet':              'helmet',
    'cloth_glove_left':             'left_gauntlet',
    'cloth_glove_right':            'right_gauntlet',
    'cloth_mail':                   'mail',
    'cloth_socks':                  'socks',
    'cloth_helmet':                 'helmet',
    'rat_skull_helmet':             'helmet',
    'bone_armour':                  'mail',
    'bone_dagger':                  'weapon',
    'spear':                        'weapon',
    'bow':                          'weapon',
    'bone_spear':                   'weapon',
    'sword':                        'weapon',
    'wooden_mace':                  'weapon',
    'rat_skin_pauldron_left':       'left_pauldron',
    'bone_pauldron_right':          'right_pauldron',
    'bone_pauldron_left':          'left_pauldron',
    'rat_robe':                     'robe',
    'cloth_belt':                   'belt',
    'cloth_shirt':                  'shirt',
    'cloth_pants':                  'pants'
}

export const ModelToMaterial: {[_ in item_model_tag]: ITEM_MATERIAL} = {
    'graci_hair':                   materials.index_to_material(GRACI_HAIR),
    'elodino_dress':                materials.index_to_material(ELODINO_FLESH),
    'rat_skin_pants':               materials.index_to_material(RAT_SKIN),
    'rat_skin_armour':              materials.index_to_material(RAT_SKIN),
    'rat_skin_boots':               materials.index_to_material(RAT_SKIN),
    'rat_skin_glove_left':          materials.index_to_material(RAT_SKIN),
    'rat_skin_glove_right':         materials.index_to_material(RAT_SKIN),
    'rat_skin_helmet':              materials.index_to_material(RAT_SKIN),
    'cloth_glove_left':             materials.index_to_material(TEXTILE),
    'cloth_glove_right':            materials.index_to_material(TEXTILE),
    'cloth_mail':                   materials.index_to_material(TEXTILE),
    'cloth_socks':                  materials.index_to_material(TEXTILE),
    'cloth_helmet':                 materials.index_to_material(TEXTILE),
    'rat_skull_helmet':             materials.index_to_material(RAT_BONE),
    'bone_armour':                  materials.index_to_material(RAT_BONE),
    'bone_dagger':                  materials.index_to_material(RAT_BONE),
    'spear':                        materials.index_to_material(WOOD),
    'bow':                          materials.index_to_material(WOOD),
    'bone_spear':                   materials.index_to_material(RAT_BONE),
    'sword':                        materials.index_to_material(STEEL),
    'wooden_mace':                  materials.index_to_material(WOOD),
    'bone_pauldron_left':           materials.index_to_material(RAT_BONE),
    'bone_pauldron_right':          materials.index_to_material(RAT_BONE),
    'rat_skin_pauldron_left':       materials.index_to_material(RAT_SKIN),
    'rat_robe':                     materials.index_to_material(RAT_SKIN),
    'cloth_belt':                   materials.index_to_material(TEXTILE),
    'cloth_shirt':                  materials.index_to_material(TEXTILE),
    'cloth_pants':                  materials.index_to_material(TEXTILE)
}

export const BaseResist: {[_ in item_model_tag]?: Damage} = {}
for (let model of item_model_tags) {
    BaseResist[model] = generic_resists(ModelToMaterial[model], ModelToEquipSlot[model])
}

export function base_resists(model: item_model_tag) {
    return BaseResist[model] || new Damage()
}