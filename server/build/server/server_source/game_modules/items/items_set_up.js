"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAT_SKIN_GLOVES_ARGUMENT = exports.RAT_SKIN_BOOTS_ARGUMENT = exports.RAT_SKULL_HELMET_ARGUMENT = exports.RAT_SKIN_HELMET_ARGUMENT = exports.RAT_SKIN_ARMOUR_ARGUMENT = exports.RAT_SKIN_PANTS_ARGUMENT = exports.WOODEN_MACE_ARGUMENT = exports.BONE_DAGGER_ARGUMENT = exports.BONE_SPEAR_ARGUMENT = exports.SPEAR_ARGUMENT = exports.BASIC_BOW_ARGUMENT = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const damage_types_1 = require("../misc/damage_types");
const system_1 = require("./system");
function base_resists(material, slot) {
    const size = system_1.ItemSystem.size({ slot: slot, weapon_tag: 'twohanded' });
    const resists = new damage_types_1.Damage(material.density, material.hardness * 2 * size, material.hardness * size, material.density);
    return resists;
}
const wood = materials_manager_1.materials.index_to_material(materials_manager_1.WOOD);
const skin = materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN);
const bone = materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE);
const empty_resists = new damage_types_1.Damage();
exports.BASIC_BOW_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'ranged',
    model_tag: 'bow',
    resists: empty_resists,
    damage: new damage_types_1.Damage(5, 0, 0),
    range: 1
};
exports.SPEAR_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'polearms',
    model_tag: 'spear',
    resists: empty_resists,
    damage: new damage_types_1.Damage(2, 5, 1),
    range: 2
};
exports.BONE_SPEAR_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'polearms',
    model_tag: 'bone_spear',
    resists: empty_resists,
    damage: new damage_types_1.Damage(2, 8, 3),
    range: 2
};
exports.BONE_DAGGER_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: bone,
    weapon_tag: 'onehand',
    model_tag: 'bone_dagger',
    resists: empty_resists,
    damage: new damage_types_1.Damage(1, 4, 8),
    range: 0.8
};
exports.WOODEN_MACE_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'weapon',
    material: wood,
    weapon_tag: 'onehand',
    model_tag: 'wooden_mace',
    resists: empty_resists,
    damage: new damage_types_1.Damage(12, 0, 0),
    range: 1.3
};
exports.RAT_SKIN_PANTS_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'legs',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_pants',
    resists: base_resists(skin, 'legs'),
    damage: new damage_types_1.Damage(),
    range: 1
};
exports.RAT_SKIN_ARMOUR_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'body',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_armour',
    resists: base_resists(skin, 'body'),
    damage: new damage_types_1.Damage(),
    range: 1
};
exports.RAT_SKIN_HELMET_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'head',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_helmet',
    resists: base_resists(skin, 'head'),
    damage: new damage_types_1.Damage(),
    range: 1
};
exports.RAT_SKULL_HELMET_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'head',
    material: bone,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skull_helmet',
    resists: base_resists(bone, 'head'),
    damage: new damage_types_1.Damage(),
    range: 1
};
exports.RAT_SKIN_BOOTS_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'foot',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_boots',
    resists: base_resists(skin, 'foot'),
    damage: new damage_types_1.Damage(),
    range: 1
};
exports.RAT_SKIN_GLOVES_ARGUMENT = {
    durability: 100,
    affixes: [],
    slot: 'arms',
    material: skin,
    weapon_tag: 'twohanded',
    model_tag: 'rat_skin_gloves',
    resists: base_resists(skin, 'arms'),
    damage: new damage_types_1.Damage(),
    range: 1
};
