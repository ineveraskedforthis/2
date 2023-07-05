"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftItem = void 0;
// import { 
//     RAT_SKIN_HELMET_ARGUMENT,
//     RAT_SKIN_GLOVES_ARGUMENT, 
//     RAT_SKIN_ARMOUR_ARGUMENT,
//     RAT_SKIN_PANTS_ARGUMENT,
//     RAT_SKIN_BOOTS_ARGUMENT,
//     ELODINO_DRESS_ARGUMENT,
//     GRACI_HAIR_ARGUMENT, 
//     BONE_ARMOUR_ARGUMENT,
//     BASIC_BOW_ARGUMENT,
//     BONE_DAGGER_ARGUMENT,
//     BONE_SPEAR_ARGUMENT,
//     SPEAR_ARGUMENT,
//     SWORD_ARGUMENT,
//     WOODEN_MACE_ARGUMENT,
//     CLOTH_ARMOUR_ARGUMENT,
//     CLOTH_GLOVES_ARGUMENT,
//     CLOTH_HELMET_ARGUMENT} from "../items/items_set_up"
const materials_manager_1 = require("../manager_classes/materials_manager");
const CraftItem_1 = require("./CraftItem");
var CraftItem;
(function (CraftItem) {
    let RatSkin;
    (function (RatSkin) {
        RatSkin.helmet = (0, CraftItem_1.new_craft_item)('rat_skin_helmet', [{ material: materials_manager_1.RAT_SKIN, amount: 5 }], 'rat_skin_helmet', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.glove_right = (0, CraftItem_1.new_craft_item)('rat_skin_glove_right', [{ material: materials_manager_1.RAT_SKIN, amount: 3 }], 'rat_skin_glove_right', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.glove_left = (0, CraftItem_1.new_craft_item)('rat_skin_glove_left', [{ material: materials_manager_1.RAT_SKIN, amount: 3 }], 'rat_skin_glove_left', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.armour = (0, CraftItem_1.new_craft_item)('rat_skin_armour', [{ material: materials_manager_1.RAT_SKIN, amount: 10 }], 'rat_skin_armour', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.pants = (0, CraftItem_1.new_craft_item)('rat_skin_pants', [{ material: materials_manager_1.RAT_SKIN, amount: 8 }], 'rat_skin_pants', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.boots = (0, CraftItem_1.new_craft_item)('rat_skin_boots', [{ material: materials_manager_1.RAT_SKIN, amount: 8 }], 'rat_skin_boots', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.left_pauldron = (0, CraftItem_1.new_craft_item)('rat_skin_pauldron_left', [{ material: materials_manager_1.RAT_SKIN, amount: 3 }], 'rat_skin_pauldron_left', [], [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.robe = (0, CraftItem_1.new_craft_item)('rat_robe', [{ material: materials_manager_1.RAT_SKIN, amount: 30 }], 'rat_robe', [], [{ skill: 'clothier', difficulty: 50 }]);
    })(RatSkin = CraftItem.RatSkin || (CraftItem.RatSkin = {}));
    let Cloth;
    (function (Cloth) {
        Cloth.armour = (0, CraftItem_1.new_craft_item)('cloth_armour', [{ material: materials_manager_1.TEXTILE, amount: 10 }], 'cloth_mail', [], [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.socks = (0, CraftItem_1.new_craft_item)('cloth_socks', [{ material: materials_manager_1.TEXTILE, amount: 5 }], 'cloth_socks', [], [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.glove_left = (0, CraftItem_1.new_craft_item)('cloth_glove_left', [{ material: materials_manager_1.TEXTILE, amount: 3 }], 'cloth_glove_left', [], [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.glove_right = (0, CraftItem_1.new_craft_item)('cloth_glove_right', [{ material: materials_manager_1.TEXTILE, amount: 3 }], 'cloth_glove_right', [], [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.helmet = (0, CraftItem_1.new_craft_item)('cloth_helmet', [{ material: materials_manager_1.TEXTILE, amount: 5 }], 'cloth_helmet', [], [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.belt = (0, CraftItem_1.new_craft_item)('cloth_belt', [{ material: materials_manager_1.TEXTILE, amount: 5 }], 'cloth_belt', [], [{ skill: 'clothier', difficulty: 10 }]);
        Cloth.shirt = (0, CraftItem_1.new_craft_item)('cloth_shirt', [{ material: materials_manager_1.TEXTILE, amount: 10 }], 'cloth_shirt', [], [{ skill: 'clothier', difficulty: 20 }]);
        Cloth.pants = (0, CraftItem_1.new_craft_item)('cloth_pants', [{ material: materials_manager_1.TEXTILE, amount: 10 }], 'cloth_pants', [], [{ skill: 'clothier', difficulty: 20 }]);
    })(Cloth = CraftItem.Cloth || (CraftItem.Cloth = {}));
    CraftItem.elodino_dress = (0, CraftItem_1.new_craft_item)('elodino_dress', [{ material: materials_manager_1.ELODINO_FLESH, amount: 4 }], 'elodino_dress', [], [{ skill: 'clothier', difficulty: 50 }]);
    CraftItem.graci_hair = (0, CraftItem_1.new_craft_item)('graci_hair', [{ material: materials_manager_1.GRACI_HAIR, amount: 1 }], 'graci_hair', [], [{ skill: 'clothier', difficulty: 5 }]);
    let Bone;
    (function (Bone) {
        Bone.armour = (0, CraftItem_1.new_craft_item)('bone_armour', [{ material: materials_manager_1.RAT_BONE, amount: 50 }], 'bone_armour', [], [{ skill: 'bone_carving', difficulty: 50 }]);
        Bone.dagger = (0, CraftItem_1.new_craft_item)('bone_dagger', [{ material: materials_manager_1.RAT_BONE, amount: 15 }], 'bone_dagger', [], [{ skill: 'bone_carving', difficulty: 30 }]);
        Bone.spear = (0, CraftItem_1.new_craft_item)('spear_wood_bone', [{ material: materials_manager_1.WOOD, amount: 2 }, { material: materials_manager_1.RAT_BONE, amount: 4 }], 'bone_spear', [], [{ skill: 'woodwork', difficulty: 10 }, { skill: 'bone_carving', difficulty: 5 }]);
        Bone.pauldron_left = (0, CraftItem_1.new_craft_item)('bone_pauldron_left', [{ material: materials_manager_1.RAT_BONE, amount: 20 }], 'bone_pauldron_left', [], [{ skill: 'bone_carving', difficulty: 20 }]);
        Bone.pauldron_right = (0, CraftItem_1.new_craft_item)('bone_pauldron_right', [{ material: materials_manager_1.RAT_BONE, amount: 20 }], 'bone_pauldron_right', [], [{ skill: 'bone_carving', difficulty: 20 }]);
    })(Bone = CraftItem.Bone || (CraftItem.Bone = {}));
    let Wood;
    (function (Wood) {
        Wood.mace = (0, CraftItem_1.new_craft_item)('wooden_mace', [{ material: materials_manager_1.WOOD, amount: 8 }], 'wooden_mace', [], [{ skill: 'woodwork', difficulty: 10 }]);
        Wood.spear = (0, CraftItem_1.new_craft_item)('spear_wood', [{ material: materials_manager_1.WOOD, amount: 2 }], 'spear', [], [{ skill: 'woodwork', difficulty: 10 }]);
        Wood.bow = (0, CraftItem_1.new_craft_item)('bow_wood', [{ material: materials_manager_1.WOOD, amount: 2 }], 'bow', [], [{ skill: 'woodwork', difficulty: 20 }]);
    })(Wood = CraftItem.Wood || (CraftItem.Wood = {}));
    CraftItem.sword = (0, CraftItem_1.new_craft_item)('steel_sword', [{ material: materials_manager_1.STEEL, amount: 2 }], 'sword', [], [{ skill: 'smith', difficulty: 60 }]);
})(CraftItem = exports.CraftItem || (exports.CraftItem = {}));
