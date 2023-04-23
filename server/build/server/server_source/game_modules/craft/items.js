"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftItem = void 0;
const items_set_up_1 = require("../items/items_set_up");
const materials_manager_1 = require("../manager_classes/materials_manager");
const CraftItem_1 = require("./CraftItem");
var CraftItem;
(function (CraftItem) {
    let RatSkin;
    (function (RatSkin) {
        RatSkin.helmet = (0, CraftItem_1.new_craft_item)('rat_skin_helmet', [{ material: materials_manager_1.RAT_SKIN, amount: 5 }], items_set_up_1.RAT_SKIN_HELMET_ARGUMENT, [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.gloves = (0, CraftItem_1.new_craft_item)('rat_skin_gloves', [{ material: materials_manager_1.RAT_SKIN, amount: 3 }], items_set_up_1.RAT_SKIN_GLOVES_ARGUMENT, [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.armour = (0, CraftItem_1.new_craft_item)('rat_skin_armour', [{ material: materials_manager_1.RAT_SKIN, amount: 10 }], items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT, [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.pants = (0, CraftItem_1.new_craft_item)('rat_skin_pants', [{ material: materials_manager_1.RAT_SKIN, amount: 8 }], items_set_up_1.RAT_SKIN_PANTS_ARGUMENT, [{ skill: 'clothier', difficulty: 20 }]);
        RatSkin.boots = (0, CraftItem_1.new_craft_item)('rat_skin_boots', [{ material: materials_manager_1.RAT_SKIN, amount: 8 }], items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT, [{ skill: 'clothier', difficulty: 20 }]);
    })(RatSkin = CraftItem.RatSkin || (CraftItem.RatSkin = {}));
    let Cloth;
    (function (Cloth) {
        Cloth.armour = (0, CraftItem_1.new_craft_item)('cloth_armour', [{ material: materials_manager_1.TEXTILE, amount: 10 }], items_set_up_1.CLOTH_ARMOUR_ARGUMENT, [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.gloves = (0, CraftItem_1.new_craft_item)('cloth_gloves', [{ material: materials_manager_1.TEXTILE, amount: 3 }], items_set_up_1.CLOTH_GLOVES_ARGUMENT, [{ skill: 'clothier', difficulty: 50 }]);
        Cloth.helmet = (0, CraftItem_1.new_craft_item)('cloth_helmet', [{ material: materials_manager_1.TEXTILE, amount: 5 }], items_set_up_1.CLOTH_HELMET_ARGUMENT, [{ skill: 'clothier', difficulty: 50 }]);
    })(Cloth = CraftItem.Cloth || (CraftItem.Cloth = {}));
    CraftItem.elodino_dress = (0, CraftItem_1.new_craft_item)('elodino_dress', [{ material: materials_manager_1.ELODINO_FLESH, amount: 4 }], items_set_up_1.ELODINO_DRESS_ARGUMENT, [{ skill: 'clothier', difficulty: 50 }]);
    CraftItem.graci_hair = (0, CraftItem_1.new_craft_item)('graci_hair', [{ material: materials_manager_1.GRACI_HAIR, amount: 1 }], items_set_up_1.GRACI_HAIR_ARGUMENT, [{ skill: 'clothier', difficulty: 5 }]);
    let Bone;
    (function (Bone) {
        Bone.armour = (0, CraftItem_1.new_craft_item)('bone_armour', [{ material: materials_manager_1.RAT_BONE, amount: 50 }], items_set_up_1.BONE_ARMOUR_ARGUMENT, [{ skill: 'bone_carving', difficulty: 50 }]);
        Bone.dagger = (0, CraftItem_1.new_craft_item)('bone_dagger', [{ material: materials_manager_1.RAT_BONE, amount: 15 }], items_set_up_1.BONE_DAGGER_ARGUMENT, [{ skill: 'bone_carving', difficulty: 30 }]);
        Bone.spear = (0, CraftItem_1.new_craft_item)('spear_wood_bone', [{ material: materials_manager_1.WOOD, amount: 2 }, { material: materials_manager_1.RAT_BONE, amount: 4 }], items_set_up_1.BONE_SPEAR_ARGUMENT, [{ skill: 'woodwork', difficulty: 10 }, { skill: 'bone_carving', difficulty: 5 }]);
    })(Bone = CraftItem.Bone || (CraftItem.Bone = {}));
    let Wood;
    (function (Wood) {
        Wood.mace = (0, CraftItem_1.new_craft_item)('wooden_mace', [{ material: materials_manager_1.WOOD, amount: 8 }], items_set_up_1.WOODEN_MACE_ARGUMENT, [{ skill: 'woodwork', difficulty: 10 }]);
        Wood.spear = (0, CraftItem_1.new_craft_item)('spear_wood', [{ material: materials_manager_1.WOOD, amount: 2 }], items_set_up_1.SPEAR_ARGUMENT, [{ skill: 'woodwork', difficulty: 10 }]);
        Wood.bow = (0, CraftItem_1.new_craft_item)('bow_wood', [{ material: materials_manager_1.WOOD, amount: 2 }], items_set_up_1.BASIC_BOW_ARGUMENT, [{ skill: 'woodwork', difficulty: 20 }]);
    })(Wood = CraftItem.Wood || (CraftItem.Wood = {}));
    CraftItem.sword = (0, CraftItem_1.new_craft_item)('steel_sword', [{ material: materials_manager_1.STEEL, amount: 2 }], items_set_up_1.SWORD_ARGUMENT, [{ skill: 'smith', difficulty: 60 }]);
})(CraftItem = exports.CraftItem || (exports.CraftItem = {}));
