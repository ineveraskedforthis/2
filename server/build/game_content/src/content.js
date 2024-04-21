"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmourStorage = exports.WeaponStorage = exports.ImpactStorage = exports.EquipSlotStorage = exports.MaterialCategoryStorage = exports.MaterialStorage = exports.ArmourConfiguration = exports.WeaponConfiguration = exports.ImpactConfiguration = exports.EquipSlotConfiguration = exports.MaterialCategoryConfiguration = exports.MaterialConfiguration = void 0;
class MaterialConfiguration {
    static get zero_record() {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
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
MaterialConfiguration.MATERIAL_CUTTING_POWER = [2.0, 4.0, 0.0, 0.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 1.0, 1.0, 20.0, 5.0,];
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
WeaponConfiguration.WEAPON_SECONDARY_MATERIAL = [31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */, 7 /* MATERIAL.BONE_RAT */, 31 /* MATERIAL.WOOD_RED */, 31 /* MATERIAL.WOOD_RED */,];
WeaponConfiguration.WEAPON_SECONDARY_MATERIAL_STRING = ["wood-red", "wood-red", "wood-red", "bone-rat", "wood-red", "wood-red",];
WeaponConfiguration.WEAPON_IMPACT = [2 /* IMPACT_TYPE.BLUNT */, 0 /* IMPACT_TYPE.POINT */, 0 /* IMPACT_TYPE.POINT */, 0 /* IMPACT_TYPE.POINT */, 1 /* IMPACT_TYPE.BLADE */, 2 /* IMPACT_TYPE.BLUNT */,];
WeaponConfiguration.WEAPON_IMPACT_STRING = ["blunt", "point", "point", "point", "blade", "blunt",];
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
ArmourConfiguration.ARMOUR_THICKNESS = [2.0, 0.5, 1.0, 0.1, 2.0, 1.0, 0.5, 0.5, 1.0, 1.0, 4.0, 4.0, 2.0, 0.5, 0.2, 0.5, 0.2, 0.1, 2.0, 1.0, 2.0, 2.0, 0.5, 5.0,];
ArmourConfiguration.ARMOUR_SIZE = [3.0, 3.0, 3.0, 3.0, 10.0, 10.0, 10.0, 8.0, 8.0, 10.0, 6.0, 6.0, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.5, 2.5, 2.5, 15.0, 1.0, 2.0,];
ArmourConfiguration.ARMOUR_SECONDARY_SIZE = [0.0, 0.0, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,];
ArmourConfiguration.ARMOUR_CRAFTABLE = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,];
// Strings: 
ArmourConfiguration.ARMOUR_NAME = ["Rat skull", "Hat", "Hat", "Wig", "Mail", "Mail", "Mail", "Mail", "Mail", "Dress", "Pants", "Pants", "Boots", "Right Glove", "Right Glove", "Left Glove", "Left Glove", "Socks", "Left Bone Pauldron", "Left Pauldron", "Right Bone Pauldron", "Robe", "Belt", "Shirt",];
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
class MaterialStorage {
    // Retrieve instance of MaterialInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in MaterialConfiguration.MATERIAL_FROM_STRING)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return this.instances[MaterialConfiguration.MATERIAL_FROM_STRING[id]];
    }
}
exports.MaterialStorage = MaterialStorage;
MaterialStorage.instances = [new MaterialInstance(0 /* MATERIAL.ARROW_BONE */), new MaterialInstance(1 /* MATERIAL.ARROW_ZAZ */), new MaterialInstance(2 /* MATERIAL.COTTON */), new MaterialInstance(3 /* MATERIAL.TEXTILE */), new MaterialInstance(4 /* MATERIAL.SMALL_BONE_RAT */), new MaterialInstance(5 /* MATERIAL.SMALL_BONE_HUMAN */), new MaterialInstance(6 /* MATERIAL.SMALL_BONE_GRACI */), new MaterialInstance(7 /* MATERIAL.BONE_RAT */), new MaterialInstance(8 /* MATERIAL.BONE_HUMAN */), new MaterialInstance(9 /* MATERIAL.BONE_GRACI */), new MaterialInstance(10 /* MATERIAL.SKIN_RAT */), new MaterialInstance(11 /* MATERIAL.SKIN_HUMAN */), new MaterialInstance(12 /* MATERIAL.SKIN_GRACI */), new MaterialInstance(13 /* MATERIAL.SKIN_BALL */), new MaterialInstance(14 /* MATERIAL.LEATHER_RAT */), new MaterialInstance(15 /* MATERIAL.LEATHER_HUMAN */), new MaterialInstance(16 /* MATERIAL.LEATHER_GRACI */), new MaterialInstance(17 /* MATERIAL.LEATHER_BALL */), new MaterialInstance(18 /* MATERIAL.MEAT_RAT */), new MaterialInstance(19 /* MATERIAL.MEAT_RAT_FRIED */), new MaterialInstance(20 /* MATERIAL.MEAT_ELODINO */), new MaterialInstance(21 /* MATERIAL.MEAT_BALL */), new MaterialInstance(22 /* MATERIAL.MEAT_HUMAN */), new MaterialInstance(23 /* MATERIAL.MEAT_GRACI */), new MaterialInstance(24 /* MATERIAL.MEAT_HUMAN_FRIED */), new MaterialInstance(25 /* MATERIAL.MEAT_GRACI_FRIED */), new MaterialInstance(26 /* MATERIAL.FISH_OKU */), new MaterialInstance(27 /* MATERIAL.FISH_OKU_FRIED */), new MaterialInstance(28 /* MATERIAL.BERRY_FIE */), new MaterialInstance(29 /* MATERIAL.BERRY_ZAZ */), new MaterialInstance(30 /* MATERIAL.ZAZ */), new MaterialInstance(31 /* MATERIAL.WOOD_RED */), new MaterialInstance(32 /* MATERIAL.WOOD_RED_PLATE */), new MaterialInstance(33 /* MATERIAL.HAIR_GRACI */), new MaterialInstance(34 /* MATERIAL.STEEL */)];
class MaterialCategoryStorage {
    // Retrieve instance of MaterialCategoryInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY_FROM_STRING)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return this.instances[MaterialCategoryConfiguration.CATEGORY_FROM_STRING[id]];
    }
}
exports.MaterialCategoryStorage = MaterialCategoryStorage;
MaterialCategoryStorage.instances = [new MaterialCategoryInstance(0 /* MATERIAL_CATEGORY.BOW_AMMO */), new MaterialCategoryInstance(1 /* MATERIAL_CATEGORY.PLANT */), new MaterialCategoryInstance(2 /* MATERIAL_CATEGORY.MATERIAL */), new MaterialCategoryInstance(3 /* MATERIAL_CATEGORY.BONE */), new MaterialCategoryInstance(4 /* MATERIAL_CATEGORY.SKIN */), new MaterialCategoryInstance(5 /* MATERIAL_CATEGORY.LEATHER */), new MaterialCategoryInstance(6 /* MATERIAL_CATEGORY.MEAT */), new MaterialCategoryInstance(7 /* MATERIAL_CATEGORY.FISH */), new MaterialCategoryInstance(8 /* MATERIAL_CATEGORY.FOOD */), new MaterialCategoryInstance(9 /* MATERIAL_CATEGORY.FRUIT */), new MaterialCategoryInstance(10 /* MATERIAL_CATEGORY.WOOD */), new MaterialCategoryInstance(11 /* MATERIAL_CATEGORY.TEXTILE */), new MaterialCategoryInstance(12 /* MATERIAL_CATEGORY.METAL */)];
class EquipSlotStorage {
    // Retrieve instance of EquipSlotInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in EquipSlotConfiguration.SLOT_FROM_STRING)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return this.instances[EquipSlotConfiguration.SLOT_FROM_STRING[id]];
    }
}
exports.EquipSlotStorage = EquipSlotStorage;
EquipSlotStorage.instances = [new EquipSlotInstance(0 /* EQUIP_SLOT.WEAPON */), new EquipSlotInstance(1 /* EQUIP_SLOT.SECONDARY */), new EquipSlotInstance(2 /* EQUIP_SLOT.AMULET */), new EquipSlotInstance(3 /* EQUIP_SLOT.MAIL */), new EquipSlotInstance(4 /* EQUIP_SLOT.PAULDRON_LEFT */), new EquipSlotInstance(5 /* EQUIP_SLOT.PAULDRON_RIGHT */), new EquipSlotInstance(6 /* EQUIP_SLOT.GAUNTLET_LEFT */), new EquipSlotInstance(7 /* EQUIP_SLOT.GAUNTLET_RIGHT */), new EquipSlotInstance(8 /* EQUIP_SLOT.BOOTS */), new EquipSlotInstance(9 /* EQUIP_SLOT.HELMET */), new EquipSlotInstance(10 /* EQUIP_SLOT.BELT */), new EquipSlotInstance(11 /* EQUIP_SLOT.ROBE */), new EquipSlotInstance(12 /* EQUIP_SLOT.SHIRT */), new EquipSlotInstance(13 /* EQUIP_SLOT.PANTS */), new EquipSlotInstance(14 /* EQUIP_SLOT.DRESS */), new EquipSlotInstance(15 /* EQUIP_SLOT.SOCKS */), new EquipSlotInstance(16 /* EQUIP_SLOT.NONE */)];
class ImpactStorage {
    // Retrieve instance of ImpactInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in ImpactConfiguration.IMPACT_FROM_STRING)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return this.instances[ImpactConfiguration.IMPACT_FROM_STRING[id]];
    }
}
exports.ImpactStorage = ImpactStorage;
ImpactStorage.instances = [new ImpactInstance(0 /* IMPACT_TYPE.POINT */), new ImpactInstance(1 /* IMPACT_TYPE.BLADE */), new ImpactInstance(2 /* IMPACT_TYPE.BLUNT */), new ImpactInstance(3 /* IMPACT_TYPE.NONE */)];
class WeaponStorage {
    // Retrieve instance of WeaponInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in WeaponConfiguration.WEAPON_FROM_STRING)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return this.instances[WeaponConfiguration.WEAPON_FROM_STRING[id]];
    }
}
exports.WeaponStorage = WeaponStorage;
WeaponStorage.instances = [new WeaponInstance(0 /* WEAPON.BOW_WOOD */), new WeaponInstance(1 /* WEAPON.SPEAR_WOOD_RED */), new WeaponInstance(2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */), new WeaponInstance(3 /* WEAPON.DAGGER_BONE_RAT */), new WeaponInstance(4 /* WEAPON.SWORD_STEEL */), new WeaponInstance(5 /* WEAPON.MACE_WOOD_RED */)];
class ArmourStorage {
    // Retrieve instance of ArmourInstance 
    static get(id) {
        if (!(id in this.instances)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return this.instances[id];
    }
    static from_string(id) {
        if (!(id in ArmourConfiguration.ARMOUR_FROM_STRING)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return this.instances[ArmourConfiguration.ARMOUR_FROM_STRING[id]];
    }
}
exports.ArmourStorage = ArmourStorage;
ArmourStorage.instances = [new ArmourInstance(0 /* ARMOUR.HELMET_SKULL_RAT */), new ArmourInstance(1 /* ARMOUR.HELMET_TEXTILE */), new ArmourInstance(2 /* ARMOUR.HELMET_LEATHER_RAT */), new ArmourInstance(3 /* ARMOUR.HELMET_HAIR_GRACI */), new ArmourInstance(4 /* ARMOUR.MAIL_BONE_RAT */), new ArmourInstance(5 /* ARMOUR.MAIL_LEATHER_RAT */), new ArmourInstance(6 /* ARMOUR.MAIL_TEXTILE */), new ArmourInstance(7 /* ARMOUR.MAIL_LEATHER_BALL */), new ArmourInstance(8 /* ARMOUR.MAIL_LEATHER_GRACI */), new ArmourInstance(9 /* ARMOUR.DRESS_MEAT_ELODINO */), new ArmourInstance(10 /* ARMOUR.PANTS_LEATHER_RAT */), new ArmourInstance(11 /* ARMOUR.PANTS_TEXTILE */), new ArmourInstance(12 /* ARMOUR.BOOTS_LEATHER_RAT */), new ArmourInstance(13 /* ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT */), new ArmourInstance(14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */), new ArmourInstance(15 /* ARMOUR.GAUNTLET_LEFT_LEATHER_RAT */), new ArmourInstance(16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */), new ArmourInstance(17 /* ARMOUR.SOCKS_TEXTILE */), new ArmourInstance(18 /* ARMOUR.PAULDRON_LEFT_BONE_RAT */), new ArmourInstance(19 /* ARMOUR.PAULDRON_LEFT_LEATHER_RAT */), new ArmourInstance(20 /* ARMOUR.PAULDRON_RIGHT_BONE_RAT */), new ArmourInstance(21 /* ARMOUR.ROBE_LEATHER_RAT */), new ArmourInstance(22 /* ARMOUR.BELT_TEXTILE */), new ArmourInstance(23 /* ARMOUR.SHIRT_TEXTILE */)];
