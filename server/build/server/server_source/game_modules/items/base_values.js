"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelToMaterial = exports.ModelToEquipSlot = exports.ModelToWeaponTag = exports.BaseRange = exports.BaseResist = exports.BaseDamage = exports.item_size = void 0;
const Damage_1 = require("../Damage");
const materials_manager_1 = require("../manager_classes/materials_manager");
function item_size(item) {
    if (item.slot == 'weapon') {
        switch (item.weapon_tag) {
            case 'onehand':
                return 2;
            case 'polearms':
                return 3;
            case 'ranged':
                return 2;
            case 'twohanded':
                return 4;
        }
    }
    switch (item.slot) {
        case 'arms': return 1;
        case 'foot': return 1;
        case 'head': return 1;
        case 'legs': return 3;
        case 'body': return 5;
    }
}
exports.item_size = item_size;
exports.BaseDamage = {
    'graci_hair': new Damage_1.Damage(),
    'elodino_dress': new Damage_1.Damage(),
    'rat_skin_pants': new Damage_1.Damage(),
    'rat_skin_armour': new Damage_1.Damage(),
    'rat_skin_boots': new Damage_1.Damage(),
    'rat_skin_gloves': new Damage_1.Damage(),
    'rat_skin_helmet': new Damage_1.Damage(),
    'cloth_gloves': new Damage_1.Damage(),
    'cloth_armour': new Damage_1.Damage(),
    'cloth_helmet': new Damage_1.Damage(),
    'rat_skull_helmet': new Damage_1.Damage(),
    'bone_armour': new Damage_1.Damage(),
    'bone_dagger': new Damage_1.Damage(1, 6, 12),
    'spear': new Damage_1.Damage(2, 6, 1),
    'bow': new Damage_1.Damage(5, 0, 0),
    'bone_spear': new Damage_1.Damage(2, 9, 3),
    'sword': new Damage_1.Damage(5, 5, 20),
    'wooden_mace': new Damage_1.Damage(8, 0, 0)
};
function base_resists(material, slot) {
    const size = item_size({ slot: slot, weapon_tag: 'twohanded' });
    const resists = new Damage_1.Damage(material.density, material.hardness * 2 * size, material.hardness * size, material.density);
    return resists;
}
const wood = materials_manager_1.materials.index_to_material(materials_manager_1.WOOD);
const skin = materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN);
const bone = materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE);
const elodino = materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH);
const steel = materials_manager_1.materials.index_to_material(materials_manager_1.STEEL);
const graci_hair = materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR);
const cloth = materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE);
exports.BaseResist = {
    'graci_hair': base_resists(graci_hair, 'head'),
    'elodino_dress': base_resists(elodino, 'body'),
    'rat_skin_pants': base_resists(skin, 'legs'),
    'rat_skin_armour': base_resists(skin, 'body'),
    'rat_skin_boots': base_resists(skin, 'foot'),
    'rat_skin_gloves': base_resists(skin, 'arms'),
    'rat_skin_helmet': base_resists(skin, 'head'),
    'cloth_gloves': base_resists(cloth, 'arms'),
    'cloth_armour': base_resists(cloth, 'body'),
    'cloth_helmet': base_resists(cloth, 'head'),
    'rat_skull_helmet': base_resists(bone, 'head'),
    'bone_armour': base_resists(bone, 'body'),
    'bone_dagger': new Damage_1.Damage(),
    'spear': new Damage_1.Damage(),
    'bow': new Damage_1.Damage(),
    'bone_spear': new Damage_1.Damage(),
    'sword': new Damage_1.Damage(),
    'wooden_mace': new Damage_1.Damage()
};
exports.BaseRange = {
    'graci_hair': 1,
    'elodino_dress': 1,
    'rat_skin_pants': 1,
    'rat_skin_armour': 1,
    'rat_skin_boots': 1,
    'rat_skin_gloves': 1,
    'rat_skin_helmet': 1,
    'cloth_gloves': 1,
    'cloth_armour': 1,
    'cloth_helmet': 1,
    'rat_skull_helmet': 1,
    'bone_armour': 1,
    'bone_dagger': 0.8,
    'spear': 2.0,
    'bow': 0.9,
    'bone_spear': 2.0,
    'sword': 1.2,
    'wooden_mace': 1.3
};
exports.ModelToWeaponTag = {
    'graci_hair': 'twohanded',
    'elodino_dress': 'twohanded',
    'rat_skin_pants': 'twohanded',
    'rat_skin_armour': 'twohanded',
    'rat_skin_boots': 'twohanded',
    'rat_skin_gloves': 'twohanded',
    'rat_skin_helmet': 'twohanded',
    'cloth_gloves': 'twohanded',
    'cloth_armour': 'twohanded',
    'cloth_helmet': 'twohanded',
    'rat_skull_helmet': 'twohanded',
    'bone_armour': 'twohanded',
    'bone_dagger': 'onehand',
    'spear': 'polearms',
    'bow': 'ranged',
    'bone_spear': 'polearms',
    'sword': 'onehand',
    'wooden_mace': 'twohanded'
};
exports.ModelToEquipSlot = {
    'graci_hair': 'head',
    'elodino_dress': 'body',
    'rat_skin_pants': 'legs',
    'rat_skin_armour': 'body',
    'rat_skin_boots': 'foot',
    'rat_skin_gloves': 'arms',
    'rat_skin_helmet': 'head',
    'cloth_gloves': 'arms',
    'cloth_armour': 'body',
    'cloth_helmet': 'head',
    'rat_skull_helmet': 'head',
    'bone_armour': 'body',
    'bone_dagger': 'weapon',
    'spear': 'weapon',
    'bow': 'weapon',
    'bone_spear': 'weapon',
    'sword': 'weapon',
    'wooden_mace': 'weapon'
};
exports.ModelToMaterial = {
    'graci_hair': materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR),
    'elodino_dress': materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH),
    'rat_skin_pants': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_armour': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_boots': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_gloves': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'cloth_gloves': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_armour': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'rat_skull_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'bone_armour': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'bone_dagger': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'spear': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    'bow': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    'bone_spear': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'sword': materials_manager_1.materials.index_to_material(materials_manager_1.STEEL),
    'wooden_mace': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
};
