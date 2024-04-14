"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_sword = exports.craft_spear = exports.craft_wood_bow = exports.craft_bone_spear = exports.craft_wooden_mace = exports.craft_bone_dagger = exports.SPEAR_TIER = exports.WOOD_BOW_TIER = exports.BONE_SPEAR_TIER = exports.MACE_TIER = exports.DAGGER_TIER = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
const items_set_up_1 = require("../../../items/items_set_up");
const craft_1 = require("../../../calculations/craft");
const generate_craft_item_action_1 = require("./generate_craft_item_action");
const bone_spear_input = [{ material: materials_manager_1.WOOD, amount: 3 }, { material: materials_manager_1.RAT_BONE, amount: 4 }];
exports.DAGGER_TIER = 45;
exports.MACE_TIER = 10;
exports.BONE_SPEAR_TIER = 20;
exports.WOOD_BOW_TIER = 35;
exports.SPEAR_TIER = 15;
exports.craft_bone_dagger = (0, generate_craft_item_action_1.generate_craft_item_action)([{ material: materials_manager_1.RAT_BONE, amount: 15 }], items_set_up_1.BONE_DAGGER_ARGUMENT, craft_1.Craft.Durability.bone_item, 45, 'bone_carving');
exports.craft_wooden_mace = (0, generate_craft_item_action_1.generate_craft_item_action)([{ material: materials_manager_1.WOOD, amount: 8 }], items_set_up_1.WOODEN_MACE_ARGUMENT, craft_1.Craft.Durability.wood_item, 10, 'woodwork');
exports.craft_bone_spear = (0, generate_craft_item_action_1.generate_craft_item_action)(bone_spear_input, items_set_up_1.BONE_SPEAR_ARGUMENT, craft_1.Craft.Durability.wood_item, 20, 'woodwork');
exports.craft_wood_bow = (0, generate_craft_item_action_1.generate_craft_item_action)([{ material: materials_manager_1.WOOD, amount: 3 }], items_set_up_1.BASIC_BOW_ARGUMENT, craft_1.Craft.Durability.wood_item, 35, 'woodwork');
exports.craft_spear = (0, generate_craft_item_action_1.generate_craft_item_action)([{ material: materials_manager_1.WOOD, amount: 3 }], items_set_up_1.SPEAR_ARGUMENT, craft_1.Craft.Durability.wood_item, 15, 'woodwork');
exports.craft_sword = (0, generate_craft_item_action_1.generate_craft_item_action)([{ material: materials_manager_1.STEEL, amount: 2 }], items_set_up_1.SWORD_ARGUMENT, craft_1.Craft.Durability.metal_weapon, 60, 'smith');













































