"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base_resists = exports.BaseResist = exports.ModelToMaterial = exports.ModelToEquipSlot = exports.ModelToWeaponTag = exports.BaseRange = exports.base_damage = exports.BaseDamage = exports.item_size = exports.weapon_size = void 0;
const Damage_1 = require("../Damage");
const model_tags_1 = require("./model_tags");
const materials_manager_1 = require("../manager_classes/materials_manager");
function weapon_size(type) {
    switch (type) {
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
exports.weapon_size = weapon_size;
function item_size(item) {
    let size = 1;
    if (item.weapon_tag != undefined) {
        size = weapon_size(item.weapon_tag);
    }
    switch (item.slot) {
        case "weapon": return size;
        case "secondary": return size;
        case "amulet": return 1;
        case "mail": return 15;
        case "greaves": return 4;
        case "left_pauldron": return 4;
        case "right_pauldron": return 4;
        case "left_gauntlet": return 4;
        case "right_gauntlet": return 4;
        case "boots": return 6;
        case "helmet": return 4;
        case "belt": return 2;
        case "robe": return 25;
        case "shirt": return 10;
        case "pants": return 15;
        case "dress": return 10;
        case "socks": return 6;
    }
}
exports.item_size = item_size;
exports.BaseDamage = {
    'bone_dagger': new Damage_1.Damage(1, 6, 12),
    'spear': new Damage_1.Damage(2, 6, 1),
    'bow': new Damage_1.Damage(5, 0, 0),
    'bone_spear': new Damage_1.Damage(2, 9, 3),
    'sword': new Damage_1.Damage(5, 5, 20),
    'wooden_mace': new Damage_1.Damage(8, 0, 0)
};
function base_damage(model) {
    let response = exports.BaseDamage[model];
    if (response == undefined)
        return new Damage_1.Damage();
    return response;
}
exports.base_damage = base_damage;
function generic_resists(material, slot) {
    const size = item_size({ slot: slot, weapon_tag: 'twohanded' });
    if (slot == 'weapon')
        return new Damage_1.Damage();
    const resists = new Damage_1.Damage(material.density * size, material.hardness * size, Math.round(material.hardness * 0.5) * size, material.density);
    return resists;
}
exports.BaseRange = {
    'bone_dagger': 0.8,
    'spear': 2.0,
    'bow': 0.9,
    'bone_spear': 2.0,
    'sword': 1.2,
    'wooden_mace': 1.3
};
exports.ModelToWeaponTag = {
    'bone_dagger': 'onehand',
    'spear': 'polearms',
    'bow': 'ranged',
    'bone_spear': 'polearms',
    'sword': 'onehand',
    'wooden_mace': 'twohanded'
};
exports.ModelToEquipSlot = {
    'graci_hair': 'helmet',
    'elodino_dress': 'dress',
    'rat_skin_pants': 'pants',
    'rat_skin_armour': 'mail',
    'rat_skin_boots': 'boots',
    'rat_skin_glove_left': 'left_gauntlet',
    'rat_skin_glove_right': 'right_gauntlet',
    'rat_skin_helmet': 'helmet',
    'cloth_glove_left': 'left_gauntlet',
    'cloth_glove_right': 'right_gauntlet',
    'cloth_mail': 'mail',
    'cloth_socks': 'socks',
    'cloth_helmet': 'helmet',
    'rat_skull_helmet': 'helmet',
    'bone_armour': 'mail',
    'bone_dagger': 'weapon',
    'spear': 'weapon',
    'bow': 'weapon',
    'bone_spear': 'weapon',
    'sword': 'weapon',
    'wooden_mace': 'weapon',
    'rat_skin_pauldron_left': 'left_pauldron',
    'bone_pauldron_right': 'right_pauldron',
    'bone_pauldron_left': 'left_pauldron',
    'rat_robe': 'robe',
};
exports.ModelToMaterial = {
    'graci_hair': materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR),
    'elodino_dress': materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH),
    'rat_skin_pants': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_armour': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_boots': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_glove_left': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_glove_right': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_skin_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'cloth_glove_left': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_glove_right': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_mail': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_socks': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'cloth_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.TEXTILE),
    'rat_skull_helmet': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'bone_armour': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'bone_dagger': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'spear': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    'bow': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    'bone_spear': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'sword': materials_manager_1.materials.index_to_material(materials_manager_1.STEEL),
    'wooden_mace': materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    'bone_pauldron_left': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'bone_pauldron_right': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    'rat_skin_pauldron_left': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    'rat_robe': materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
};
exports.BaseResist = {};
for (let model of model_tags_1.item_model_tags) {
    exports.BaseResist[model] = generic_resists(exports.ModelToMaterial[model], exports.ModelToEquipSlot[model]);
}
function base_resists(model) {
    return exports.BaseResist[model] || new Damage_1.Damage();
}
exports.base_resists = base_resists;
