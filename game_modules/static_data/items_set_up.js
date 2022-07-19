"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAT_SKIN_GLOVES_ARGUMENT = exports.RAT_SKIN_BOOTS_ARGUMENT = exports.RAT_SKIN_HELMET_ARGUMENT = exports.RAT_SKIN_ARMOUR_ARGUMENT = exports.RAT_SKIN_PANTS_ARGUMENT = exports.BONE_SPEAR_ARGUMENT = exports.SPEAR_ARGUMENT = exports.BASIC_BOW_ARGUMENT = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const item_tags_1 = require("./item_tags");
exports.BASIC_BOW_ARGUMENT = {
    durability: 100,
    shaft_material: materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    shaft_length: 0 /* SHAFT_LEGTH.HAND */,
    impact_size: 1 /* IMPACT_SIZE.SMALL */,
    impact_material: materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    impact_type: 2 /* IMPACT_TYPE.HEAD */,
    impact_quality: 0,
    affixes: [],
    item_type: 'weapon',
    ranged: true
};
exports.SPEAR_ARGUMENT = {
    durability: 100,
    shaft_length: 2 /* SHAFT_LEGTH.LONG */,
    shaft_material: materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    impact_size: 1 /* IMPACT_SIZE.SMALL */,
    impact_material: materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    impact_type: 0 /* IMPACT_TYPE.POINT */,
    impact_quality: 50,
    affixes: [],
    item_type: 'weapon'
};
exports.BONE_SPEAR_ARGUMENT = {
    durability: 100,
    shaft_length: 2 /* SHAFT_LEGTH.LONG */,
    shaft_material: materials_manager_1.materials.index_to_material(materials_manager_1.WOOD),
    impact_size: 1 /* IMPACT_SIZE.SMALL */,
    impact_material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_BONE),
    impact_type: 0 /* IMPACT_TYPE.POINT */,
    impact_quality: 100,
    affixes: [],
    item_type: 'weapon'
};
exports.RAT_SKIN_PANTS_ARGUMENT = {
    durability: 100,
    material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    type: item_tags_1.ARMOUR_TYPE.LEGS,
    quality: 100,
    affixes: [],
    item_type: 'armour'
};
exports.RAT_SKIN_ARMOUR_ARGUMENT = {
    durability: 100,
    material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    type: item_tags_1.ARMOUR_TYPE.BODY,
    quality: 100,
    affixes: [],
    item_type: 'armour'
};
exports.RAT_SKIN_HELMET_ARGUMENT = {
    durability: 100,
    material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    type: item_tags_1.ARMOUR_TYPE.HEAD,
    quality: 100,
    affixes: [],
    item_type: 'armour'
};
exports.RAT_SKIN_BOOTS_ARGUMENT = {
    durability: 100,
    material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    type: item_tags_1.ARMOUR_TYPE.FOOT,
    quality: 100,
    affixes: [],
    item_type: 'armour'
};
exports.RAT_SKIN_GLOVES_ARGUMENT = {
    durability: 100,
    material: materials_manager_1.materials.index_to_material(materials_manager_1.RAT_SKIN),
    type: item_tags_1.ARMOUR_TYPE.ARMS,
    quality: 100,
    affixes: [],
    item_type: 'armour'
};
