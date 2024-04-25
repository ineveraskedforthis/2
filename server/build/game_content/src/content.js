"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerkStorage = exports.SkillStorage = exports.ArmourStorage = exports.WeaponStorage = exports.ImpactStorage = exports.EquipSlotStorage = exports.MaterialCategoryStorage = exports.MaterialStorage = exports.PerkConfiguration = exports.SkillConfiguration = exports.ArmourConfiguration = exports.WeaponConfiguration = exports.ImpactConfiguration = exports.EquipSlotConfiguration = exports.MaterialCategoryConfiguration = exports.MaterialConfiguration = void 0;
class MaterialConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.MATERIAL;
    }
    static is_valid_string_id(id) {
        return id in this.MATERIAL_FROM_STRING;
    }
}
exports.MaterialConfiguration = MaterialConfiguration;
MaterialConfiguration.MATERIAL = [0 /* MATERIAL.ARROW_BONE */, 1 /* MATERIAL.ARROW_ZAZ */, 2 /* MATERIAL.COTTON */, 3 /* MATERIAL.TEXTILE */, 4 /* MATERIAL.SMALL_BONE_RAT */, 5 /* MATERIAL.SMALL_BONE_HUMAN */, 6 /* MATERIAL.SMALL_BONE_GRACI */, 7 /* MATERIAL.BONE_RAT */, 8 /* MATERIAL.BONE_HUMAN */, 9 /* MATERIAL.BONE_GRACI */, 10 /* MATERIAL.SKIN_RAT */, 11 /* MATERIAL.SKIN_HUMAN */, 12 /* MATERIAL.SKIN_GRACI */, 13 /* MATERIAL.SKIN_BALL */, 14 /* MATERIAL.LEATHER_RAT */, 15 /* MATERIAL.LEATHER_HUMAN */, 16 /* MATERIAL.LEATHER_GRACI */, 17 /* MATERIAL.LEATHER_BALL */, 18 /* MATERIAL.MEAT_RAT */, 19 /* MATERIAL.MEAT_RAT_FRIED */, 20 /* MATERIAL.MEAT_ELODINO */, 21 /* MATERIAL.MEAT_BALL */, 22 /* MATERIAL.MEAT_HUMAN */, 23 /* MATERIAL.MEAT_GRACI */, 24 /* MATERIAL.MEAT_HUMAN_FRIED */, 25 /* MATERIAL.MEAT_GRACI_FRIED */, 26 /* MATERIAL.FISH_OKU */, 27 /* MATERIAL.FISH_OKU_FRIED */, 28 /* MATERIAL.BERRY_FIE */, 29 /* MATERIAL.BERRY_ZAZ */, 30 /* MATERIAL.ZAZ */, 31 /* MATERIAL.WOOD_RED */, 32 /* MATERIAL.WOOD_RED_PLATE */, 33 /* MATERIAL.HAIR_GRACI */, 34 /* MATERIAL.STEEL */,];
MaterialConfiguration.MATERIAL_FROM_STRING = { "arrow-bone": 0 /* MATERIAL.ARROW_BONE */, "arrow-zaz": 1 /* MATERIAL.ARROW_ZAZ */, "cotton": 2 /* MATERIAL.COTTON */, "textile": 3 /* MATERIAL.TEXTILE */, "small-bone-rat": 4 /* MATERIAL.SMALL_BONE_RAT */, "small-bone-human": 5 /* MATERIAL.SMALL_BONE_HUMAN */, "small-bone-graci": 6 /* MATERIAL.SMALL_BONE_GRACI */, "bone-rat": 7 /* MATERIAL.BONE_RAT */, "bone-human": 8 /* MATERIAL.BONE_HUMAN */, "bone-graci": 9 /* MATERIAL.BONE_GRACI */, "skin-rat": 10 /* MATERIAL.SKIN_RAT */, "skin-human": 11 /* MATERIAL.SKIN_HUMAN */, "skin-graci": 12 /* MATERIAL.SKIN_GRACI */, "skin-ball": 13 /* MATERIAL.SKIN_BALL */, "leather-rat": 14 /* MATERIAL.LEATHER_RAT */, "leather-human": 15 /* MATERIAL.LEATHER_HUMAN */, "leather-graci": 16 /* MATERIAL.LEATHER_GRACI */, "leather-ball": 17 /* MATERIAL.LEATHER_BALL */, "meat-rat": 18 /* MATERIAL.MEAT_RAT */, "meat-rat-fried": 19 /* MATERIAL.MEAT_RAT_FRIED */, "meat-elodino": 20 /* MATERIAL.MEAT_ELODINO */, "meat-ball": 21 /* MATERIAL.MEAT_BALL */, "meat-human": 22 /* MATERIAL.MEAT_HUMAN */, "meat-graci": 23 /* MATERIAL.MEAT_GRACI */, "meat-human-fried": 24 /* MATERIAL.MEAT_HUMAN_FRIED */, "meat-graci-fried": 25 /* MATERIAL.MEAT_GRACI_FRIED */, "fish-oku": 26 /* MATERIAL.FISH_OKU */, "fish-oku-fried": 27 /* MATERIAL.FISH_OKU_FRIED */, "berry-fie": 28 /* MATERIAL.BERRY_FIE */, "berry-zaz": 29 /* MATERIAL.BERRY_ZAZ */, "zaz": 30 /* MATERIAL.ZAZ */, "wood-red": 31 /* MATERIAL.WOOD_RED */, "wood-red-plate": 32 /* MATERIAL.WOOD_RED_PLATE */, "hair-graci": 33 /* MATERIAL.HAIR_GRACI */, "steel": 34 /* MATERIAL.STEEL */ };
MaterialConfiguration.MATERIAL_TO_STRING = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-graci", "meat-human-fried", "meat-graci-fried", "fish-oku", "fish-oku-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel",];
// ENUMS: 
MaterialConfiguration.MATERIAL_MATERIAL = [0 /* MATERIAL.ARROW_BONE */, 1 /* MATERIAL.ARROW_ZAZ */, 2 /* MATERIAL.COTTON */, 3 /* MATERIAL.TEXTILE */, 4 /* MATERIAL.SMALL_BONE_RAT */, 5 /* MATERIAL.SMALL_BONE_HUMAN */, 6 /* MATERIAL.SMALL_BONE_GRACI */, 7 /* MATERIAL.BONE_RAT */, 8 /* MATERIAL.BONE_HUMAN */, 9 /* MATERIAL.BONE_GRACI */, 10 /* MATERIAL.SKIN_RAT */, 11 /* MATERIAL.SKIN_HUMAN */, 12 /* MATERIAL.SKIN_GRACI */, 13 /* MATERIAL.SKIN_BALL */, 14 /* MATERIAL.LEATHER_RAT */, 15 /* MATERIAL.LEATHER_HUMAN */, 16 /* MATERIAL.LEATHER_GRACI */, 17 /* MATERIAL.LEATHER_BALL */, 18 /* MATERIAL.MEAT_RAT */, 19 /* MATERIAL.MEAT_RAT_FRIED */, 20 /* MATERIAL.MEAT_ELODINO */, 21 /* MATERIAL.MEAT_BALL */, 22 /* MATERIAL.MEAT_HUMAN */, 23 /* MATERIAL.MEAT_GRACI */, 24 /* MATERIAL.MEAT_HUMAN_FRIED */, 25 /* MATERIAL.MEAT_GRACI_FRIED */, 26 /* MATERIAL.FISH_OKU */, 27 /* MATERIAL.FISH_OKU_FRIED */, 28 /* MATERIAL.BERRY_FIE */, 29 /* MATERIAL.BERRY_ZAZ */, 30 /* MATERIAL.ZAZ */, 31 /* MATERIAL.WOOD_RED */, 32 /* MATERIAL.WOOD_RED_PLATE */, 33 /* MATERIAL.HAIR_GRACI */, 34 /* MATERIAL.STEEL */,];
MaterialConfiguration.MATERIAL_MATERIAL_STRING = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-graci", "meat-human-fried", "meat-graci-fried", "fish-oku", "fish-oku-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel",];
MaterialConfiguration.MATERIAL_CATEGORY = [0 /* MATERIAL_CATEGORY.BOW_AMMO */, 0 /* MATERIAL_CATEGORY.BOW_AMMO */, 1 /* MATERIAL_CATEGORY.PLANT */, 11 /* MATERIAL_CATEGORY.TEXTILE */, 3 /* MATERIAL_CATEGORY.BONE */, 3 /* MATERIAL_CATEGORY.BONE */, 3 /* MATERIAL_CATEGORY.BONE */, 3 /* MATERIAL_CATEGORY.BONE */, 3 /* MATERIAL_CATEGORY.BONE */, 3 /* MATERIAL_CATEGORY.BONE */, 4 /* MATERIAL_CATEGORY.SKIN */, 4 /* MATERIAL_CATEGORY.SKIN */, 4 /* MATERIAL_CATEGORY.SKIN */, 4 /* MATERIAL_CATEGORY.SKIN */, 5 /* MATERIAL_CATEGORY.LEATHER */, 5 /* MATERIAL_CATEGORY.LEATHER */, 5 /* MATERIAL_CATEGORY.LEATHER */, 5 /* MATERIAL_CATEGORY.LEATHER */, 6 /* MATERIAL_CATEGORY.MEAT */, 8 /* MATERIAL_CATEGORY.FOOD */, 6 /* MATERIAL_CATEGORY.MEAT */, 8 /* MATERIAL_CATEGORY.FOOD */, 6 /* MATERIAL_CATEGORY.MEAT */, 6 /* MATERIAL_CATEGORY.MEAT */, 8 /* MATERIAL_CATEGORY.FOOD */, 8 /* MATERIAL_CATEGORY.FOOD */, 7 /* MATERIAL_CATEGORY.FISH */, 8 /* MATERIAL_CATEGORY.FOOD */, 9 /* MATERIAL_CATEGORY.FRUIT */, 9 /* MATERIAL_CATEGORY.FRUIT */, 2 /* MATERIAL_CATEGORY.MATERIAL */, 10 /* MATERIAL_CATEGORY.WOOD */, 2 /* MATERIAL_CATEGORY.MATERIAL */, 11 /* MATERIAL_CATEGORY.TEXTILE */, 12 /* MATERIAL_CATEGORY.METAL */,];
MaterialConfiguration.MATERIAL_CATEGORY_STRING = ["bow-ammo", "bow-ammo", "plant", "textile", "bone", "bone", "bone", "bone", "bone", "bone", "skin", "skin", "skin", "skin", "leather", "leather", "leather", "leather", "meat", "food", "meat", "food", "meat", "meat", "food", "food", "fish", "food", "fruit", "fruit", "material", "wood", "material", "textile", "metal",];
// Numbers: 
MaterialConfiguration.MATERIAL_CUTTING_POWER = [2.0, 4.0, 0.0, 0.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 1.5, 1.0, 20.0, 5.0,];
MaterialConfiguration.MATERIAL_DENSITY = [0.2, 0.2, 0.2, 1.0, 0.5, 0.6, 0.2, 0.5, 0.6, 0.2, 1.5, 1.2, 1.1, 0.8, 3.0, 2.4, 2.2, 1.6, 0.4, 0.6, 0.1, 0.1, 0.5, 0.2, 0.7, 0.2, 0.3, 0.5, 0.2, 0.3, 10.0, 1.0, 2.0, 10.0, 8.0,];
MaterialConfiguration.MATERIAL_CUTTING_PROTECTION = [0.0, 0.0, 0.2, 0.1, 0.25, 0.5, 0.5, 0.5, 0.5, 5.0, 0.6, 0.5, 0.4, 0.3, 0.5, 0.4, 0.3, 0.2, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.8, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 5.0,];
MaterialConfiguration.MATERIAL_BLUNT_PROTECTION = [0.0, 0.0, 0.05, 0.01, 0.025, 0.05, 0.05, 0.3, 0.4, 0.1, 0.01, 0.01, 0.01, 0.01, 0.05, 0.04, 0.03, 0.02, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 5.0,];
MaterialConfiguration.MATERIAL_PENENTRATION_PROTECTION = [0.0, 0.0, 0.05, 0.1, 0.5, 0.5, 0.5, 3.0, 4.0, 5.0, 0.2, 0.1, 0.0, 0.0, 0.3, 0.2, 0.1, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.0, 5.0, 2.5, 5.0, 10.0, 5.0,];
MaterialConfiguration.MATERIAL_MAGIC_POWER = [0.0, 1.0, 0.05, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 2.0, 4.0, 0.0, 0.0, 2.0, 2.0, 0.0, 4.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.1, 1.0, 0.1, 0.1, 5.0, 0.0,];
MaterialConfiguration.MATERIAL_UNIT_SIZE = [0.1, 0.1, 1.0, 1.0, 0.03, 0.03, 0.5, 0.4, 0.4, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 0.01, 0.01, 0.03, 1.0, 1.0, 1.0, 1.0,];
// Strings: 
MaterialConfiguration.MATERIAL_NAME = ["Bone arrow", "Zaz arrow", "Cotton", "Textile", "Bone(rat, small)", "Bone(human, small)", "Bone(graci, small)", "Bone(rat)", "Bone(human)", "Bone(graci)", "Skin(rat)", "Skin(human)", "Skin(graci)", "Skin(meat ball)", "Leather(rat)", "Leather(human)", "Leather(graci)", "Leather(meat ball)", "Meat(rat)", "Fried meat(rat)", "Meat(elodino)", "Meat(meat ball)", "Meat(human)", "Meat(graci)", "Fried meat(human)", "Fried meat(graci)", "Fish(oku)", "Fried fish(oku)", "Fieberry", "Zazberry", "Zaz", "Wood(raw)", "Wood(plates)", "Hair(graci)", "Steel",];
class MaterialCategoryConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.CATEGORY;
    }
    static is_valid_string_id(id) {
        return id in this.CATEGORY_FROM_STRING;
    }
}
exports.MaterialCategoryConfiguration = MaterialCategoryConfiguration;
MaterialCategoryConfiguration.CATEGORY = [0 /* MATERIAL_CATEGORY.BOW_AMMO */, 1 /* MATERIAL_CATEGORY.PLANT */, 2 /* MATERIAL_CATEGORY.MATERIAL */, 3 /* MATERIAL_CATEGORY.BONE */, 4 /* MATERIAL_CATEGORY.SKIN */, 5 /* MATERIAL_CATEGORY.LEATHER */, 6 /* MATERIAL_CATEGORY.MEAT */, 7 /* MATERIAL_CATEGORY.FISH */, 8 /* MATERIAL_CATEGORY.FOOD */, 9 /* MATERIAL_CATEGORY.FRUIT */, 10 /* MATERIAL_CATEGORY.WOOD */, 11 /* MATERIAL_CATEGORY.TEXTILE */, 12 /* MATERIAL_CATEGORY.METAL */,];
MaterialCategoryConfiguration.CATEGORY_FROM_STRING = { "bow-ammo": 0 /* MATERIAL_CATEGORY.BOW_AMMO */, "plant": 1 /* MATERIAL_CATEGORY.PLANT */, "material": 2 /* MATERIAL_CATEGORY.MATERIAL */, "bone": 3 /* MATERIAL_CATEGORY.BONE */, "skin": 4 /* MATERIAL_CATEGORY.SKIN */, "leather": 5 /* MATERIAL_CATEGORY.LEATHER */, "meat": 6 /* MATERIAL_CATEGORY.MEAT */, "fish": 7 /* MATERIAL_CATEGORY.FISH */, "food": 8 /* MATERIAL_CATEGORY.FOOD */, "fruit": 9 /* MATERIAL_CATEGORY.FRUIT */, "wood": 10 /* MATERIAL_CATEGORY.WOOD */, "textile": 11 /* MATERIAL_CATEGORY.TEXTILE */, "metal": 12 /* MATERIAL_CATEGORY.METAL */ };
MaterialCategoryConfiguration.CATEGORY_TO_STRING = ["bow-ammo", "plant", "material", "bone", "skin", "leather", "meat", "fish", "food", "fruit", "wood", "textile", "metal",];
// ENUMS: 
MaterialCategoryConfiguration.MATERIAL_CATEGORY_CATEGORY = [0 /* MATERIAL_CATEGORY.BOW_AMMO */, 1 /* MATERIAL_CATEGORY.PLANT */, 2 /* MATERIAL_CATEGORY.MATERIAL */, 3 /* MATERIAL_CATEGORY.BONE */, 4 /* MATERIAL_CATEGORY.SKIN */, 5 /* MATERIAL_CATEGORY.LEATHER */, 6 /* MATERIAL_CATEGORY.MEAT */, 7 /* MATERIAL_CATEGORY.FISH */, 8 /* MATERIAL_CATEGORY.FOOD */, 9 /* MATERIAL_CATEGORY.FRUIT */, 10 /* MATERIAL_CATEGORY.WOOD */, 11 /* MATERIAL_CATEGORY.TEXTILE */, 12 /* MATERIAL_CATEGORY.METAL */,];
MaterialCategoryConfiguration.MATERIAL_CATEGORY_CATEGORY_STRING = ["bow-ammo", "plant", "material", "bone", "skin", "leather", "meat", "fish", "food", "fruit", "wood", "textile", "metal",];
// Numbers: 
// Strings: 
MaterialCategoryConfiguration.MATERIAL_CATEGORY_NAME = ["Ammo(bow)", "Plant", "Material", "Bone", "Skin", "Leather", "Meat", "Fish", "Food", "Fruit", "Wood", "Textile", "Metal",];
class EquipSlotConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.SLOT;
    }
    static is_valid_string_id(id) {
        return id in this.SLOT_FROM_STRING;
    }
}
exports.EquipSlotConfiguration = EquipSlotConfiguration;
EquipSlotConfiguration.SLOT = [0 /* EQUIP_SLOT.WEAPON */, 1 /* EQUIP_SLOT.SECONDARY */, 2 /* EQUIP_SLOT.AMULET */, 3 /* EQUIP_SLOT.MAIL */, 4 /* EQUIP_SLOT.PAULDRON_LEFT */, 5 /* EQUIP_SLOT.PAULDRON_RIGHT */, 6 /* EQUIP_SLOT.GAUNTLET_LEFT */, 7 /* EQUIP_SLOT.GAUNTLET_RIGHT */, 8 /* EQUIP_SLOT.BOOTS */, 9 /* EQUIP_SLOT.HELMET */, 10 /* EQUIP_SLOT.BELT */, 11 /* EQUIP_SLOT.ROBE */, 12 /* EQUIP_SLOT.SHIRT */, 13 /* EQUIP_SLOT.PANTS */, 14 /* EQUIP_SLOT.DRESS */, 15 /* EQUIP_SLOT.SOCKS */, 16 /* EQUIP_SLOT.NONE */,];
EquipSlotConfiguration.SLOT_FROM_STRING = { "weapon": 0 /* EQUIP_SLOT.WEAPON */, "secondary": 1 /* EQUIP_SLOT.SECONDARY */, "amulet": 2 /* EQUIP_SLOT.AMULET */, "mail": 3 /* EQUIP_SLOT.MAIL */, "pauldron-left": 4 /* EQUIP_SLOT.PAULDRON_LEFT */, "pauldron-right": 5 /* EQUIP_SLOT.PAULDRON_RIGHT */, "gauntlet-left": 6 /* EQUIP_SLOT.GAUNTLET_LEFT */, "gauntlet-right": 7 /* EQUIP_SLOT.GAUNTLET_RIGHT */, "boots": 8 /* EQUIP_SLOT.BOOTS */, "helmet": 9 /* EQUIP_SLOT.HELMET */, "belt": 10 /* EQUIP_SLOT.BELT */, "robe": 11 /* EQUIP_SLOT.ROBE */, "shirt": 12 /* EQUIP_SLOT.SHIRT */, "pants": 13 /* EQUIP_SLOT.PANTS */, "dress": 14 /* EQUIP_SLOT.DRESS */, "socks": 15 /* EQUIP_SLOT.SOCKS */, "none": 16 /* EQUIP_SLOT.NONE */ };
EquipSlotConfiguration.SLOT_TO_STRING = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", "none",];
// ENUMS: 
EquipSlotConfiguration.EQUIP_SLOT_SLOT = [0 /* EQUIP_SLOT.WEAPON */, 1 /* EQUIP_SLOT.SECONDARY */, 2 /* EQUIP_SLOT.AMULET */, 3 /* EQUIP_SLOT.MAIL */, 4 /* EQUIP_SLOT.PAULDRON_LEFT */, 5 /* EQUIP_SLOT.PAULDRON_RIGHT */, 6 /* EQUIP_SLOT.GAUNTLET_LEFT */, 7 /* EQUIP_SLOT.GAUNTLET_RIGHT */, 8 /* EQUIP_SLOT.BOOTS */, 9 /* EQUIP_SLOT.HELMET */, 10 /* EQUIP_SLOT.BELT */, 11 /* EQUIP_SLOT.ROBE */, 12 /* EQUIP_SLOT.SHIRT */, 13 /* EQUIP_SLOT.PANTS */, 14 /* EQUIP_SLOT.DRESS */, 15 /* EQUIP_SLOT.SOCKS */, 16 /* EQUIP_SLOT.NONE */,];
EquipSlotConfiguration.EQUIP_SLOT_SLOT_STRING = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", "none",];
// Numbers: 
// Strings: 
EquipSlotConfiguration.EQUIP_SLOT_NAME = ["Weapon", "Secondary", "Amulet", "Chestpiece", "Left pauldron", "Right pauldron", "Left gauntlet", "Right gauntlet", "Boots", "Helmet", "Belt", "Robe", "Shirt", "Pants", "Dress", "Socks", "nan",];
class ImpactConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.IMPACT;
    }
    static is_valid_string_id(id) {
        return id in this.IMPACT_FROM_STRING;
    }
}
exports.ImpactConfiguration = ImpactConfiguration;
ImpactConfiguration.IMPACT = [0 /* IMPACT_TYPE.POINT */, 1 /* IMPACT_TYPE.BLADE */, 2 /* IMPACT_TYPE.BLUNT */, 3 /* IMPACT_TYPE.NONE */,];
ImpactConfiguration.IMPACT_FROM_STRING = { "point": 0 /* IMPACT_TYPE.POINT */, "blade": 1 /* IMPACT_TYPE.BLADE */, "blunt": 2 /* IMPACT_TYPE.BLUNT */, "none": 3 /* IMPACT_TYPE.NONE */ };
ImpactConfiguration.IMPACT_TO_STRING = ["point", "blade", "blunt", "none",];
// ENUMS: 
ImpactConfiguration.IMPACT_TYPE_IMPACT = [0 /* IMPACT_TYPE.POINT */, 1 /* IMPACT_TYPE.BLADE */, 2 /* IMPACT_TYPE.BLUNT */, 3 /* IMPACT_TYPE.NONE */,];
ImpactConfiguration.IMPACT_TYPE_IMPACT_STRING = ["point", "blade", "blunt", "none",];
// Numbers: 
ImpactConfiguration.IMPACT_TYPE_HANDLE_RATIO = [0.9, 0.1, 0.3, 1.0,];
ImpactConfiguration.IMPACT_TYPE_BLUNT = [0.8, 1.0, 1.0, 0.0,];
ImpactConfiguration.IMPACT_TYPE_PIERCE = [1.0, 0.8, 0.0, 0.0,];
ImpactConfiguration.IMPACT_TYPE_SLICE = [0.4, 1.0, 0.0, 0.0,];
// Strings: 
ImpactConfiguration.IMPACT_TYPE_NAME = ["Point", "Blade", "Blunt", "nan",];
class WeaponConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.WEAPON;
    }
    static is_valid_string_id(id) {
        return id in this.WEAPON_FROM_STRING;
    }
}
exports.WeaponConfiguration = WeaponConfiguration;
WeaponConfiguration.WEAPON = [0 /* WEAPON.BOW_WOOD */, 1 /* WEAPON.SPEAR_WOOD_RED */, 2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */, 3 /* WEAPON.DAGGER_BONE_RAT */, 4 /* WEAPON.SWORD_STEEL */, 5 /* WEAPON.MACE_WOOD_RED */,];
WeaponConfiguration.WEAPON_FROM_STRING = { "bow-wood": 0 /* WEAPON.BOW_WOOD */, "spear-wood-red": 1 /* WEAPON.SPEAR_WOOD_RED */, "spear-wood-red-bone-rat": 2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */, "dagger-bone-rat": 3 /* WEAPON.DAGGER_BONE_RAT */, "sword-steel": 4 /* WEAPON.SWORD_STEEL */, "mace-wood-red": 5 /* WEAPON.MACE_WOOD_RED */ };
WeaponConfiguration.WEAPON_TO_STRING = ["bow-wood", "spear-wood-red", "spear-wood-red-bone-rat", "dagger-bone-rat", "sword-steel", "mace-wood-red",];
// ENUMS: 
WeaponConfiguration.WEAPON_WEAPON = [0 /* WEAPON.BOW_WOOD */, 1 /* WEAPON.SPEAR_WOOD_RED */, 2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */, 3 /* WEAPON.DAGGER_BONE_RAT */, 4 /* WEAPON.SWORD_STEEL */, 5 /* WEAPON.MACE_WOOD_RED */,];
WeaponConfiguration.WEAPON_WEAPON_STRING = ["bow-wood", "spear-wood-red", "spear-wood-red-bone-rat", "dagger-bone-rat", "sword-steel", "mace-wood-red",];
WeaponConfiguration.WEAPON_MATERIAL = [31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */, 4 /* MATERIAL.SMALL_BONE_RAT */, 7 /* MATERIAL.BONE_RAT */, 34 /* MATERIAL.STEEL */, 31 /* MATERIAL.WOOD_RED */,];
WeaponConfiguration.WEAPON_MATERIAL_STRING = ["wood-red", "wood-red", "small-bone-rat", "bone-rat", "steel", "wood-red",];
WeaponConfiguration.WEAPON_SECONDARY_MATERIAL = [31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */, 7 /* MATERIAL.BONE_RAT */, 34 /* MATERIAL.STEEL */, 31 /* MATERIAL.WOOD_RED */,];
WeaponConfiguration.WEAPON_SECONDARY_MATERIAL_STRING = ["wood-red", "wood-red", "wood-red", "bone-rat", "steel", "wood-red",];
WeaponConfiguration.WEAPON_IMPACT = [2 /* IMPACT_TYPE.BLUNT */, 0 /* IMPACT_TYPE.POINT */, 0 /* IMPACT_TYPE.POINT */, 1 /* IMPACT_TYPE.BLADE */, 1 /* IMPACT_TYPE.BLADE */, 2 /* IMPACT_TYPE.BLUNT */,];
WeaponConfiguration.WEAPON_IMPACT_STRING = ["blunt", "point", "point", "blade", "blade", "blunt",];
// Numbers: 
WeaponConfiguration.WEAPON_MAGIC_POWER = [0, 0, 0, 0, 0, 0,];
WeaponConfiguration.WEAPON_SIZE = [0.75, 1.5, 1.5, 0.5, 1.0, 3.0,];
WeaponConfiguration.WEAPON_LENGTH = [1.0, 3.0, 3.0, 0.5, 1.0, 1.0,];
WeaponConfiguration.WEAPON_CRAFTABLE = [1, 1, 1, 1, 1, 1,];
WeaponConfiguration.WEAPON_BOW_POWER = [20, 0, 0, 0, 0, 0,];
// Strings: 
WeaponConfiguration.WEAPON_NAME = ["Bow", "Spear", "Spear", "Dagger", "Sword", "Mace",];
class ArmourConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.ARMOUR;
    }
    static is_valid_string_id(id) {
        return id in this.ARMOUR_FROM_STRING;
    }
}
exports.ArmourConfiguration = ArmourConfiguration;
ArmourConfiguration.ARMOUR = [0 /* ARMOUR.HELMET_SKULL_RAT */, 1 /* ARMOUR.HELMET_TEXTILE */, 2 /* ARMOUR.HELMET_LEATHER_RAT */, 3 /* ARMOUR.HELMET_HAIR_GRACI */, 4 /* ARMOUR.MAIL_BONE_RAT */, 5 /* ARMOUR.MAIL_LEATHER_RAT */, 6 /* ARMOUR.MAIL_TEXTILE */, 7 /* ARMOUR.MAIL_LEATHER_BALL */, 8 /* ARMOUR.MAIL_LEATHER_GRACI */, 9 /* ARMOUR.DRESS_MEAT_ELODINO */, 10 /* ARMOUR.PANTS_LEATHER_RAT */, 11 /* ARMOUR.PANTS_TEXTILE */, 12 /* ARMOUR.BOOTS_LEATHER_RAT */, 13 /* ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT */, 14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */, 15 /* ARMOUR.GAUNTLET_LEFT_LEATHER_RAT */, 16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */, 17 /* ARMOUR.SOCKS_TEXTILE */, 18 /* ARMOUR.PAULDRON_LEFT_BONE_RAT */, 19 /* ARMOUR.PAULDRON_LEFT_LEATHER_RAT */, 20 /* ARMOUR.PAULDRON_RIGHT_BONE_RAT */, 21 /* ARMOUR.ROBE_LEATHER_RAT */, 22 /* ARMOUR.BELT_TEXTILE */, 23 /* ARMOUR.SHIRT_TEXTILE */,];
ArmourConfiguration.ARMOUR_FROM_STRING = { "helmet-skull-rat": 0 /* ARMOUR.HELMET_SKULL_RAT */, "helmet-textile": 1 /* ARMOUR.HELMET_TEXTILE */, "helmet-leather-rat": 2 /* ARMOUR.HELMET_LEATHER_RAT */, "helmet-hair-graci": 3 /* ARMOUR.HELMET_HAIR_GRACI */, "mail-bone-rat": 4 /* ARMOUR.MAIL_BONE_RAT */, "mail-leather-rat": 5 /* ARMOUR.MAIL_LEATHER_RAT */, "mail-textile": 6 /* ARMOUR.MAIL_TEXTILE */, "mail-leather-ball": 7 /* ARMOUR.MAIL_LEATHER_BALL */, "mail-leather-graci": 8 /* ARMOUR.MAIL_LEATHER_GRACI */, "dress-meat-elodino": 9 /* ARMOUR.DRESS_MEAT_ELODINO */, "pants-leather-rat": 10 /* ARMOUR.PANTS_LEATHER_RAT */, "pants-textile": 11 /* ARMOUR.PANTS_TEXTILE */, "boots-leather-rat": 12 /* ARMOUR.BOOTS_LEATHER_RAT */, "gauntlet-right-leather-rat": 13 /* ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT */, "gauntlet-right-textile": 14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */, "gauntlet-left-leather-rat": 15 /* ARMOUR.GAUNTLET_LEFT_LEATHER_RAT */, "gauntlet-left-textile": 16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */, "socks-textile": 17 /* ARMOUR.SOCKS_TEXTILE */, "pauldron-left-bone-rat": 18 /* ARMOUR.PAULDRON_LEFT_BONE_RAT */, "pauldron-left-leather-rat": 19 /* ARMOUR.PAULDRON_LEFT_LEATHER_RAT */, "pauldron-right-bone-rat": 20 /* ARMOUR.PAULDRON_RIGHT_BONE_RAT */, "robe-leather-rat": 21 /* ARMOUR.ROBE_LEATHER_RAT */, "belt-textile": 22 /* ARMOUR.BELT_TEXTILE */, "shirt-textile": 23 /* ARMOUR.SHIRT_TEXTILE */ };
ArmourConfiguration.ARMOUR_TO_STRING = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone-rat", "mail-leather-rat", "mail-textile", "mail-leather-ball", "mail-leather-graci", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone-rat", "pauldron-left-leather-rat", "pauldron-right-bone-rat", "robe-leather-rat", "belt-textile", "shirt-textile",];
// ENUMS: 
ArmourConfiguration.ARMOUR_ARMOUR = [0 /* ARMOUR.HELMET_SKULL_RAT */, 1 /* ARMOUR.HELMET_TEXTILE */, 2 /* ARMOUR.HELMET_LEATHER_RAT */, 3 /* ARMOUR.HELMET_HAIR_GRACI */, 4 /* ARMOUR.MAIL_BONE_RAT */, 5 /* ARMOUR.MAIL_LEATHER_RAT */, 6 /* ARMOUR.MAIL_TEXTILE */, 7 /* ARMOUR.MAIL_LEATHER_BALL */, 8 /* ARMOUR.MAIL_LEATHER_GRACI */, 9 /* ARMOUR.DRESS_MEAT_ELODINO */, 10 /* ARMOUR.PANTS_LEATHER_RAT */, 11 /* ARMOUR.PANTS_TEXTILE */, 12 /* ARMOUR.BOOTS_LEATHER_RAT */, 13 /* ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT */, 14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */, 15 /* ARMOUR.GAUNTLET_LEFT_LEATHER_RAT */, 16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */, 17 /* ARMOUR.SOCKS_TEXTILE */, 18 /* ARMOUR.PAULDRON_LEFT_BONE_RAT */, 19 /* ARMOUR.PAULDRON_LEFT_LEATHER_RAT */, 20 /* ARMOUR.PAULDRON_RIGHT_BONE_RAT */, 21 /* ARMOUR.ROBE_LEATHER_RAT */, 22 /* ARMOUR.BELT_TEXTILE */, 23 /* ARMOUR.SHIRT_TEXTILE */,];
ArmourConfiguration.ARMOUR_ARMOUR_STRING = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone-rat", "mail-leather-rat", "mail-textile", "mail-leather-ball", "mail-leather-graci", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone-rat", "pauldron-left-leather-rat", "pauldron-right-bone-rat", "robe-leather-rat", "belt-textile", "shirt-textile",];
ArmourConfiguration.ARMOUR_MATERIAL = [7 /* MATERIAL.BONE_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 33 /* MATERIAL.HAIR_GRACI */, 7 /* MATERIAL.BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 17 /* MATERIAL.LEATHER_BALL */, 16 /* MATERIAL.LEATHER_GRACI */, 20 /* MATERIAL.MEAT_ELODINO */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 3 /* MATERIAL.TEXTILE */, 7 /* MATERIAL.BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 7 /* MATERIAL.BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 3 /* MATERIAL.TEXTILE */,];
ArmourConfiguration.ARMOUR_MATERIAL_STRING = ["bone-rat", "textile", "leather-rat", "hair-graci", "bone-rat", "leather-rat", "textile", "leather-ball", "leather-graci", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "bone-rat", "leather-rat", "bone-rat", "leather-rat", "textile", "textile",];
ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL = [10 /* MATERIAL.SKIN_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 33 /* MATERIAL.HAIR_GRACI */, 4 /* MATERIAL.SMALL_BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 17 /* MATERIAL.LEATHER_BALL */, 16 /* MATERIAL.LEATHER_GRACI */, 20 /* MATERIAL.MEAT_ELODINO */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 3 /* MATERIAL.TEXTILE */, 4 /* MATERIAL.SMALL_BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 4 /* MATERIAL.SMALL_BONE_RAT */, 14 /* MATERIAL.LEATHER_RAT */, 3 /* MATERIAL.TEXTILE */, 3 /* MATERIAL.TEXTILE */,];
ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL_STRING = ["skin-rat", "textile", "leather-rat", "hair-graci", "small-bone-rat", "leather-rat", "textile", "leather-ball", "leather-graci", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "small-bone-rat", "leather-rat", "small-bone-rat", "leather-rat", "textile", "textile",];
ArmourConfiguration.ARMOUR_SLOT = [9 /* EQUIP_SLOT.HELMET */, 9 /* EQUIP_SLOT.HELMET */, 9 /* EQUIP_SLOT.HELMET */, 9 /* EQUIP_SLOT.HELMET */, 3 /* EQUIP_SLOT.MAIL */, 3 /* EQUIP_SLOT.MAIL */, 3 /* EQUIP_SLOT.MAIL */, 3 /* EQUIP_SLOT.MAIL */, 3 /* EQUIP_SLOT.MAIL */, 14 /* EQUIP_SLOT.DRESS */, 13 /* EQUIP_SLOT.PANTS */, 13 /* EQUIP_SLOT.PANTS */, 8 /* EQUIP_SLOT.BOOTS */, 7 /* EQUIP_SLOT.GAUNTLET_RIGHT */, 7 /* EQUIP_SLOT.GAUNTLET_RIGHT */, 6 /* EQUIP_SLOT.GAUNTLET_LEFT */, 6 /* EQUIP_SLOT.GAUNTLET_LEFT */, 15 /* EQUIP_SLOT.SOCKS */, 4 /* EQUIP_SLOT.PAULDRON_LEFT */, 4 /* EQUIP_SLOT.PAULDRON_LEFT */, 5 /* EQUIP_SLOT.PAULDRON_RIGHT */, 11 /* EQUIP_SLOT.ROBE */, 10 /* EQUIP_SLOT.BELT */, 12 /* EQUIP_SLOT.SHIRT */,];
ArmourConfiguration.ARMOUR_SLOT_STRING = ["helmet", "helmet", "helmet", "helmet", "mail", "mail", "mail", "mail", "mail", "dress", "pants", "pants", "boots", "gauntlet-right", "gauntlet-right", "gauntlet-left", "gauntlet-left", "socks", "pauldron-left", "pauldron-left", "pauldron-right", "robe", "belt", "shirt",];
// Numbers: 
ArmourConfiguration.ARMOUR_MAGIC_POWER = [0, 0, 0, 3, 0, 0, 0, 1, 10, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
ArmourConfiguration.ARMOUR_THICKNESS = [2.0, 0.5, 1.0, 0.01, 2.0, 1.0, 0.5, 0.5, 1.0, 1.0, 4.0, 4.0, 2.0, 0.5, 0.2, 0.5, 0.2, 0.1, 2.0, 1.0, 2.0, 2.0, 0.5, 5.0,];
ArmourConfiguration.ARMOUR_SIZE = [3.0, 3.0, 3.0, 3.0, 10.0, 10.0, 10.0, 8.0, 8.0, 10.0, 6.0, 6.0, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.5, 2.5, 2.5, 15.0, 1.0, 2.0,];
ArmourConfiguration.ARMOUR_SECONDARY_SIZE = [0.0, 0.0, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,];
ArmourConfiguration.ARMOUR_CRAFTABLE = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
// Strings: 
ArmourConfiguration.ARMOUR_NAME = ["Rat skull", "Hat", "Hat", "Wig", "Mail", "Mail", "Mail", "Mail", "Mail", "Dress", "Pants", "Pants", "Boots", "Right Glove", "Right Glove", "Left Glove", "Left Glove", "Socks", "Left Bone Pauldron", "Left Pauldron", "Right Bone Pauldron", "Robe", "Belt", "Shirt",];
class SkillConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.SKILL;
    }
    static is_valid_string_id(id) {
        return id in this.SKILL_FROM_STRING;
    }
}
exports.SkillConfiguration = SkillConfiguration;
SkillConfiguration.SKILL = [0 /* SKILL.CLOTHIER */, 1 /* SKILL.WEAVING */, 2 /* SKILL.COOKING */, 3 /* SKILL.SKINNING */, 4 /* SKILL.WOODWORKING */, 5 /* SKILL.LEATHERWORKING */, 6 /* SKILL.CARPENTER */, 7 /* SKILL.BOWMAKING */, 8 /* SKILL.FLETCHING */, 9 /* SKILL.BONE_CARVING */, 10 /* SKILL.CORDWAINING */, 11 /* SKILL.SMITH */, 12 /* SKILL.TANNING */, 13 /* SKILL.HUNTING */, 14 /* SKILL.GATHERING */, 15 /* SKILL.FISHING */, 16 /* SKILL.WOODCUTTING */, 17 /* SKILL.TRAVELLING */, 18 /* SKILL.RANGED */, 19 /* SKILL.EVASION */, 20 /* SKILL.BLOCKING */, 21 /* SKILL.ONEHANDED */, 22 /* SKILL.TWOHANDED */, 23 /* SKILL.POLEARMS */, 24 /* SKILL.UNARMED */, 25 /* SKILL.FIGHTING */, 26 /* SKILL.MAGIC */, 27 /* SKILL.ALCHEMY */, 28 /* SKILL.ENCHANTING */, 29 /* SKILL.BATTLE_MAGIC */,];
SkillConfiguration.SKILL_FROM_STRING = { "clothier": 0 /* SKILL.CLOTHIER */, "weaving": 1 /* SKILL.WEAVING */, "cooking": 2 /* SKILL.COOKING */, "skinning": 3 /* SKILL.SKINNING */, "woodworking": 4 /* SKILL.WOODWORKING */, "leatherworking": 5 /* SKILL.LEATHERWORKING */, "carpenter": 6 /* SKILL.CARPENTER */, "bowmaking": 7 /* SKILL.BOWMAKING */, "fletching": 8 /* SKILL.FLETCHING */, "bone_carving": 9 /* SKILL.BONE_CARVING */, "cordwaining": 10 /* SKILL.CORDWAINING */, "smith": 11 /* SKILL.SMITH */, "tanning": 12 /* SKILL.TANNING */, "hunting": 13 /* SKILL.HUNTING */, "gathering": 14 /* SKILL.GATHERING */, "fishing": 15 /* SKILL.FISHING */, "woodcutting": 16 /* SKILL.WOODCUTTING */, "travelling": 17 /* SKILL.TRAVELLING */, "ranged": 18 /* SKILL.RANGED */, "evasion": 19 /* SKILL.EVASION */, "blocking": 20 /* SKILL.BLOCKING */, "onehanded": 21 /* SKILL.ONEHANDED */, "twohanded": 22 /* SKILL.TWOHANDED */, "polearms": 23 /* SKILL.POLEARMS */, "unarmed": 24 /* SKILL.UNARMED */, "fighting": 25 /* SKILL.FIGHTING */, "magic": 26 /* SKILL.MAGIC */, "alchemy": 27 /* SKILL.ALCHEMY */, "enchanting": 28 /* SKILL.ENCHANTING */, "battle_magic": 29 /* SKILL.BATTLE_MAGIC */ };
SkillConfiguration.SKILL_TO_STRING = ["clothier", "weaving", "cooking", "skinning", "woodworking", "leatherworking", "carpenter", "bowmaking", "fletching", "bone_carving", "cordwaining", "smith", "tanning", "hunting", "gathering", "fishing", "woodcutting", "travelling", "ranged", "evasion", "blocking", "onehanded", "twohanded", "polearms", "unarmed", "fighting", "magic", "alchemy", "enchanting", "battle_magic",];
// ENUMS: 
SkillConfiguration.SKILL_SKILL = [0 /* SKILL.CLOTHIER */, 1 /* SKILL.WEAVING */, 2 /* SKILL.COOKING */, 3 /* SKILL.SKINNING */, 4 /* SKILL.WOODWORKING */, 5 /* SKILL.LEATHERWORKING */, 6 /* SKILL.CARPENTER */, 7 /* SKILL.BOWMAKING */, 8 /* SKILL.FLETCHING */, 9 /* SKILL.BONE_CARVING */, 10 /* SKILL.CORDWAINING */, 11 /* SKILL.SMITH */, 12 /* SKILL.TANNING */, 13 /* SKILL.HUNTING */, 14 /* SKILL.GATHERING */, 15 /* SKILL.FISHING */, 16 /* SKILL.WOODCUTTING */, 17 /* SKILL.TRAVELLING */, 18 /* SKILL.RANGED */, 19 /* SKILL.EVASION */, 20 /* SKILL.BLOCKING */, 21 /* SKILL.ONEHANDED */, 22 /* SKILL.TWOHANDED */, 23 /* SKILL.POLEARMS */, 24 /* SKILL.UNARMED */, 25 /* SKILL.FIGHTING */, 26 /* SKILL.MAGIC */, 27 /* SKILL.ALCHEMY */, 28 /* SKILL.ENCHANTING */, 29 /* SKILL.BATTLE_MAGIC */,];
SkillConfiguration.SKILL_SKILL_STRING = ["clothier", "weaving", "cooking", "skinning", "woodworking", "leatherworking", "carpenter", "bowmaking", "fletching", "bone_carving", "cordwaining", "smith", "tanning", "hunting", "gathering", "fishing", "woodcutting", "travelling", "ranged", "evasion", "blocking", "onehanded", "twohanded", "polearms", "unarmed", "fighting", "magic", "alchemy", "enchanting", "battle_magic",];
// Numbers: 
SkillConfiguration.SKILL_FIGHTING = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,];
SkillConfiguration.SKILL_CRAFTING = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
SkillConfiguration.SKILL_STRENGTH_BONUS = [1.0, 1.0, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 3.0, 1.0, 3.0, 2.0, 2.0, 5.0, 5.0, 1.0, 2.0, 3.0, 5.0, 5.0, 5.0, 5.0, 8.0, 0.0, 0.0, 0.0, 1.0,];
SkillConfiguration.SKILL_MAGIC_BONUS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 2, 4, 10,];
// Strings: 
SkillConfiguration.SKILL_NAME = ["Clothier", "Weaving", "Cooking", "Skinning", "Woodworking", "Leatherworking", "Carpentry", "Bowmaking", "Fletching", "Bone carving", "Cordwaining", "Smithing", "Tanning", "Hunting", "Gathering", "Fishing", "Woodcutting", "Travelling", "Sniping", "Evading", "Blocking", "One handed weapons", "Two handed weapons", "Polearms", "Unarmed", "Fighting", "Magic", "Alchemy", "Enchanting", "Battle magic",];
class PerkConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    }
    static get ones_record() {
        return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
    }
    static is_valid_id(id) {
        return id in this.PERK;
    }
    static is_valid_string_id(id) {
        return id in this.PERK_FROM_STRING;
    }
}
exports.PerkConfiguration = PerkConfiguration;
PerkConfiguration.PERK = [0 /* PERK.PRO_BUTCHER */, 1 /* PERK.PRO_COOK */, 2 /* PERK.PRO_BONEWORK */, 3 /* PERK.PRO_FLETCHER */, 4 /* PERK.PRO_LEATHERWORK */, 5 /* PERK.PRO_TANNING */, 6 /* PERK.PRO_CORDWAINER */, 7 /* PERK.PRO_FIGHTER_UNARMED */, 8 /* PERK.PRO_FIGHTER_POLEARMS */, 9 /* PERK.PRO_FIGHTER_ONEHAND */, 10 /* PERK.PRO_FIGHTER_TWOHAND */, 11 /* PERK.MAGIC_INITIATION */, 12 /* PERK.PRO_ALCHEMIST */, 13 /* PERK.MAGIC_BLOOD */, 14 /* PERK.MAGIC_BOLT */, 15 /* PERK.MAGIC_BLINK */, 16 /* PERK.BATTLE_DODGE */, 17 /* PERK.BATTLE_CHARGE */,];
PerkConfiguration.PERK_FROM_STRING = { "pro_butcher": 0 /* PERK.PRO_BUTCHER */, "pro_cook": 1 /* PERK.PRO_COOK */, "pro_bonework": 2 /* PERK.PRO_BONEWORK */, "pro_fletcher": 3 /* PERK.PRO_FLETCHER */, "pro_leatherwork": 4 /* PERK.PRO_LEATHERWORK */, "pro_tanning": 5 /* PERK.PRO_TANNING */, "pro_cordwainer": 6 /* PERK.PRO_CORDWAINER */, "pro_fighter_unarmed": 7 /* PERK.PRO_FIGHTER_UNARMED */, "pro_fighter_polearms": 8 /* PERK.PRO_FIGHTER_POLEARMS */, "pro_fighter_onehand": 9 /* PERK.PRO_FIGHTER_ONEHAND */, "pro_fighter_twohand": 10 /* PERK.PRO_FIGHTER_TWOHAND */, "magic_initiation": 11 /* PERK.MAGIC_INITIATION */, "pro_alchemist": 12 /* PERK.PRO_ALCHEMIST */, "magic_blood": 13 /* PERK.MAGIC_BLOOD */, "magic_bolt": 14 /* PERK.MAGIC_BOLT */, "magic_blink": 15 /* PERK.MAGIC_BLINK */, "battle_dodge": 16 /* PERK.BATTLE_DODGE */, "battle_charge": 17 /* PERK.BATTLE_CHARGE */ };
PerkConfiguration.PERK_TO_STRING = ["pro_butcher", "pro_cook", "pro_bonework", "pro_fletcher", "pro_leatherwork", "pro_tanning", "pro_cordwainer", "pro_fighter_unarmed", "pro_fighter_polearms", "pro_fighter_onehand", "pro_fighter_twohand", "magic_initiation", "pro_alchemist", "magic_blood", "magic_bolt", "magic_blink", "battle_dodge", "battle_charge",];
// ENUMS: 
PerkConfiguration.PERK_PERK = [0 /* PERK.PRO_BUTCHER */, 1 /* PERK.PRO_COOK */, 2 /* PERK.PRO_BONEWORK */, 3 /* PERK.PRO_FLETCHER */, 4 /* PERK.PRO_LEATHERWORK */, 5 /* PERK.PRO_TANNING */, 6 /* PERK.PRO_CORDWAINER */, 7 /* PERK.PRO_FIGHTER_UNARMED */, 8 /* PERK.PRO_FIGHTER_POLEARMS */, 9 /* PERK.PRO_FIGHTER_ONEHAND */, 10 /* PERK.PRO_FIGHTER_TWOHAND */, 11 /* PERK.MAGIC_INITIATION */, 12 /* PERK.PRO_ALCHEMIST */, 13 /* PERK.MAGIC_BLOOD */, 14 /* PERK.MAGIC_BOLT */, 15 /* PERK.MAGIC_BLINK */, 16 /* PERK.BATTLE_DODGE */, 17 /* PERK.BATTLE_CHARGE */,];
PerkConfiguration.PERK_PERK_STRING = ["pro_butcher", "pro_cook", "pro_bonework", "pro_fletcher", "pro_leatherwork", "pro_tanning", "pro_cordwainer", "pro_fighter_unarmed", "pro_fighter_polearms", "pro_fighter_onehand", "pro_fighter_twohand", "magic_initiation", "pro_alchemist", "magic_blood", "magic_bolt", "magic_blink", "battle_dodge", "battle_charge",];
// Numbers: 
PerkConfiguration.PERK_BASE_PRICE = [500, 500, 1000, 500, 1000, 500, 750, 300, 300, 300, 300, 1500, 2000, 500, 1000, 1500, 250, 250,];
PerkConfiguration.PERK_STRENGTH_BONUS = [1.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 5.0, 2.0, 2.0, 4.0, 0.0, 0.0, 0.5, 0.0, 0.0, 1.0, 1.0,];
PerkConfiguration.PERK_MAGIC_BONUS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 1, 2, 2, 2, 0, 0,];
// Strings: 
PerkConfiguration.PERK_NAME = ["Butcher", "Cook", "Bonecarver", "Fletcher", "Leatherworker", "Tanner", "Cordwainer", "Wrestler", "Spearman", "Fighter(onehand)", "Fighter(twohand)", "Initiated mage", "Alchemist", "Blood mage", "Magic bolt", "Magic blink", "Dodge", "Charge",];
class MaterialInstance {
    constructor(id) {
        if (!(id in MaterialConfiguration.MATERIAL)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return MaterialConfiguration.MATERIAL_MATERIAL_STRING[this._id];
    }
    get category() {
        return MaterialConfiguration.MATERIAL_CATEGORY[this._id];
    }
    get category_string() {
        return MaterialConfiguration.MATERIAL_CATEGORY_STRING[this._id];
    }
    get cutting_power() {
        return MaterialConfiguration.MATERIAL_CUTTING_POWER[this._id];
    }
    get density() {
        return MaterialConfiguration.MATERIAL_DENSITY[this._id];
    }
    get cutting_protection() {
        return MaterialConfiguration.MATERIAL_CUTTING_PROTECTION[this._id];
    }
    get blunt_protection() {
        return MaterialConfiguration.MATERIAL_BLUNT_PROTECTION[this._id];
    }
    get penentration_protection() {
        return MaterialConfiguration.MATERIAL_PENENTRATION_PROTECTION[this._id];
    }
    get magic_power() {
        return MaterialConfiguration.MATERIAL_MAGIC_POWER[this._id];
    }
    get unit_size() {
        return MaterialConfiguration.MATERIAL_UNIT_SIZE[this._id];
    }
    get name() {
        return MaterialConfiguration.MATERIAL_NAME[this._id];
    }
}
class MaterialCategoryInstance {
    constructor(id) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return MaterialCategoryConfiguration.MATERIAL_CATEGORY_CATEGORY_STRING[this._id];
    }
    get name() {
        return MaterialCategoryConfiguration.MATERIAL_CATEGORY_NAME[this._id];
    }
}
class EquipSlotInstance {
    constructor(id) {
        if (!(id in EquipSlotConfiguration.SLOT)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return EquipSlotConfiguration.EQUIP_SLOT_SLOT_STRING[this._id];
    }
    get name() {
        return EquipSlotConfiguration.EQUIP_SLOT_NAME[this._id];
    }
}
class ImpactInstance {
    constructor(id) {
        if (!(id in ImpactConfiguration.IMPACT)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return ImpactConfiguration.IMPACT_TYPE_IMPACT_STRING[this._id];
    }
    get handle_ratio() {
        return ImpactConfiguration.IMPACT_TYPE_HANDLE_RATIO[this._id];
    }
    get blunt() {
        return ImpactConfiguration.IMPACT_TYPE_BLUNT[this._id];
    }
    get pierce() {
        return ImpactConfiguration.IMPACT_TYPE_PIERCE[this._id];
    }
    get slice() {
        return ImpactConfiguration.IMPACT_TYPE_SLICE[this._id];
    }
    get name() {
        return ImpactConfiguration.IMPACT_TYPE_NAME[this._id];
    }
}
class WeaponInstance {
    constructor(id) {
        if (!(id in WeaponConfiguration.WEAPON)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return WeaponConfiguration.WEAPON_WEAPON_STRING[this._id];
    }
    get material() {
        return WeaponConfiguration.WEAPON_MATERIAL[this._id];
    }
    get material_string() {
        return WeaponConfiguration.WEAPON_MATERIAL_STRING[this._id];
    }
    get secondary_material() {
        return WeaponConfiguration.WEAPON_SECONDARY_MATERIAL[this._id];
    }
    get secondary_material_string() {
        return WeaponConfiguration.WEAPON_SECONDARY_MATERIAL_STRING[this._id];
    }
    get impact() {
        return WeaponConfiguration.WEAPON_IMPACT[this._id];
    }
    get impact_string() {
        return WeaponConfiguration.WEAPON_IMPACT_STRING[this._id];
    }
    get magic_power() {
        return WeaponConfiguration.WEAPON_MAGIC_POWER[this._id];
    }
    get size() {
        return WeaponConfiguration.WEAPON_SIZE[this._id];
    }
    get length() {
        return WeaponConfiguration.WEAPON_LENGTH[this._id];
    }
    get craftable() {
        return WeaponConfiguration.WEAPON_CRAFTABLE[this._id];
    }
    get bow_power() {
        return WeaponConfiguration.WEAPON_BOW_POWER[this._id];
    }
    get name() {
        return WeaponConfiguration.WEAPON_NAME[this._id];
    }
}
class ArmourInstance {
    constructor(id) {
        if (!(id in ArmourConfiguration.ARMOUR)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return ArmourConfiguration.ARMOUR_ARMOUR_STRING[this._id];
    }
    get material() {
        return ArmourConfiguration.ARMOUR_MATERIAL[this._id];
    }
    get material_string() {
        return ArmourConfiguration.ARMOUR_MATERIAL_STRING[this._id];
    }
    get secondary_material() {
        return ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL[this._id];
    }
    get secondary_material_string() {
        return ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL_STRING[this._id];
    }
    get slot() {
        return ArmourConfiguration.ARMOUR_SLOT[this._id];
    }
    get slot_string() {
        return ArmourConfiguration.ARMOUR_SLOT_STRING[this._id];
    }
    get magic_power() {
        return ArmourConfiguration.ARMOUR_MAGIC_POWER[this._id];
    }
    get thickness() {
        return ArmourConfiguration.ARMOUR_THICKNESS[this._id];
    }
    get size() {
        return ArmourConfiguration.ARMOUR_SIZE[this._id];
    }
    get secondary_size() {
        return ArmourConfiguration.ARMOUR_SECONDARY_SIZE[this._id];
    }
    get craftable() {
        return ArmourConfiguration.ARMOUR_CRAFTABLE[this._id];
    }
    get name() {
        return ArmourConfiguration.ARMOUR_NAME[this._id];
    }
}
class SkillInstance {
    constructor(id) {
        if (!(id in SkillConfiguration.SKILL)) {
            throw new Error(`Invalid Skill id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return SkillConfiguration.SKILL_SKILL_STRING[this._id];
    }
    get fighting() {
        return SkillConfiguration.SKILL_FIGHTING[this._id];
    }
    get crafting() {
        return SkillConfiguration.SKILL_CRAFTING[this._id];
    }
    get strength_bonus() {
        return SkillConfiguration.SKILL_STRENGTH_BONUS[this._id];
    }
    get magic_bonus() {
        return SkillConfiguration.SKILL_MAGIC_BONUS[this._id];
    }
    get name() {
        return SkillConfiguration.SKILL_NAME[this._id];
    }
}
class PerkInstance {
    constructor(id) {
        if (!(id in PerkConfiguration.PERK)) {
            throw new Error(`Invalid Perk id: ${id}`);
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get id_string() {
        return PerkConfiguration.PERK_PERK_STRING[this._id];
    }
    get base_price() {
        return PerkConfiguration.PERK_BASE_PRICE[this._id];
    }
    get strength_bonus() {
        return PerkConfiguration.PERK_STRENGTH_BONUS[this._id];
    }
    get magic_bonus() {
        return PerkConfiguration.PERK_MAGIC_BONUS[this._id];
    }
    get name() {
        return PerkConfiguration.PERK_NAME[this._id];
    }
}
class MaterialStorage {
    // Retrieve instance of MaterialInstance 
    static get(id) {
        if (!(id in MaterialStorage.instances)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return MaterialStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in MaterialConfiguration.MATERIAL_FROM_STRING)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return MaterialStorage.instances[MaterialConfiguration.MATERIAL_FROM_STRING[id]];
    }
}
exports.MaterialStorage = MaterialStorage;
MaterialStorage.instances = [new MaterialInstance(0 /* MATERIAL.ARROW_BONE */), new MaterialInstance(1 /* MATERIAL.ARROW_ZAZ */), new MaterialInstance(2 /* MATERIAL.COTTON */), new MaterialInstance(3 /* MATERIAL.TEXTILE */), new MaterialInstance(4 /* MATERIAL.SMALL_BONE_RAT */), new MaterialInstance(5 /* MATERIAL.SMALL_BONE_HUMAN */), new MaterialInstance(6 /* MATERIAL.SMALL_BONE_GRACI */), new MaterialInstance(7 /* MATERIAL.BONE_RAT */), new MaterialInstance(8 /* MATERIAL.BONE_HUMAN */), new MaterialInstance(9 /* MATERIAL.BONE_GRACI */), new MaterialInstance(10 /* MATERIAL.SKIN_RAT */), new MaterialInstance(11 /* MATERIAL.SKIN_HUMAN */), new MaterialInstance(12 /* MATERIAL.SKIN_GRACI */), new MaterialInstance(13 /* MATERIAL.SKIN_BALL */), new MaterialInstance(14 /* MATERIAL.LEATHER_RAT */), new MaterialInstance(15 /* MATERIAL.LEATHER_HUMAN */), new MaterialInstance(16 /* MATERIAL.LEATHER_GRACI */), new MaterialInstance(17 /* MATERIAL.LEATHER_BALL */), new MaterialInstance(18 /* MATERIAL.MEAT_RAT */), new MaterialInstance(19 /* MATERIAL.MEAT_RAT_FRIED */), new MaterialInstance(20 /* MATERIAL.MEAT_ELODINO */), new MaterialInstance(21 /* MATERIAL.MEAT_BALL */), new MaterialInstance(22 /* MATERIAL.MEAT_HUMAN */), new MaterialInstance(23 /* MATERIAL.MEAT_GRACI */), new MaterialInstance(24 /* MATERIAL.MEAT_HUMAN_FRIED */), new MaterialInstance(25 /* MATERIAL.MEAT_GRACI_FRIED */), new MaterialInstance(26 /* MATERIAL.FISH_OKU */), new MaterialInstance(27 /* MATERIAL.FISH_OKU_FRIED */), new MaterialInstance(28 /* MATERIAL.BERRY_FIE */), new MaterialInstance(29 /* MATERIAL.BERRY_ZAZ */), new MaterialInstance(30 /* MATERIAL.ZAZ */), new MaterialInstance(31 /* MATERIAL.WOOD_RED */), new MaterialInstance(32 /* MATERIAL.WOOD_RED_PLATE */), new MaterialInstance(33 /* MATERIAL.HAIR_GRACI */), new MaterialInstance(34 /* MATERIAL.STEEL */)];
class MaterialCategoryStorage {
    // Retrieve instance of MaterialCategoryInstance 
    static get(id) {
        if (!(id in MaterialCategoryStorage.instances)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return MaterialCategoryStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY_FROM_STRING)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return MaterialCategoryStorage.instances[MaterialCategoryConfiguration.CATEGORY_FROM_STRING[id]];
    }
}
exports.MaterialCategoryStorage = MaterialCategoryStorage;
MaterialCategoryStorage.instances = [new MaterialCategoryInstance(0 /* MATERIAL_CATEGORY.BOW_AMMO */), new MaterialCategoryInstance(1 /* MATERIAL_CATEGORY.PLANT */), new MaterialCategoryInstance(2 /* MATERIAL_CATEGORY.MATERIAL */), new MaterialCategoryInstance(3 /* MATERIAL_CATEGORY.BONE */), new MaterialCategoryInstance(4 /* MATERIAL_CATEGORY.SKIN */), new MaterialCategoryInstance(5 /* MATERIAL_CATEGORY.LEATHER */), new MaterialCategoryInstance(6 /* MATERIAL_CATEGORY.MEAT */), new MaterialCategoryInstance(7 /* MATERIAL_CATEGORY.FISH */), new MaterialCategoryInstance(8 /* MATERIAL_CATEGORY.FOOD */), new MaterialCategoryInstance(9 /* MATERIAL_CATEGORY.FRUIT */), new MaterialCategoryInstance(10 /* MATERIAL_CATEGORY.WOOD */), new MaterialCategoryInstance(11 /* MATERIAL_CATEGORY.TEXTILE */), new MaterialCategoryInstance(12 /* MATERIAL_CATEGORY.METAL */)];
class EquipSlotStorage {
    // Retrieve instance of EquipSlotInstance 
    static get(id) {
        if (!(id in EquipSlotStorage.instances)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return EquipSlotStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in EquipSlotConfiguration.SLOT_FROM_STRING)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return EquipSlotStorage.instances[EquipSlotConfiguration.SLOT_FROM_STRING[id]];
    }
}
exports.EquipSlotStorage = EquipSlotStorage;
EquipSlotStorage.instances = [new EquipSlotInstance(0 /* EQUIP_SLOT.WEAPON */), new EquipSlotInstance(1 /* EQUIP_SLOT.SECONDARY */), new EquipSlotInstance(2 /* EQUIP_SLOT.AMULET */), new EquipSlotInstance(3 /* EQUIP_SLOT.MAIL */), new EquipSlotInstance(4 /* EQUIP_SLOT.PAULDRON_LEFT */), new EquipSlotInstance(5 /* EQUIP_SLOT.PAULDRON_RIGHT */), new EquipSlotInstance(6 /* EQUIP_SLOT.GAUNTLET_LEFT */), new EquipSlotInstance(7 /* EQUIP_SLOT.GAUNTLET_RIGHT */), new EquipSlotInstance(8 /* EQUIP_SLOT.BOOTS */), new EquipSlotInstance(9 /* EQUIP_SLOT.HELMET */), new EquipSlotInstance(10 /* EQUIP_SLOT.BELT */), new EquipSlotInstance(11 /* EQUIP_SLOT.ROBE */), new EquipSlotInstance(12 /* EQUIP_SLOT.SHIRT */), new EquipSlotInstance(13 /* EQUIP_SLOT.PANTS */), new EquipSlotInstance(14 /* EQUIP_SLOT.DRESS */), new EquipSlotInstance(15 /* EQUIP_SLOT.SOCKS */), new EquipSlotInstance(16 /* EQUIP_SLOT.NONE */)];
class ImpactStorage {
    // Retrieve instance of ImpactInstance 
    static get(id) {
        if (!(id in ImpactStorage.instances)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return ImpactStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in ImpactConfiguration.IMPACT_FROM_STRING)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return ImpactStorage.instances[ImpactConfiguration.IMPACT_FROM_STRING[id]];
    }
}
exports.ImpactStorage = ImpactStorage;
ImpactStorage.instances = [new ImpactInstance(0 /* IMPACT_TYPE.POINT */), new ImpactInstance(1 /* IMPACT_TYPE.BLADE */), new ImpactInstance(2 /* IMPACT_TYPE.BLUNT */), new ImpactInstance(3 /* IMPACT_TYPE.NONE */)];
class WeaponStorage {
    // Retrieve instance of WeaponInstance 
    static get(id) {
        if (!(id in WeaponStorage.instances)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return WeaponStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in WeaponConfiguration.WEAPON_FROM_STRING)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return WeaponStorage.instances[WeaponConfiguration.WEAPON_FROM_STRING[id]];
    }
}
exports.WeaponStorage = WeaponStorage;
WeaponStorage.instances = [new WeaponInstance(0 /* WEAPON.BOW_WOOD */), new WeaponInstance(1 /* WEAPON.SPEAR_WOOD_RED */), new WeaponInstance(2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */), new WeaponInstance(3 /* WEAPON.DAGGER_BONE_RAT */), new WeaponInstance(4 /* WEAPON.SWORD_STEEL */), new WeaponInstance(5 /* WEAPON.MACE_WOOD_RED */)];
class ArmourStorage {
    // Retrieve instance of ArmourInstance 
    static get(id) {
        if (!(id in ArmourStorage.instances)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return ArmourStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in ArmourConfiguration.ARMOUR_FROM_STRING)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return ArmourStorage.instances[ArmourConfiguration.ARMOUR_FROM_STRING[id]];
    }
}
exports.ArmourStorage = ArmourStorage;
ArmourStorage.instances = [new ArmourInstance(0 /* ARMOUR.HELMET_SKULL_RAT */), new ArmourInstance(1 /* ARMOUR.HELMET_TEXTILE */), new ArmourInstance(2 /* ARMOUR.HELMET_LEATHER_RAT */), new ArmourInstance(3 /* ARMOUR.HELMET_HAIR_GRACI */), new ArmourInstance(4 /* ARMOUR.MAIL_BONE_RAT */), new ArmourInstance(5 /* ARMOUR.MAIL_LEATHER_RAT */), new ArmourInstance(6 /* ARMOUR.MAIL_TEXTILE */), new ArmourInstance(7 /* ARMOUR.MAIL_LEATHER_BALL */), new ArmourInstance(8 /* ARMOUR.MAIL_LEATHER_GRACI */), new ArmourInstance(9 /* ARMOUR.DRESS_MEAT_ELODINO */), new ArmourInstance(10 /* ARMOUR.PANTS_LEATHER_RAT */), new ArmourInstance(11 /* ARMOUR.PANTS_TEXTILE */), new ArmourInstance(12 /* ARMOUR.BOOTS_LEATHER_RAT */), new ArmourInstance(13 /* ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT */), new ArmourInstance(14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */), new ArmourInstance(15 /* ARMOUR.GAUNTLET_LEFT_LEATHER_RAT */), new ArmourInstance(16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */), new ArmourInstance(17 /* ARMOUR.SOCKS_TEXTILE */), new ArmourInstance(18 /* ARMOUR.PAULDRON_LEFT_BONE_RAT */), new ArmourInstance(19 /* ARMOUR.PAULDRON_LEFT_LEATHER_RAT */), new ArmourInstance(20 /* ARMOUR.PAULDRON_RIGHT_BONE_RAT */), new ArmourInstance(21 /* ARMOUR.ROBE_LEATHER_RAT */), new ArmourInstance(22 /* ARMOUR.BELT_TEXTILE */), new ArmourInstance(23 /* ARMOUR.SHIRT_TEXTILE */)];
class SkillStorage {
    // Retrieve instance of SkillInstance 
    static get(id) {
        if (!(id in SkillStorage.instances)) {
            throw new Error(`Invalid Skill id: ${id}`);
        }
        return SkillStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in SkillConfiguration.SKILL_FROM_STRING)) {
            throw new Error(`Invalid Skill id: ${id}`);
        }
        return SkillStorage.instances[SkillConfiguration.SKILL_FROM_STRING[id]];
    }
}
exports.SkillStorage = SkillStorage;
SkillStorage.instances = [new SkillInstance(0 /* SKILL.CLOTHIER */), new SkillInstance(1 /* SKILL.WEAVING */), new SkillInstance(2 /* SKILL.COOKING */), new SkillInstance(3 /* SKILL.SKINNING */), new SkillInstance(4 /* SKILL.WOODWORKING */), new SkillInstance(5 /* SKILL.LEATHERWORKING */), new SkillInstance(6 /* SKILL.CARPENTER */), new SkillInstance(7 /* SKILL.BOWMAKING */), new SkillInstance(8 /* SKILL.FLETCHING */), new SkillInstance(9 /* SKILL.BONE_CARVING */), new SkillInstance(10 /* SKILL.CORDWAINING */), new SkillInstance(11 /* SKILL.SMITH */), new SkillInstance(12 /* SKILL.TANNING */), new SkillInstance(13 /* SKILL.HUNTING */), new SkillInstance(14 /* SKILL.GATHERING */), new SkillInstance(15 /* SKILL.FISHING */), new SkillInstance(16 /* SKILL.WOODCUTTING */), new SkillInstance(17 /* SKILL.TRAVELLING */), new SkillInstance(18 /* SKILL.RANGED */), new SkillInstance(19 /* SKILL.EVASION */), new SkillInstance(20 /* SKILL.BLOCKING */), new SkillInstance(21 /* SKILL.ONEHANDED */), new SkillInstance(22 /* SKILL.TWOHANDED */), new SkillInstance(23 /* SKILL.POLEARMS */), new SkillInstance(24 /* SKILL.UNARMED */), new SkillInstance(25 /* SKILL.FIGHTING */), new SkillInstance(26 /* SKILL.MAGIC */), new SkillInstance(27 /* SKILL.ALCHEMY */), new SkillInstance(28 /* SKILL.ENCHANTING */), new SkillInstance(29 /* SKILL.BATTLE_MAGIC */)];
class PerkStorage {
    // Retrieve instance of PerkInstance 
    static get(id) {
        if (!(id in PerkStorage.instances)) {
            throw new Error(`Invalid Perk id: ${id}`);
        }
        return PerkStorage.instances[id];
    }
    static from_string(id) {
        if (!(id in PerkConfiguration.PERK_FROM_STRING)) {
            throw new Error(`Invalid Perk id: ${id}`);
        }
        return PerkStorage.instances[PerkConfiguration.PERK_FROM_STRING[id]];
    }
}
exports.PerkStorage = PerkStorage;
PerkStorage.instances = [new PerkInstance(0 /* PERK.PRO_BUTCHER */), new PerkInstance(1 /* PERK.PRO_COOK */), new PerkInstance(2 /* PERK.PRO_BONEWORK */), new PerkInstance(3 /* PERK.PRO_FLETCHER */), new PerkInstance(4 /* PERK.PRO_LEATHERWORK */), new PerkInstance(5 /* PERK.PRO_TANNING */), new PerkInstance(6 /* PERK.PRO_CORDWAINER */), new PerkInstance(7 /* PERK.PRO_FIGHTER_UNARMED */), new PerkInstance(8 /* PERK.PRO_FIGHTER_POLEARMS */), new PerkInstance(9 /* PERK.PRO_FIGHTER_ONEHAND */), new PerkInstance(10 /* PERK.PRO_FIGHTER_TWOHAND */), new PerkInstance(11 /* PERK.MAGIC_INITIATION */), new PerkInstance(12 /* PERK.PRO_ALCHEMIST */), new PerkInstance(13 /* PERK.MAGIC_BLOOD */), new PerkInstance(14 /* PERK.MAGIC_BOLT */), new PerkInstance(15 /* PERK.MAGIC_BLINK */), new PerkInstance(16 /* PERK.BATTLE_DODGE */), new PerkInstance(17 /* PERK.BATTLE_CHARGE */)];
