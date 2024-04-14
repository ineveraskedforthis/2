export const enum MATERIAL {
    ARROW_BONE,
    ARROW_ZAZ,
    COTTON,
    TEXTILE,
    SMALL_BONE_RAT,
    SMALL_BONE_HUMAN,
    SMALL_BONE_GRACI,
    BONE_RAT,
    BONE_HUMAN,
    BONE_GRACI,
    SKIN_RAT,
    SKIN_HUMAN,
    SKIN_GRACI,
    SKIN_BALL,
    LEATHER_RAT,
    LEATHER_HUMAN,
    LEATHER_GRACI,
    LEATHER_BALL,
    MEAT_RAT,
    MEAT_RAT_FRIED,
    MEAT_ELODINO,
    MEAT_BALL,
    MEAT_HUMAN,
    MEAT_HUMAN_FRIED,
    MEAT_GRACI,
    MEAT_GRACI_FRIED,
    BERRY_FIE,
    BERRY_ZAZ,
    ZAZ,
    WOOD_RED,
    WOOD_RED_PLATE,
    HAIR_GRACI,
    STEEL,
}

export const enum MATERIAL_CATEGORY {
    BOW_AMMO,
    PLANT,
    MATERIAL,
    BONE,
    SKIN,
    MEAT,
    FISH,
    FOOD,
    FRUIT,
    WOOD,
}

export const enum EQUIP_SLOT {
    WEAPON,
    SECONDARY,
    AMULET,
    MAIL,
    PAULDRON_LEFT,
    PAULDRON_RIGHT,
    GAUNTLET_LEFT,
    GAUNTLET_RIGHT,
    BOOTS,
    HELMET,
    BELT,
    ROBE,
    SHIRT,
    PANTS,
    DRESS,
    SOCKS,
}

export const enum IMPACT_TYPE {
    POINT,
    BLADE,
    BLUNT,
}

export const enum WEAPON {
    BOW_WOOD,
    SPEAR_WOOD,
    SPEAR_WOOD_BONE,
    DAGGER_BONE_RAT,
    SWORD_STEEL,
    MACE_WOOD,
}

export const enum ARMOUR {
    HELMET_SKULL_RAT,
    HELMET_TEXTILE,
    HELMET_LEATHER_RAT,
    HELMET_HAIR_GRACI,
    MAIL_BONE,
    MAIL_LEATHER_RAT,
    MAIL_TEXTILE,
    DRESS_MEAT_ELODINO,
    PANTS_LEATHER_RAT,
    PANTS_TEXTILE,
    BOOTS_LEATHER_RAT,
    GAUNTLET_RIGHT_LEATHER_RAT,
    GAUNTLET_RIGHT_TEXTILE,
    GAUNTLET_LEFT_LEATHER_RAT,
    GAUNTLET_LEFT_TEXTILE,
    SOCKS_TEXTILE,
    PAULDRON_LEFT_BONE,
    PAULDRON_LEFT_LEATHER_RAT,
    PAULDRON_RIGHT_BONE,
    ROBE_LEATHER_RAT,
    BELT_TEXTILE,
    SHIRT_TEXTILE,
}

export interface MaterialData {
    readonly id : MATERIAL
    readonly category : MATERIAL_CATEGORY
    readonly cutting_power : number
    readonly density : number
    readonly cutting_protection : number
    readonly blunt_protection : number
    readonly penentration_protection : number
    readonly magic_power : number
    readonly name : string
}


export interface MaterialCategoryData {
    readonly id : MATERIAL_CATEGORY
    readonly name : string
}


export interface EquipSlotData {
    readonly id : EQUIP_SLOT
    readonly name : string
}


export interface ImpactTypeData {
    readonly id : IMPACT_TYPE
    readonly name : string
}


export interface WeaponData {
    readonly id : WEAPON
    readonly material : MATERIAL
    readonly secondary_material : MATERIAL
    readonly impact : IMPACT_TYPE
    readonly power : number
    readonly size : number
    readonly length : number
    readonly craftable : number
    readonly name : string
}


export interface ArmourData {
    readonly id : ARMOUR
    readonly material : MATERIAL
    readonly secondary_material : MATERIAL
    readonly slot : EQUIP_SLOT
    readonly magic_power : number
    readonly thickness : number
    readonly size : number
    readonly secondary_size : number
    readonly craftable : number
    readonly name : string
}


export class MaterialConfiguration {
    static MATERIAL : MATERIAL[] = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIAL_FROM_STRING : Record<string, MATERIAL> = { "arrow-bone": MATERIAL.ARROW_BONE, "arrow-zaz": MATERIAL.ARROW_ZAZ, "cotton": MATERIAL.COTTON, "textile": MATERIAL.TEXTILE, "small-bone-rat": MATERIAL.SMALL_BONE_RAT, "small-bone-human": MATERIAL.SMALL_BONE_HUMAN, "small-bone-graci": MATERIAL.SMALL_BONE_GRACI, "bone-rat": MATERIAL.BONE_RAT, "bone-human": MATERIAL.BONE_HUMAN, "bone-graci": MATERIAL.BONE_GRACI, "skin-rat": MATERIAL.SKIN_RAT, "skin-human": MATERIAL.SKIN_HUMAN, "skin-graci": MATERIAL.SKIN_GRACI, "skin-ball": MATERIAL.SKIN_BALL, "leather-rat": MATERIAL.LEATHER_RAT, "leather-human": MATERIAL.LEATHER_HUMAN, "leather-graci": MATERIAL.LEATHER_GRACI, "leather-ball": MATERIAL.LEATHER_BALL, "meat-rat": MATERIAL.MEAT_RAT, "meat-rat-fried": MATERIAL.MEAT_RAT_FRIED, "meat-elodino": MATERIAL.MEAT_ELODINO, "meat-ball": MATERIAL.MEAT_BALL, "meat-human": MATERIAL.MEAT_HUMAN, "meat-human-fried": MATERIAL.MEAT_HUMAN_FRIED, "meat-graci": MATERIAL.MEAT_GRACI, "meat-graci-fried": MATERIAL.MEAT_GRACI_FRIED, "berry-fie": MATERIAL.BERRY_FIE, "berry-zaz": MATERIAL.BERRY_ZAZ, "zaz": MATERIAL.ZAZ, "wood-red": MATERIAL.WOOD_RED, "wood-red-plate": MATERIAL.WOOD_RED_PLATE, "hair-graci": MATERIAL.HAIR_GRACI, "steel": MATERIAL.STEEL }
    static MATERIAL_TO_STRING : Record<MATERIAL, string> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-human-fried", "meat-graci", "meat-graci-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]

    // ENUMS:

    static MATERIAL_MATERIAL : Record<MATERIAL, MATERIAL> = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIAL_MATERIAL_STRING : Record<MATERIAL, string> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-human-fried", "meat-graci", "meat-graci-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]
    static MATERIAL_CATEGORY : Record<MATERIAL, MATERIAL_CATEGORY> = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.WOOD, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, ]
    static MATERIAL_CATEGORY_STRING : Record<MATERIAL, string> = ["bow-ammo", "bow-ammo", "plant", "material", "bone", "bone", "bone", "bone", "bone", "bone", "skin", "skin", "skin", "skin", "material", "material", "material", "material", "meat", "food", "meat", "food", "meat", "food", "meat", "meat", "fruit", "fruit", "material", "wood", "material", "material", "material", ]

    // Numbers:

    static MATERIAL_CUTTING_POWER : Record<MATERIAL, number> = [1.0, 2.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.5, 0.5, 10.0, 2.5, ]
    static MATERIAL_DENSITY : Record<MATERIAL, number> = [0.2, 0.2, 0.1, 1.0, 0.5, 0.6, 0.2, 0.5, 0.6, 0.2, 1.5, 1.2, 1.1, 0.8, 3.0, 2.4, 2.2, 1.6, 0.4, 0.6, 0.1, 0.1, 0.5, 0.7, 0.2, 0.2, 0.2, 0.3, 10.0, 1.0, 2.0, 10.0, 8.0, ]
    static MATERIAL_CUTTING_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 5.0, 5.0, 10.0, 0.9, 0.8, 0.7, 0.5, 2.0, 1.5, 1.0, 0.5, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 1.0, 2.0, 10.0, 10.0, ]
    static MATERIAL_BLUNT_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 10.0, ]
    static MATERIAL_PENENTRATION_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 0.75, 0.25, 0.0, 0.0, 1.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 2.5, 5.0, 10.0, 10.0, ]
    static MATERIAL_MAGIC_POWER : Record<MATERIAL, number> = [0.0, 1.0, 0.1, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 2.0, 4.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 4.0, 2.0, 0.0, 0.1, 1.0, 0.1, 0.1, 5.0, 0.0, ]

    // Strings:

    static MATERIAL_NAME : Record<MATERIAL, string> = ["Bone arrow", "Zaz arrow", "Cotton", "Textile", "Bone(rat, small)", "Bone(human, small)", "Bone(graci, small)", "Bone(rat)", "Bone(human)", "Bone(graci)", "Skin(rat)", "Skin(human)", "Skin(graci)", "Skin(meat ball)", "Leather(rat)", "Leather(human)", "Leather(graci)", "Leather(meat ball)", "Meat(rat)", "Fried meat(rat)", "Meat(elodino)", "Meat(meat ball)", "Meat(human)", "Fried meat(human)", "Meat(graci)", "Fried meat(graci)", "Fieberry", "Zazberry", "Zaz", "Wood(raw)", "Wood(plates)", "Hair(graci)", "Steel", ]
}

export class MaterialCategoryConfiguration {
    static CATEGORY : MATERIAL_CATEGORY[] = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FISH, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, ]
    static CATEGORY_FROM_STRING : Record<string, MATERIAL_CATEGORY> = { "bow-ammo": MATERIAL_CATEGORY.BOW_AMMO, "plant": MATERIAL_CATEGORY.PLANT, "material": MATERIAL_CATEGORY.MATERIAL, "bone": MATERIAL_CATEGORY.BONE, "skin": MATERIAL_CATEGORY.SKIN, "meat": MATERIAL_CATEGORY.MEAT, "fish": MATERIAL_CATEGORY.FISH, "food": MATERIAL_CATEGORY.FOOD, "fruit": MATERIAL_CATEGORY.FRUIT, "wood": MATERIAL_CATEGORY.WOOD }
    static CATEGORY_TO_STRING : Record<MATERIAL_CATEGORY, string> = ["bow-ammo", "plant", "material", "bone", "skin", "meat", "fish", "food", "fruit", "wood", ]

    // ENUMS:

    static MATERIAL_CATEGORY_CATEGORY : Record<MATERIAL_CATEGORY, MATERIAL_CATEGORY> = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FISH, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, ]
    static MATERIAL_CATEGORY_CATEGORY_STRING : Record<MATERIAL_CATEGORY, string> = ["bow-ammo", "plant", "material", "bone", "skin", "meat", "fish", "food", "fruit", "wood", ]

    // Numbers:


    // Strings:

    static MATERIAL_CATEGORY_NAME : Record<MATERIAL_CATEGORY, string> = ["Ammo(bow)", "Plant", "Material", "Bone", "Skin", "Meat", "Fish", "Food", "Fruit", "Wood", ]
}

export class EquipSlotConfiguration {
    static SLOT : EQUIP_SLOT[] = [EQUIP_SLOT.WEAPON, EQUIP_SLOT.SECONDARY, EQUIP_SLOT.AMULET, EQUIP_SLOT.MAIL, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.BOOTS, EQUIP_SLOT.HELMET, EQUIP_SLOT.BELT, EQUIP_SLOT.ROBE, EQUIP_SLOT.SHIRT, EQUIP_SLOT.PANTS, EQUIP_SLOT.DRESS, EQUIP_SLOT.SOCKS, ]
    static SLOT_FROM_STRING : Record<string, EQUIP_SLOT> = { "weapon": EQUIP_SLOT.WEAPON, "secondary": EQUIP_SLOT.SECONDARY, "amulet": EQUIP_SLOT.AMULET, "mail": EQUIP_SLOT.MAIL, "pauldron-left": EQUIP_SLOT.PAULDRON_LEFT, "pauldron-right": EQUIP_SLOT.PAULDRON_RIGHT, "gauntlet-left": EQUIP_SLOT.GAUNTLET_LEFT, "gauntlet-right": EQUIP_SLOT.GAUNTLET_RIGHT, "boots": EQUIP_SLOT.BOOTS, "helmet": EQUIP_SLOT.HELMET, "belt": EQUIP_SLOT.BELT, "robe": EQUIP_SLOT.ROBE, "shirt": EQUIP_SLOT.SHIRT, "pants": EQUIP_SLOT.PANTS, "dress": EQUIP_SLOT.DRESS, "socks": EQUIP_SLOT.SOCKS }
    static SLOT_TO_STRING : Record<EQUIP_SLOT, string> = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", ]

    // ENUMS:

    static EQUIP_SLOT_SLOT : Record<EQUIP_SLOT, EQUIP_SLOT> = [EQUIP_SLOT.WEAPON, EQUIP_SLOT.SECONDARY, EQUIP_SLOT.AMULET, EQUIP_SLOT.MAIL, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.BOOTS, EQUIP_SLOT.HELMET, EQUIP_SLOT.BELT, EQUIP_SLOT.ROBE, EQUIP_SLOT.SHIRT, EQUIP_SLOT.PANTS, EQUIP_SLOT.DRESS, EQUIP_SLOT.SOCKS, ]
    static EQUIP_SLOT_SLOT_STRING : Record<EQUIP_SLOT, string> = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", ]

    // Numbers:


    // Strings:

    static EQUIP_SLOT_NAME : Record<EQUIP_SLOT, string> = ["Weapon", "Secondary", "Amulet", "Chestpiece", "Left pauldron", "Right pauldron", "Left gauntlet", "Right gauntlet", "Boots", "Helmet", "Belt", "Robe", "Shirt", "Pants", "Dress", "Socks", ]
}

export class ImpactTypeConfiguration {
    static IMPACT : IMPACT_TYPE[] = [IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, ]
    static IMPACT_FROM_STRING : Record<string, IMPACT_TYPE> = { "point": IMPACT_TYPE.POINT, "blade": IMPACT_TYPE.BLADE, "blunt": IMPACT_TYPE.BLUNT }
    static IMPACT_TO_STRING : Record<IMPACT_TYPE, string> = ["point", "blade", "blunt", ]

    // ENUMS:

    static IMPACT_TYPE_IMPACT : Record<IMPACT_TYPE, IMPACT_TYPE> = [IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, ]
    static IMPACT_TYPE_IMPACT_STRING : Record<IMPACT_TYPE, string> = ["point", "blade", "blunt", ]

    // Numbers:


    // Strings:

    static IMPACT_TYPE_NAME : Record<IMPACT_TYPE, string> = ["Point", "Blade", "Blunt", ]
}

export class WeaponConfiguration {
    static WEAPON : WEAPON[] = [WEAPON.BOW_WOOD, WEAPON.SPEAR_WOOD, WEAPON.SPEAR_WOOD_BONE, WEAPON.DAGGER_BONE_RAT, WEAPON.SWORD_STEEL, WEAPON.MACE_WOOD, ]
    static WEAPON_FROM_STRING : Record<string, WEAPON> = { "bow-wood": WEAPON.BOW_WOOD, "spear-wood": WEAPON.SPEAR_WOOD, "spear-wood-bone": WEAPON.SPEAR_WOOD_BONE, "dagger-bone-rat": WEAPON.DAGGER_BONE_RAT, "sword-steel": WEAPON.SWORD_STEEL, "mace-wood": WEAPON.MACE_WOOD }
    static WEAPON_TO_STRING : Record<WEAPON, string> = ["bow-wood", "spear-wood", "spear-wood-bone", "dagger-bone-rat", "sword-steel", "mace-wood", ]

    // ENUMS:

    static WEAPON_WEAPON : Record<WEAPON, WEAPON> = [WEAPON.BOW_WOOD, WEAPON.SPEAR_WOOD, WEAPON.SPEAR_WOOD_BONE, WEAPON.DAGGER_BONE_RAT, WEAPON.SWORD_STEEL, WEAPON.MACE_WOOD, ]
    static WEAPON_WEAPON_STRING : Record<WEAPON, string> = ["bow-wood", "spear-wood", "spear-wood-bone", "dagger-bone-rat", "sword-steel", "mace-wood", ]
    static WEAPON_MATERIAL : Record<WEAPON, MATERIAL> = [MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.SMALL_BONE_RAT, MATERIAL.BONE_RAT, MATERIAL.STEEL, MATERIAL.WOOD_RED, ]
    static WEAPON_MATERIAL_STRING : Record<WEAPON, string> = ["wood-red", "wood-red", "small-bone-rat", "bone-rat", "steel", "wood-red", ]
    static WEAPON_SECONDARY_MATERIAL : Record<WEAPON, MATERIAL> = [MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.BONE_RAT, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, ]
    static WEAPON_SECONDARY_MATERIAL_STRING : Record<WEAPON, string> = ["wood-red", "wood-red", "wood-red", "bone-rat", "wood-red", "wood-red", ]
    static WEAPON_IMPACT : Record<WEAPON, IMPACT_TYPE> = [IMPACT_TYPE.BLUNT, IMPACT_TYPE.POINT, IMPACT_TYPE.POINT, IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, ]
    static WEAPON_IMPACT_STRING : Record<WEAPON, string> = ["blunt", "point", "point", "point", "blade", "blunt", ]

    // Numbers:

    static WEAPON_POWER : Record<WEAPON, number> = [0, 0, 0, 0, 0, 0, ]
    static WEAPON_SIZE : Record<WEAPON, number> = [0.75, 1.5, 1.5, 0.5, 1.0, 3.0, ]
    static WEAPON_LENGTH : Record<WEAPON, number> = [1.0, 3.0, 3.0, 0.5, 1.0, 1.0, ]
    static WEAPON_CRAFTABLE : Record<WEAPON, number> = [1, 1, 1, 1, 1, 1, ]

    // Strings:

    static WEAPON_NAME : Record<WEAPON, string> = ["Bow", "Spear", "Spear", "Dagger", "Sword", "Mace", ]
}

export class ArmourConfiguration {
    static ARMOUR : ARMOUR[] = [ARMOUR.HELMET_SKULL_RAT, ARMOUR.HELMET_TEXTILE, ARMOUR.HELMET_LEATHER_RAT, ARMOUR.HELMET_HAIR_GRACI, ARMOUR.MAIL_BONE, ARMOUR.MAIL_LEATHER_RAT, ARMOUR.MAIL_TEXTILE, ARMOUR.DRESS_MEAT_ELODINO, ARMOUR.PANTS_LEATHER_RAT, ARMOUR.PANTS_TEXTILE, ARMOUR.BOOTS_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_TEXTILE, ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, ARMOUR.GAUNTLET_LEFT_TEXTILE, ARMOUR.SOCKS_TEXTILE, ARMOUR.PAULDRON_LEFT_BONE, ARMOUR.PAULDRON_LEFT_LEATHER_RAT, ARMOUR.PAULDRON_RIGHT_BONE, ARMOUR.ROBE_LEATHER_RAT, ARMOUR.BELT_TEXTILE, ARMOUR.SHIRT_TEXTILE, ]
    static ARMOUR_FROM_STRING : Record<string, ARMOUR> = { "helmet-skull-rat": ARMOUR.HELMET_SKULL_RAT, "helmet-textile": ARMOUR.HELMET_TEXTILE, "helmet-leather-rat": ARMOUR.HELMET_LEATHER_RAT, "helmet-hair-graci": ARMOUR.HELMET_HAIR_GRACI, "mail-bone": ARMOUR.MAIL_BONE, "mail-leather-rat": ARMOUR.MAIL_LEATHER_RAT, "mail-textile": ARMOUR.MAIL_TEXTILE, "dress-meat-elodino": ARMOUR.DRESS_MEAT_ELODINO, "pants-leather-rat": ARMOUR.PANTS_LEATHER_RAT, "pants-textile": ARMOUR.PANTS_TEXTILE, "boots-leather-rat": ARMOUR.BOOTS_LEATHER_RAT, "gauntlet-right-leather-rat": ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, "gauntlet-right-textile": ARMOUR.GAUNTLET_RIGHT_TEXTILE, "gauntlet-left-leather-rat": ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, "gauntlet-left-textile": ARMOUR.GAUNTLET_LEFT_TEXTILE, "socks-textile": ARMOUR.SOCKS_TEXTILE, "pauldron-left-bone": ARMOUR.PAULDRON_LEFT_BONE, "pauldron-left-leather-rat": ARMOUR.PAULDRON_LEFT_LEATHER_RAT, "pauldron-right-bone": ARMOUR.PAULDRON_RIGHT_BONE, "robe-leather-rat": ARMOUR.ROBE_LEATHER_RAT, "belt-textile": ARMOUR.BELT_TEXTILE, "shirt-textile": ARMOUR.SHIRT_TEXTILE }
    static ARMOUR_TO_STRING : Record<ARMOUR, string> = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone", "mail-leather-rat", "mail-textile", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone", "pauldron-left-leather-rat", "pauldron-right-bone", "robe-leather-rat", "belt-textile", "shirt-textile", ]

    // ENUMS:

    static ARMOUR_ARMOUR : Record<ARMOUR, ARMOUR> = [ARMOUR.HELMET_SKULL_RAT, ARMOUR.HELMET_TEXTILE, ARMOUR.HELMET_LEATHER_RAT, ARMOUR.HELMET_HAIR_GRACI, ARMOUR.MAIL_BONE, ARMOUR.MAIL_LEATHER_RAT, ARMOUR.MAIL_TEXTILE, ARMOUR.DRESS_MEAT_ELODINO, ARMOUR.PANTS_LEATHER_RAT, ARMOUR.PANTS_TEXTILE, ARMOUR.BOOTS_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_TEXTILE, ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, ARMOUR.GAUNTLET_LEFT_TEXTILE, ARMOUR.SOCKS_TEXTILE, ARMOUR.PAULDRON_LEFT_BONE, ARMOUR.PAULDRON_LEFT_LEATHER_RAT, ARMOUR.PAULDRON_RIGHT_BONE, ARMOUR.ROBE_LEATHER_RAT, ARMOUR.BELT_TEXTILE, ARMOUR.SHIRT_TEXTILE, ]
    static ARMOUR_ARMOUR_STRING : Record<ARMOUR, string> = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone", "mail-leather-rat", "mail-textile", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone", "pauldron-left-leather-rat", "pauldron-right-bone", "robe-leather-rat", "belt-textile", "shirt-textile", ]
    static ARMOUR_MATERIAL : Record<ARMOUR, MATERIAL> = [MATERIAL.BONE_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.HAIR_GRACI, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.MEAT_ELODINO, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, ]
    static ARMOUR_MATERIAL_STRING : Record<ARMOUR, string> = ["bone-rat", "textile", "leather-rat", "hair-graci", "bone-rat", "leather-rat", "textile", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "bone-rat", "leather-rat", "bone-rat", "leather-rat", "textile", "textile", ]
    static ARMOUR_SECONDARY_MATERIAL : Record<ARMOUR, MATERIAL> = [MATERIAL.SKIN_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.HAIR_GRACI, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.MEAT_ELODINO, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, ]
    static ARMOUR_SECONDARY_MATERIAL_STRING : Record<ARMOUR, string> = ["skin-rat", "textile", "leather-rat", "hair-graci", "small-bone-rat", "leather-rat", "textile", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "small-bone-rat", "leather-rat", "small-bone-rat", "leather-rat", "textile", "textile", ]
    static ARMOUR_SLOT : Record<ARMOUR, EQUIP_SLOT> = [EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.DRESS, EQUIP_SLOT.PANTS, EQUIP_SLOT.PANTS, EQUIP_SLOT.BOOTS, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.SOCKS, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.ROBE, EQUIP_SLOT.BELT, EQUIP_SLOT.SHIRT, ]
    static ARMOUR_SLOT_STRING : Record<ARMOUR, string> = ["helmet", "helmet", "helmet", "helmet", "mail", "mail", "mail", "dress", "pants", "pants", "boots", "gauntlet-right", "gauntlet-right", "gauntlet-left", "gauntlet-left", "socks", "pauldron-left", "pauldron-left", "pauldron-right", "robe", "belt", "shirt", ]

    // Numbers:

    static ARMOUR_MAGIC_POWER : Record<ARMOUR, number> = [0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    static ARMOUR_THICKNESS : Record<ARMOUR, number> = [2, 0,5, 1, 0,1, 2, 1, 0,5, 1, 4, 4, 2, 0,5, 0,2, 0,5, 0,2, 0,1, 2, 1, 2, 2, 0,5, 5, ]
    static ARMOUR_SIZE : Record<ARMOUR, number> = [1, 1, 1, 1, 3, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, ]
    static ARMOUR_SECONDARY_SIZE : Record<ARMOUR, number> = [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    static ARMOUR_CRAFTABLE : Record<ARMOUR, number> = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ]

    // Strings:

    static ARMOUR_NAME : Record<ARMOUR, string> = ["Rat skull", "Hat", "Hat", "Wig", "Mail", "Mail", "Mail", "Dress", "Pants", "Pants", "Boots", "Left Glove", "Right Glove", "Left Glove", "Right Glove", "Socks", "Left Pauldron", "Left Pauldron", "Right Pauldron", "Robe", "Belt", "Shirt", ]
}


export class Material implements MaterialData {
    private _id: MATERIAL
    constructor(id: MATERIAL) {
        if (!(id in MaterialConfiguration.MATERIAL)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in MaterialConfiguration.MATERIAL_FROM_STRING)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return new Material(MaterialConfiguration.MATERIAL_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return MaterialConfiguration.MATERIAL_MATERIAL_STRING[this._id]
    }
    get category() {
        return MaterialConfiguration.MATERIAL_CATEGORY[this._id]
    }
    get category_string() {
        return MaterialConfiguration.MATERIAL_CATEGORY_STRING[this._id]
    }
    get cutting_power() {
        return MaterialConfiguration.MATERIAL_CUTTING_POWER[this._id]
    }
    get density() {
        return MaterialConfiguration.MATERIAL_DENSITY[this._id]
    }
    get cutting_protection() {
        return MaterialConfiguration.MATERIAL_CUTTING_PROTECTION[this._id]
    }
    get blunt_protection() {
        return MaterialConfiguration.MATERIAL_BLUNT_PROTECTION[this._id]
    }
    get penentration_protection() {
        return MaterialConfiguration.MATERIAL_PENENTRATION_PROTECTION[this._id]
    }
    get magic_power() {
        return MaterialConfiguration.MATERIAL_MAGIC_POWER[this._id]
    }
    get name() {
        return MaterialConfiguration.MATERIAL_NAME[this._id]
    }
}


export class MaterialCategory implements MaterialCategoryData {
    private _id: MATERIAL_CATEGORY
    constructor(id: MATERIAL_CATEGORY) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY_FROM_STRING)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return new MaterialCategory(MaterialCategoryConfiguration.CATEGORY_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return MaterialCategoryConfiguration.MATERIAL_CATEGORY_CATEGORY_STRING[this._id]
    }
    get name() {
        return MaterialCategoryConfiguration.MATERIAL_CATEGORY_NAME[this._id]
    }
}


export class EquipSlot implements EquipSlotData {
    private _id: EQUIP_SLOT
    constructor(id: EQUIP_SLOT) {
        if (!(id in EquipSlotConfiguration.SLOT)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in EquipSlotConfiguration.SLOT_FROM_STRING)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return new EquipSlot(EquipSlotConfiguration.SLOT_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return EquipSlotConfiguration.EQUIP_SLOT_SLOT_STRING[this._id]
    }
    get name() {
        return EquipSlotConfiguration.EQUIP_SLOT_NAME[this._id]
    }
}


export class ImpactType implements ImpactTypeData {
    private _id: IMPACT_TYPE
    constructor(id: IMPACT_TYPE) {
        if (!(id in ImpactTypeConfiguration.IMPACT)) {
            throw new Error(`Invalid ImpactType id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in ImpactTypeConfiguration.IMPACT_FROM_STRING)) {
            throw new Error(`Invalid ImpactType id: ${id}`);
        }
        return new ImpactType(ImpactTypeConfiguration.IMPACT_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return ImpactTypeConfiguration.IMPACT_TYPE_IMPACT_STRING[this._id]
    }
    get name() {
        return ImpactTypeConfiguration.IMPACT_TYPE_NAME[this._id]
    }
}


export class Weapon implements WeaponData {
    private _id: WEAPON
    constructor(id: WEAPON) {
        if (!(id in WeaponConfiguration.WEAPON)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in WeaponConfiguration.WEAPON_FROM_STRING)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return new Weapon(WeaponConfiguration.WEAPON_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return WeaponConfiguration.WEAPON_WEAPON_STRING[this._id]
    }
    get material() {
        return WeaponConfiguration.WEAPON_MATERIAL[this._id]
    }
    get material_string() {
        return WeaponConfiguration.WEAPON_MATERIAL_STRING[this._id]
    }
    get secondary_material() {
        return WeaponConfiguration.WEAPON_SECONDARY_MATERIAL[this._id]
    }
    get secondary_material_string() {
        return WeaponConfiguration.WEAPON_SECONDARY_MATERIAL_STRING[this._id]
    }
    get impact() {
        return WeaponConfiguration.WEAPON_IMPACT[this._id]
    }
    get impact_string() {
        return WeaponConfiguration.WEAPON_IMPACT_STRING[this._id]
    }
    get power() {
        return WeaponConfiguration.WEAPON_POWER[this._id]
    }
    get size() {
        return WeaponConfiguration.WEAPON_SIZE[this._id]
    }
    get length() {
        return WeaponConfiguration.WEAPON_LENGTH[this._id]
    }
    get craftable() {
        return WeaponConfiguration.WEAPON_CRAFTABLE[this._id]
    }
    get name() {
        return WeaponConfiguration.WEAPON_NAME[this._id]
    }
}


export class Armour implements ArmourData {
    private _id: ARMOUR
    constructor(id: ARMOUR) {
        if (!(id in ArmourConfiguration.ARMOUR)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in ArmourConfiguration.ARMOUR_FROM_STRING)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return new Armour(ArmourConfiguration.ARMOUR_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return ArmourConfiguration.ARMOUR_ARMOUR_STRING[this._id]
    }
    get material() {
        return ArmourConfiguration.ARMOUR_MATERIAL[this._id]
    }
    get material_string() {
        return ArmourConfiguration.ARMOUR_MATERIAL_STRING[this._id]
    }
    get secondary_material() {
        return ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL[this._id]
    }
    get secondary_material_string() {
        return ArmourConfiguration.ARMOUR_SECONDARY_MATERIAL_STRING[this._id]
    }
    get slot() {
        return ArmourConfiguration.ARMOUR_SLOT[this._id]
    }
    get slot_string() {
        return ArmourConfiguration.ARMOUR_SLOT_STRING[this._id]
    }
    get magic_power() {
        return ArmourConfiguration.ARMOUR_MAGIC_POWER[this._id]
    }
    get thickness() {
        return ArmourConfiguration.ARMOUR_THICKNESS[this._id]
    }
    get size() {
        return ArmourConfiguration.ARMOUR_SIZE[this._id]
    }
    get secondary_size() {
        return ArmourConfiguration.ARMOUR_SECONDARY_SIZE[this._id]
    }
    get craftable() {
        return ArmourConfiguration.ARMOUR_CRAFTABLE[this._id]
    }
    get name() {
        return ArmourConfiguration.ARMOUR_NAME[this._id]
    }
}

