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
    MEAT_GRACI,
    MEAT_HUMAN_FRIED,
    MEAT_GRACI_FRIED,
    FISH_OKU,
    FISH_OKU_FRIED,
    BERRY_FIE,
    BERRY_ZAZ,
    ZAZ,
    WOOD_RED,
    WOOD_RED_PLATE,
    HAIR_GRACI,
    STEEL,
}
export type material_string_id = "arrow-bone"|"arrow-zaz"|"cotton"|"textile"|"small-bone-rat"|"small-bone-human"|"small-bone-graci"|"bone-rat"|"bone-human"|"bone-graci"|"skin-rat"|"skin-human"|"skin-graci"|"skin-ball"|"leather-rat"|"leather-human"|"leather-graci"|"leather-ball"|"meat-rat"|"meat-rat-fried"|"meat-elodino"|"meat-ball"|"meat-human"|"meat-graci"|"meat-human-fried"|"meat-graci-fried"|"fish-oku"|"fish-oku-fried"|"berry-fie"|"berry-zaz"|"zaz"|"wood-red"|"wood-red-plate"|"hair-graci"|"steel"

export const enum MATERIAL_CATEGORY {
    BOW_AMMO,
    PLANT,
    MATERIAL,
    BONE,
    SKIN,
    LEATHER,
    MEAT,
    FISH,
    FOOD,
    FRUIT,
    WOOD,
    TEXTILE,
    METAL,
}
export type material_category_string_id = "bow-ammo"|"plant"|"material"|"bone"|"skin"|"leather"|"meat"|"fish"|"food"|"fruit"|"wood"|"textile"|"metal"

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
    NONE,
}
export type equip_slot_string_id = "weapon"|"secondary"|"amulet"|"mail"|"pauldron-left"|"pauldron-right"|"gauntlet-left"|"gauntlet-right"|"boots"|"helmet"|"belt"|"robe"|"shirt"|"pants"|"dress"|"socks"|"none"

export const enum IMPACT_TYPE {
    POINT,
    BLADE,
    BLUNT,
    NONE,
}
export type impact_type_string_id = "point"|"blade"|"blunt"|"none"

export const enum WEAPON {
    BOW_WOOD,
    SPEAR_WOOD_RED,
    SPEAR_WOOD_RED_BONE_RAT,
    DAGGER_BONE_RAT,
    SWORD_STEEL,
    MACE_WOOD_RED,
}
export type weapon_string_id = "bow-wood"|"spear-wood-red"|"spear-wood-red-bone-rat"|"dagger-bone-rat"|"sword-steel"|"mace-wood-red"

export const enum ARMOUR {
    HELMET_SKULL_RAT,
    HELMET_TEXTILE,
    HELMET_LEATHER_RAT,
    HELMET_HAIR_GRACI,
    MAIL_BONE_RAT,
    MAIL_LEATHER_RAT,
    MAIL_TEXTILE,
    MAIL_LEATHER_BALL,
    MAIL_LEATHER_GRACI,
    DRESS_MEAT_ELODINO,
    PANTS_LEATHER_RAT,
    PANTS_TEXTILE,
    BOOTS_LEATHER_RAT,
    GAUNTLET_RIGHT_LEATHER_RAT,
    GAUNTLET_RIGHT_TEXTILE,
    GAUNTLET_LEFT_LEATHER_RAT,
    GAUNTLET_LEFT_TEXTILE,
    SOCKS_TEXTILE,
    PAULDRON_LEFT_BONE_RAT,
    PAULDRON_LEFT_LEATHER_RAT,
    PAULDRON_RIGHT_BONE_RAT,
    ROBE_LEATHER_RAT,
    BELT_TEXTILE,
    SHIRT_TEXTILE,
}
export type armour_string_id = "helmet-skull-rat"|"helmet-textile"|"helmet-leather-rat"|"helmet-hair-graci"|"mail-bone-rat"|"mail-leather-rat"|"mail-textile"|"mail-leather-ball"|"mail-leather-graci"|"dress-meat-elodino"|"pants-leather-rat"|"pants-textile"|"boots-leather-rat"|"gauntlet-right-leather-rat"|"gauntlet-right-textile"|"gauntlet-left-leather-rat"|"gauntlet-left-textile"|"socks-textile"|"pauldron-left-bone-rat"|"pauldron-left-leather-rat"|"pauldron-right-bone-rat"|"robe-leather-rat"|"belt-textile"|"shirt-textile"

export interface MaterialData {
    readonly id : MATERIAL
    readonly category : MATERIAL_CATEGORY
    readonly cutting_power : number
    readonly density : number
    readonly cutting_protection : number
    readonly blunt_protection : number
    readonly penentration_protection : number
    readonly magic_power : number
    readonly unit_size : number
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


export interface ImpactData {
    readonly id : IMPACT_TYPE
    readonly handle_ratio : number
    readonly blunt : number
    readonly pierce : number
    readonly slice : number
    readonly name : string
}


export interface WeaponData {
    readonly id : WEAPON
    readonly material : MATERIAL
    readonly secondary_material : MATERIAL
    readonly impact : IMPACT_TYPE
    readonly magic_power : number
    readonly size : number
    readonly length : number
    readonly craftable : number
    readonly bow_power : number
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
    static MATERIAL : MATERIAL[] = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.FISH_OKU, MATERIAL.FISH_OKU_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIAL_FROM_STRING : Record<material_string_id, MATERIAL> = { "arrow-bone": MATERIAL.ARROW_BONE, "arrow-zaz": MATERIAL.ARROW_ZAZ, "cotton": MATERIAL.COTTON, "textile": MATERIAL.TEXTILE, "small-bone-rat": MATERIAL.SMALL_BONE_RAT, "small-bone-human": MATERIAL.SMALL_BONE_HUMAN, "small-bone-graci": MATERIAL.SMALL_BONE_GRACI, "bone-rat": MATERIAL.BONE_RAT, "bone-human": MATERIAL.BONE_HUMAN, "bone-graci": MATERIAL.BONE_GRACI, "skin-rat": MATERIAL.SKIN_RAT, "skin-human": MATERIAL.SKIN_HUMAN, "skin-graci": MATERIAL.SKIN_GRACI, "skin-ball": MATERIAL.SKIN_BALL, "leather-rat": MATERIAL.LEATHER_RAT, "leather-human": MATERIAL.LEATHER_HUMAN, "leather-graci": MATERIAL.LEATHER_GRACI, "leather-ball": MATERIAL.LEATHER_BALL, "meat-rat": MATERIAL.MEAT_RAT, "meat-rat-fried": MATERIAL.MEAT_RAT_FRIED, "meat-elodino": MATERIAL.MEAT_ELODINO, "meat-ball": MATERIAL.MEAT_BALL, "meat-human": MATERIAL.MEAT_HUMAN, "meat-graci": MATERIAL.MEAT_GRACI, "meat-human-fried": MATERIAL.MEAT_HUMAN_FRIED, "meat-graci-fried": MATERIAL.MEAT_GRACI_FRIED, "fish-oku": MATERIAL.FISH_OKU, "fish-oku-fried": MATERIAL.FISH_OKU_FRIED, "berry-fie": MATERIAL.BERRY_FIE, "berry-zaz": MATERIAL.BERRY_ZAZ, "zaz": MATERIAL.ZAZ, "wood-red": MATERIAL.WOOD_RED, "wood-red-plate": MATERIAL.WOOD_RED_PLATE, "hair-graci": MATERIAL.HAIR_GRACI, "steel": MATERIAL.STEEL }
    static MATERIAL_TO_STRING : Record<MATERIAL, material_string_id> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-graci", "meat-human-fried", "meat-graci-fried", "fish-oku", "fish-oku-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]
    static get zero_record() : Record<MATERIAL, number> {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is MATERIAL {
        return id in this.MATERIAL 
    }
    static is_valid_string_id(id: string): id is material_string_id {
        return id in this.MATERIAL_FROM_STRING 
    }

    // ENUMS: 

    static MATERIAL_MATERIAL : Record<MATERIAL, MATERIAL> = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.FISH_OKU, MATERIAL.FISH_OKU_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIAL_MATERIAL_STRING : Record<MATERIAL, material_string_id> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-graci", "meat-human-fried", "meat-graci-fried", "fish-oku", "fish-oku-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]
    static MATERIAL_CATEGORY : Record<MATERIAL, MATERIAL_CATEGORY> = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.TEXTILE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FISH, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.WOOD, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.TEXTILE, MATERIAL_CATEGORY.METAL, ]
    static MATERIAL_CATEGORY_STRING : Record<MATERIAL, material_category_string_id> = ["bow-ammo", "bow-ammo", "plant", "textile", "bone", "bone", "bone", "bone", "bone", "bone", "skin", "skin", "skin", "skin", "leather", "leather", "leather", "leather", "meat", "food", "meat", "food", "meat", "meat", "food", "food", "fish", "food", "fruit", "fruit", "material", "wood", "material", "textile", "metal", ]

    // Numbers: 

    static MATERIAL_CUTTING_POWER : Record<MATERIAL, number> = [2.0, 4.0, 0.0, 0.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 1.0, 1.0, 20.0, 5.0, ]
    static MATERIAL_DENSITY : Record<MATERIAL, number> = [0.2, 0.2, 0.2, 1.0, 0.5, 0.6, 0.2, 0.5, 0.6, 0.2, 1.5, 1.2, 1.1, 0.8, 3.0, 2.4, 2.2, 1.6, 0.4, 0.6, 0.1, 0.1, 0.5, 0.2, 0.7, 0.2, 0.3, 0.5, 0.2, 0.3, 10.0, 1.0, 2.0, 10.0, 8.0, ]
    static MATERIAL_CUTTING_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 0.1, 0.25, 0.5, 0.5, 0.5, 0.5, 5.0, 0.6, 0.5, 0.4, 0.3, 0.5, 0.4, 0.3, 0.2, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.8, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 5.0, ]
    static MATERIAL_BLUNT_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.05, 0.01, 0.025, 0.05, 0.05, 0.3, 0.4, 0.1, 0.01, 0.01, 0.01, 0.01, 0.05, 0.04, 0.03, 0.02, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 5.0, ]
    static MATERIAL_PENENTRATION_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.05, 0.1, 0.5, 0.5, 0.5, 3.0, 4.0, 5.0, 0.2, 0.1, 0.0, 0.0, 0.3, 0.2, 0.1, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.0, 5.0, 2.5, 5.0, 10.0, 5.0, ]
    static MATERIAL_MAGIC_POWER : Record<MATERIAL, number> = [0.0, 1.0, 0.05, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 2.0, 4.0, 0.0, 0.0, 2.0, 2.0, 0.0, 4.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.1, 1.0, 0.1, 0.1, 5.0, 0.0, ]
    static MATERIAL_UNIT_SIZE : Record<MATERIAL, number> = [0.1, 0.1, 1.0, 1.0, 0.03, 0.03, 0.5, 0.4, 0.4, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 0.01, 0.01, 0.03, 1.0, 1.0, 1.0, 1.0, ]

    // Strings: 

    static MATERIAL_NAME : Record<MATERIAL, string> = ["Bone arrow", "Zaz arrow", "Cotton", "Textile", "Bone(rat, small)", "Bone(human, small)", "Bone(graci, small)", "Bone(rat)", "Bone(human)", "Bone(graci)", "Skin(rat)", "Skin(human)", "Skin(graci)", "Skin(meat ball)", "Leather(rat)", "Leather(human)", "Leather(graci)", "Leather(meat ball)", "Meat(rat)", "Fried meat(rat)", "Meat(elodino)", "Meat(meat ball)", "Meat(human)", "Meat(graci)", "Fried meat(human)", "Fried meat(graci)", "Fish(oku)", "Fried fish(oku)", "Fieberry", "Zazberry", "Zaz", "Wood(raw)", "Wood(plates)", "Hair(graci)", "Steel", ]
}

export class MaterialCategoryConfiguration {
    static CATEGORY : MATERIAL_CATEGORY[] = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FISH, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, MATERIAL_CATEGORY.TEXTILE, MATERIAL_CATEGORY.METAL, ]
    static CATEGORY_FROM_STRING : Record<material_category_string_id, MATERIAL_CATEGORY> = { "bow-ammo": MATERIAL_CATEGORY.BOW_AMMO, "plant": MATERIAL_CATEGORY.PLANT, "material": MATERIAL_CATEGORY.MATERIAL, "bone": MATERIAL_CATEGORY.BONE, "skin": MATERIAL_CATEGORY.SKIN, "leather": MATERIAL_CATEGORY.LEATHER, "meat": MATERIAL_CATEGORY.MEAT, "fish": MATERIAL_CATEGORY.FISH, "food": MATERIAL_CATEGORY.FOOD, "fruit": MATERIAL_CATEGORY.FRUIT, "wood": MATERIAL_CATEGORY.WOOD, "textile": MATERIAL_CATEGORY.TEXTILE, "metal": MATERIAL_CATEGORY.METAL }
    static CATEGORY_TO_STRING : Record<MATERIAL_CATEGORY, material_category_string_id> = ["bow-ammo", "plant", "material", "bone", "skin", "leather", "meat", "fish", "food", "fruit", "wood", "textile", "metal", ]
    static get zero_record() : Record<MATERIAL_CATEGORY, number> {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is MATERIAL_CATEGORY {
        return id in this.CATEGORY 
    }
    static is_valid_string_id(id: string): id is material_category_string_id {
        return id in this.CATEGORY_FROM_STRING 
    }

    // ENUMS: 

    static MATERIAL_CATEGORY_CATEGORY : Record<MATERIAL_CATEGORY, MATERIAL_CATEGORY> = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.LEATHER, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FISH, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, MATERIAL_CATEGORY.TEXTILE, MATERIAL_CATEGORY.METAL, ]
    static MATERIAL_CATEGORY_CATEGORY_STRING : Record<MATERIAL_CATEGORY, material_category_string_id> = ["bow-ammo", "plant", "material", "bone", "skin", "leather", "meat", "fish", "food", "fruit", "wood", "textile", "metal", ]

    // Numbers: 


    // Strings: 

    static MATERIAL_CATEGORY_NAME : Record<MATERIAL_CATEGORY, string> = ["Ammo(bow)", "Plant", "Material", "Bone", "Skin", "Leather", "Meat", "Fish", "Food", "Fruit", "Wood", "Textile", "Metal", ]
}

export class EquipSlotConfiguration {
    static SLOT : EQUIP_SLOT[] = [EQUIP_SLOT.WEAPON, EQUIP_SLOT.SECONDARY, EQUIP_SLOT.AMULET, EQUIP_SLOT.MAIL, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.BOOTS, EQUIP_SLOT.HELMET, EQUIP_SLOT.BELT, EQUIP_SLOT.ROBE, EQUIP_SLOT.SHIRT, EQUIP_SLOT.PANTS, EQUIP_SLOT.DRESS, EQUIP_SLOT.SOCKS, EQUIP_SLOT.NONE, ]
    static SLOT_FROM_STRING : Record<equip_slot_string_id, EQUIP_SLOT> = { "weapon": EQUIP_SLOT.WEAPON, "secondary": EQUIP_SLOT.SECONDARY, "amulet": EQUIP_SLOT.AMULET, "mail": EQUIP_SLOT.MAIL, "pauldron-left": EQUIP_SLOT.PAULDRON_LEFT, "pauldron-right": EQUIP_SLOT.PAULDRON_RIGHT, "gauntlet-left": EQUIP_SLOT.GAUNTLET_LEFT, "gauntlet-right": EQUIP_SLOT.GAUNTLET_RIGHT, "boots": EQUIP_SLOT.BOOTS, "helmet": EQUIP_SLOT.HELMET, "belt": EQUIP_SLOT.BELT, "robe": EQUIP_SLOT.ROBE, "shirt": EQUIP_SLOT.SHIRT, "pants": EQUIP_SLOT.PANTS, "dress": EQUIP_SLOT.DRESS, "socks": EQUIP_SLOT.SOCKS, "none": EQUIP_SLOT.NONE }
    static SLOT_TO_STRING : Record<EQUIP_SLOT, equip_slot_string_id> = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", "none", ]
    static get zero_record() : Record<EQUIP_SLOT, number> {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is EQUIP_SLOT {
        return id in this.SLOT 
    }
    static is_valid_string_id(id: string): id is equip_slot_string_id {
        return id in this.SLOT_FROM_STRING 
    }

    // ENUMS: 

    static EQUIP_SLOT_SLOT : Record<EQUIP_SLOT, EQUIP_SLOT> = [EQUIP_SLOT.WEAPON, EQUIP_SLOT.SECONDARY, EQUIP_SLOT.AMULET, EQUIP_SLOT.MAIL, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.BOOTS, EQUIP_SLOT.HELMET, EQUIP_SLOT.BELT, EQUIP_SLOT.ROBE, EQUIP_SLOT.SHIRT, EQUIP_SLOT.PANTS, EQUIP_SLOT.DRESS, EQUIP_SLOT.SOCKS, EQUIP_SLOT.NONE, ]
    static EQUIP_SLOT_SLOT_STRING : Record<EQUIP_SLOT, equip_slot_string_id> = ["weapon", "secondary", "amulet", "mail", "pauldron-left", "pauldron-right", "gauntlet-left", "gauntlet-right", "boots", "helmet", "belt", "robe", "shirt", "pants", "dress", "socks", "none", ]

    // Numbers: 


    // Strings: 

    static EQUIP_SLOT_NAME : Record<EQUIP_SLOT, string> = ["Weapon", "Secondary", "Amulet", "Chestpiece", "Left pauldron", "Right pauldron", "Left gauntlet", "Right gauntlet", "Boots", "Helmet", "Belt", "Robe", "Shirt", "Pants", "Dress", "Socks", "nan", ]
}

export class ImpactConfiguration {
    static IMPACT : IMPACT_TYPE[] = [IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, IMPACT_TYPE.NONE, ]
    static IMPACT_FROM_STRING : Record<impact_type_string_id, IMPACT_TYPE> = { "point": IMPACT_TYPE.POINT, "blade": IMPACT_TYPE.BLADE, "blunt": IMPACT_TYPE.BLUNT, "none": IMPACT_TYPE.NONE }
    static IMPACT_TO_STRING : Record<IMPACT_TYPE, impact_type_string_id> = ["point", "blade", "blunt", "none", ]
    static get zero_record() : Record<IMPACT_TYPE, number> {
        return [0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is IMPACT_TYPE {
        return id in this.IMPACT 
    }
    static is_valid_string_id(id: string): id is impact_type_string_id {
        return id in this.IMPACT_FROM_STRING 
    }

    // ENUMS: 

    static IMPACT_TYPE_IMPACT : Record<IMPACT_TYPE, IMPACT_TYPE> = [IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, IMPACT_TYPE.NONE, ]
    static IMPACT_TYPE_IMPACT_STRING : Record<IMPACT_TYPE, impact_type_string_id> = ["point", "blade", "blunt", "none", ]

    // Numbers: 

    static IMPACT_TYPE_HANDLE_RATIO : Record<IMPACT_TYPE, number> = [0.9, 0.1, 0.3, 1.0, ]
    static IMPACT_TYPE_BLUNT : Record<IMPACT_TYPE, number> = [0.8, 1.0, 1.0, 0.0, ]
    static IMPACT_TYPE_PIERCE : Record<IMPACT_TYPE, number> = [1.0, 0.8, 0.0, 0.0, ]
    static IMPACT_TYPE_SLICE : Record<IMPACT_TYPE, number> = [0.4, 1.0, 0.0, 0.0, ]

    // Strings: 

    static IMPACT_TYPE_NAME : Record<IMPACT_TYPE, string> = ["Point", "Blade", "Blunt", "nan", ]
}

export class WeaponConfiguration {
    static WEAPON : WEAPON[] = [WEAPON.BOW_WOOD, WEAPON.SPEAR_WOOD_RED, WEAPON.SPEAR_WOOD_RED_BONE_RAT, WEAPON.DAGGER_BONE_RAT, WEAPON.SWORD_STEEL, WEAPON.MACE_WOOD_RED, ]
    static WEAPON_FROM_STRING : Record<weapon_string_id, WEAPON> = { "bow-wood": WEAPON.BOW_WOOD, "spear-wood-red": WEAPON.SPEAR_WOOD_RED, "spear-wood-red-bone-rat": WEAPON.SPEAR_WOOD_RED_BONE_RAT, "dagger-bone-rat": WEAPON.DAGGER_BONE_RAT, "sword-steel": WEAPON.SWORD_STEEL, "mace-wood-red": WEAPON.MACE_WOOD_RED }
    static WEAPON_TO_STRING : Record<WEAPON, weapon_string_id> = ["bow-wood", "spear-wood-red", "spear-wood-red-bone-rat", "dagger-bone-rat", "sword-steel", "mace-wood-red", ]
    static get zero_record() : Record<WEAPON, number> {
        return [0, 0, 0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is WEAPON {
        return id in this.WEAPON 
    }
    static is_valid_string_id(id: string): id is weapon_string_id {
        return id in this.WEAPON_FROM_STRING 
    }

    // ENUMS: 

    static WEAPON_WEAPON : Record<WEAPON, WEAPON> = [WEAPON.BOW_WOOD, WEAPON.SPEAR_WOOD_RED, WEAPON.SPEAR_WOOD_RED_BONE_RAT, WEAPON.DAGGER_BONE_RAT, WEAPON.SWORD_STEEL, WEAPON.MACE_WOOD_RED, ]
    static WEAPON_WEAPON_STRING : Record<WEAPON, weapon_string_id> = ["bow-wood", "spear-wood-red", "spear-wood-red-bone-rat", "dagger-bone-rat", "sword-steel", "mace-wood-red", ]
    static WEAPON_MATERIAL : Record<WEAPON, MATERIAL> = [MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.SMALL_BONE_RAT, MATERIAL.BONE_RAT, MATERIAL.STEEL, MATERIAL.WOOD_RED, ]
    static WEAPON_MATERIAL_STRING : Record<WEAPON, material_string_id> = ["wood-red", "wood-red", "small-bone-rat", "bone-rat", "steel", "wood-red", ]
    static WEAPON_SECONDARY_MATERIAL : Record<WEAPON, MATERIAL> = [MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, MATERIAL.BONE_RAT, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED, ]
    static WEAPON_SECONDARY_MATERIAL_STRING : Record<WEAPON, material_string_id> = ["wood-red", "wood-red", "wood-red", "bone-rat", "wood-red", "wood-red", ]
    static WEAPON_IMPACT : Record<WEAPON, IMPACT_TYPE> = [IMPACT_TYPE.BLUNT, IMPACT_TYPE.POINT, IMPACT_TYPE.POINT, IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT, ]
    static WEAPON_IMPACT_STRING : Record<WEAPON, impact_type_string_id> = ["blunt", "point", "point", "point", "blade", "blunt", ]

    // Numbers: 

    static WEAPON_MAGIC_POWER : Record<WEAPON, number> = [0, 0, 0, 0, 0, 0, ]
    static WEAPON_SIZE : Record<WEAPON, number> = [0.75, 1.5, 1.5, 0.5, 1.0, 3.0, ]
    static WEAPON_LENGTH : Record<WEAPON, number> = [1.0, 3.0, 3.0, 0.5, 1.0, 1.0, ]
    static WEAPON_CRAFTABLE : Record<WEAPON, number> = [1, 1, 1, 1, 1, 1, ]
    static WEAPON_BOW_POWER : Record<WEAPON, number> = [20, 0, 0, 0, 0, 0, ]

    // Strings: 

    static WEAPON_NAME : Record<WEAPON, string> = ["Bow", "Spear", "Spear", "Dagger", "Sword", "Mace", ]
}

export class ArmourConfiguration {
    static ARMOUR : ARMOUR[] = [ARMOUR.HELMET_SKULL_RAT, ARMOUR.HELMET_TEXTILE, ARMOUR.HELMET_LEATHER_RAT, ARMOUR.HELMET_HAIR_GRACI, ARMOUR.MAIL_BONE_RAT, ARMOUR.MAIL_LEATHER_RAT, ARMOUR.MAIL_TEXTILE, ARMOUR.MAIL_LEATHER_BALL, ARMOUR.MAIL_LEATHER_GRACI, ARMOUR.DRESS_MEAT_ELODINO, ARMOUR.PANTS_LEATHER_RAT, ARMOUR.PANTS_TEXTILE, ARMOUR.BOOTS_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_TEXTILE, ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, ARMOUR.GAUNTLET_LEFT_TEXTILE, ARMOUR.SOCKS_TEXTILE, ARMOUR.PAULDRON_LEFT_BONE_RAT, ARMOUR.PAULDRON_LEFT_LEATHER_RAT, ARMOUR.PAULDRON_RIGHT_BONE_RAT, ARMOUR.ROBE_LEATHER_RAT, ARMOUR.BELT_TEXTILE, ARMOUR.SHIRT_TEXTILE, ]
    static ARMOUR_FROM_STRING : Record<armour_string_id, ARMOUR> = { "helmet-skull-rat": ARMOUR.HELMET_SKULL_RAT, "helmet-textile": ARMOUR.HELMET_TEXTILE, "helmet-leather-rat": ARMOUR.HELMET_LEATHER_RAT, "helmet-hair-graci": ARMOUR.HELMET_HAIR_GRACI, "mail-bone-rat": ARMOUR.MAIL_BONE_RAT, "mail-leather-rat": ARMOUR.MAIL_LEATHER_RAT, "mail-textile": ARMOUR.MAIL_TEXTILE, "mail-leather-ball": ARMOUR.MAIL_LEATHER_BALL, "mail-leather-graci": ARMOUR.MAIL_LEATHER_GRACI, "dress-meat-elodino": ARMOUR.DRESS_MEAT_ELODINO, "pants-leather-rat": ARMOUR.PANTS_LEATHER_RAT, "pants-textile": ARMOUR.PANTS_TEXTILE, "boots-leather-rat": ARMOUR.BOOTS_LEATHER_RAT, "gauntlet-right-leather-rat": ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, "gauntlet-right-textile": ARMOUR.GAUNTLET_RIGHT_TEXTILE, "gauntlet-left-leather-rat": ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, "gauntlet-left-textile": ARMOUR.GAUNTLET_LEFT_TEXTILE, "socks-textile": ARMOUR.SOCKS_TEXTILE, "pauldron-left-bone-rat": ARMOUR.PAULDRON_LEFT_BONE_RAT, "pauldron-left-leather-rat": ARMOUR.PAULDRON_LEFT_LEATHER_RAT, "pauldron-right-bone-rat": ARMOUR.PAULDRON_RIGHT_BONE_RAT, "robe-leather-rat": ARMOUR.ROBE_LEATHER_RAT, "belt-textile": ARMOUR.BELT_TEXTILE, "shirt-textile": ARMOUR.SHIRT_TEXTILE }
    static ARMOUR_TO_STRING : Record<ARMOUR, armour_string_id> = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone-rat", "mail-leather-rat", "mail-textile", "mail-leather-ball", "mail-leather-graci", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone-rat", "pauldron-left-leather-rat", "pauldron-right-bone-rat", "robe-leather-rat", "belt-textile", "shirt-textile", ]
    static get zero_record() : Record<ARMOUR, number> {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    }
    static is_valid_id(id: number): id is ARMOUR {
        return id in this.ARMOUR 
    }
    static is_valid_string_id(id: string): id is armour_string_id {
        return id in this.ARMOUR_FROM_STRING 
    }

    // ENUMS: 

    static ARMOUR_ARMOUR : Record<ARMOUR, ARMOUR> = [ARMOUR.HELMET_SKULL_RAT, ARMOUR.HELMET_TEXTILE, ARMOUR.HELMET_LEATHER_RAT, ARMOUR.HELMET_HAIR_GRACI, ARMOUR.MAIL_BONE_RAT, ARMOUR.MAIL_LEATHER_RAT, ARMOUR.MAIL_TEXTILE, ARMOUR.MAIL_LEATHER_BALL, ARMOUR.MAIL_LEATHER_GRACI, ARMOUR.DRESS_MEAT_ELODINO, ARMOUR.PANTS_LEATHER_RAT, ARMOUR.PANTS_TEXTILE, ARMOUR.BOOTS_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT, ARMOUR.GAUNTLET_RIGHT_TEXTILE, ARMOUR.GAUNTLET_LEFT_LEATHER_RAT, ARMOUR.GAUNTLET_LEFT_TEXTILE, ARMOUR.SOCKS_TEXTILE, ARMOUR.PAULDRON_LEFT_BONE_RAT, ARMOUR.PAULDRON_LEFT_LEATHER_RAT, ARMOUR.PAULDRON_RIGHT_BONE_RAT, ARMOUR.ROBE_LEATHER_RAT, ARMOUR.BELT_TEXTILE, ARMOUR.SHIRT_TEXTILE, ]
    static ARMOUR_ARMOUR_STRING : Record<ARMOUR, armour_string_id> = ["helmet-skull-rat", "helmet-textile", "helmet-leather-rat", "helmet-hair-graci", "mail-bone-rat", "mail-leather-rat", "mail-textile", "mail-leather-ball", "mail-leather-graci", "dress-meat-elodino", "pants-leather-rat", "pants-textile", "boots-leather-rat", "gauntlet-right-leather-rat", "gauntlet-right-textile", "gauntlet-left-leather-rat", "gauntlet-left-textile", "socks-textile", "pauldron-left-bone-rat", "pauldron-left-leather-rat", "pauldron-right-bone-rat", "robe-leather-rat", "belt-textile", "shirt-textile", ]
    static ARMOUR_MATERIAL : Record<ARMOUR, MATERIAL> = [MATERIAL.BONE_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.HAIR_GRACI, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_BALL, MATERIAL.LEATHER_GRACI, MATERIAL.MEAT_ELODINO, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, ]
    static ARMOUR_MATERIAL_STRING : Record<ARMOUR, material_string_id> = ["bone-rat", "textile", "leather-rat", "hair-graci", "bone-rat", "leather-rat", "textile", "leather-ball", "leather-graci", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "bone-rat", "leather-rat", "bone-rat", "leather-rat", "textile", "textile", ]
    static ARMOUR_SECONDARY_MATERIAL : Record<ARMOUR, MATERIAL> = [MATERIAL.SKIN_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.HAIR_GRACI, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_BALL, MATERIAL.LEATHER_GRACI, MATERIAL.MEAT_ELODINO, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.SMALL_BONE_RAT, MATERIAL.LEATHER_RAT, MATERIAL.TEXTILE, MATERIAL.TEXTILE, ]
    static ARMOUR_SECONDARY_MATERIAL_STRING : Record<ARMOUR, material_string_id> = ["skin-rat", "textile", "leather-rat", "hair-graci", "small-bone-rat", "leather-rat", "textile", "leather-ball", "leather-graci", "meat-elodino", "leather-rat", "textile", "leather-rat", "leather-rat", "textile", "leather-rat", "textile", "textile", "small-bone-rat", "leather-rat", "small-bone-rat", "leather-rat", "textile", "textile", ]
    static ARMOUR_SLOT : Record<ARMOUR, EQUIP_SLOT> = [EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.HELMET, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.MAIL, EQUIP_SLOT.DRESS, EQUIP_SLOT.PANTS, EQUIP_SLOT.PANTS, EQUIP_SLOT.BOOTS, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.GAUNTLET_RIGHT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.GAUNTLET_LEFT, EQUIP_SLOT.SOCKS, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_LEFT, EQUIP_SLOT.PAULDRON_RIGHT, EQUIP_SLOT.ROBE, EQUIP_SLOT.BELT, EQUIP_SLOT.SHIRT, ]
    static ARMOUR_SLOT_STRING : Record<ARMOUR, equip_slot_string_id> = ["helmet", "helmet", "helmet", "helmet", "mail", "mail", "mail", "mail", "mail", "dress", "pants", "pants", "boots", "gauntlet-right", "gauntlet-right", "gauntlet-left", "gauntlet-left", "socks", "pauldron-left", "pauldron-left", "pauldron-right", "robe", "belt", "shirt", ]

    // Numbers: 

    static ARMOUR_MAGIC_POWER : Record<ARMOUR, number> = [0, 0, 0, 3, 0, 0, 0, 1, 10, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]
    static ARMOUR_THICKNESS : Record<ARMOUR, number> = [2.0, 0.5, 1.0, 0.01, 2.0, 1.0, 0.5, 0.5, 1.0, 1.0, 4.0, 4.0, 2.0, 0.5, 0.2, 0.5, 0.2, 0.1, 2.0, 1.0, 2.0, 2.0, 0.5, 5.0, ]
    static ARMOUR_SIZE : Record<ARMOUR, number> = [3.0, 3.0, 3.0, 3.0, 10.0, 10.0, 10.0, 8.0, 8.0, 10.0, 6.0, 6.0, 3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.5, 2.5, 2.5, 15.0, 1.0, 2.0, ]
    static ARMOUR_SECONDARY_SIZE : Record<ARMOUR, number> = [0.0, 0.0, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, ]
    static ARMOUR_CRAFTABLE : Record<ARMOUR, number> = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ]

    // Strings: 

    static ARMOUR_NAME : Record<ARMOUR, string> = ["Rat skull", "Hat", "Hat", "Wig", "Mail", "Mail", "Mail", "Mail", "Mail", "Dress", "Pants", "Pants", "Boots", "Right Glove", "Right Glove", "Left Glove", "Left Glove", "Socks", "Left Bone Pauldron", "Left Pauldron", "Right Bone Pauldron", "Robe", "Belt", "Shirt", ]
}


class MaterialInstance implements MaterialData {
    private _id: MATERIAL
    constructor(id: MATERIAL) {
        if (!(id in MaterialConfiguration.MATERIAL)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        this._id = id
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
    get unit_size() {
        return MaterialConfiguration.MATERIAL_UNIT_SIZE[this._id]
    }
    get name() {
        return MaterialConfiguration.MATERIAL_NAME[this._id]
    }
}



class MaterialCategoryInstance implements MaterialCategoryData {
    private _id: MATERIAL_CATEGORY
    constructor(id: MATERIAL_CATEGORY) {
        if (!(id in MaterialCategoryConfiguration.CATEGORY)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        this._id = id
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



class EquipSlotInstance implements EquipSlotData {
    private _id: EQUIP_SLOT
    constructor(id: EQUIP_SLOT) {
        if (!(id in EquipSlotConfiguration.SLOT)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        this._id = id
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



class ImpactInstance implements ImpactData {
    private _id: IMPACT_TYPE
    constructor(id: IMPACT_TYPE) {
        if (!(id in ImpactConfiguration.IMPACT)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        this._id = id
    }
    get id() {
        return this._id
    }
    get id_string() {
        return ImpactConfiguration.IMPACT_TYPE_IMPACT_STRING[this._id]
    }
    get handle_ratio() {
        return ImpactConfiguration.IMPACT_TYPE_HANDLE_RATIO[this._id]
    }
    get blunt() {
        return ImpactConfiguration.IMPACT_TYPE_BLUNT[this._id]
    }
    get pierce() {
        return ImpactConfiguration.IMPACT_TYPE_PIERCE[this._id]
    }
    get slice() {
        return ImpactConfiguration.IMPACT_TYPE_SLICE[this._id]
    }
    get name() {
        return ImpactConfiguration.IMPACT_TYPE_NAME[this._id]
    }
}



class WeaponInstance implements WeaponData {
    private _id: WEAPON
    constructor(id: WEAPON) {
        if (!(id in WeaponConfiguration.WEAPON)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        this._id = id
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
    get magic_power() {
        return WeaponConfiguration.WEAPON_MAGIC_POWER[this._id]
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
    get bow_power() {
        return WeaponConfiguration.WEAPON_BOW_POWER[this._id]
    }
    get name() {
        return WeaponConfiguration.WEAPON_NAME[this._id]
    }
}



class ArmourInstance implements ArmourData {
    private _id: ARMOUR
    constructor(id: ARMOUR) {
        if (!(id in ArmourConfiguration.ARMOUR)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        this._id = id
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


export class MaterialStorage {
    private static instances : Record<MATERIAL, MaterialInstance> = [new MaterialInstance(MATERIAL.ARROW_BONE), new MaterialInstance(MATERIAL.ARROW_ZAZ), new MaterialInstance(MATERIAL.COTTON), new MaterialInstance(MATERIAL.TEXTILE), new MaterialInstance(MATERIAL.SMALL_BONE_RAT), new MaterialInstance(MATERIAL.SMALL_BONE_HUMAN), new MaterialInstance(MATERIAL.SMALL_BONE_GRACI), new MaterialInstance(MATERIAL.BONE_RAT), new MaterialInstance(MATERIAL.BONE_HUMAN), new MaterialInstance(MATERIAL.BONE_GRACI), new MaterialInstance(MATERIAL.SKIN_RAT), new MaterialInstance(MATERIAL.SKIN_HUMAN), new MaterialInstance(MATERIAL.SKIN_GRACI), new MaterialInstance(MATERIAL.SKIN_BALL), new MaterialInstance(MATERIAL.LEATHER_RAT), new MaterialInstance(MATERIAL.LEATHER_HUMAN), new MaterialInstance(MATERIAL.LEATHER_GRACI), new MaterialInstance(MATERIAL.LEATHER_BALL), new MaterialInstance(MATERIAL.MEAT_RAT), new MaterialInstance(MATERIAL.MEAT_RAT_FRIED), new MaterialInstance(MATERIAL.MEAT_ELODINO), new MaterialInstance(MATERIAL.MEAT_BALL), new MaterialInstance(MATERIAL.MEAT_HUMAN), new MaterialInstance(MATERIAL.MEAT_GRACI), new MaterialInstance(MATERIAL.MEAT_HUMAN_FRIED), new MaterialInstance(MATERIAL.MEAT_GRACI_FRIED), new MaterialInstance(MATERIAL.FISH_OKU), new MaterialInstance(MATERIAL.FISH_OKU_FRIED), new MaterialInstance(MATERIAL.BERRY_FIE), new MaterialInstance(MATERIAL.BERRY_ZAZ), new MaterialInstance(MATERIAL.ZAZ), new MaterialInstance(MATERIAL.WOOD_RED), new MaterialInstance(MATERIAL.WOOD_RED_PLATE), new MaterialInstance(MATERIAL.HAIR_GRACI), new MaterialInstance(MATERIAL.STEEL)]

    // Retrieve instance of MaterialInstance 
    static get(id: MATERIAL) : MaterialInstance {
        if (!(id in MaterialStorage.instances)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return MaterialStorage.instances[id]
    }
    static from_string(id: material_string_id) : MaterialInstance {
        if (!(id in MaterialConfiguration.MATERIAL_FROM_STRING)) {
            throw new Error(`Invalid Material id: ${id}`);
        }
        return MaterialStorage.instances[MaterialConfiguration.MATERIAL_FROM_STRING[id]]
    }
}

export class MaterialCategoryStorage {
    private static instances : Record<MATERIAL_CATEGORY, MaterialCategoryInstance> = [new MaterialCategoryInstance(MATERIAL_CATEGORY.BOW_AMMO), new MaterialCategoryInstance(MATERIAL_CATEGORY.PLANT), new MaterialCategoryInstance(MATERIAL_CATEGORY.MATERIAL), new MaterialCategoryInstance(MATERIAL_CATEGORY.BONE), new MaterialCategoryInstance(MATERIAL_CATEGORY.SKIN), new MaterialCategoryInstance(MATERIAL_CATEGORY.LEATHER), new MaterialCategoryInstance(MATERIAL_CATEGORY.MEAT), new MaterialCategoryInstance(MATERIAL_CATEGORY.FISH), new MaterialCategoryInstance(MATERIAL_CATEGORY.FOOD), new MaterialCategoryInstance(MATERIAL_CATEGORY.FRUIT), new MaterialCategoryInstance(MATERIAL_CATEGORY.WOOD), new MaterialCategoryInstance(MATERIAL_CATEGORY.TEXTILE), new MaterialCategoryInstance(MATERIAL_CATEGORY.METAL)]

    // Retrieve instance of MaterialCategoryInstance 
    static get(id: MATERIAL_CATEGORY) : MaterialCategoryInstance {
        if (!(id in MaterialCategoryStorage.instances)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return MaterialCategoryStorage.instances[id]
    }
    static from_string(id: material_category_string_id) : MaterialCategoryInstance {
        if (!(id in MaterialCategoryConfiguration.CATEGORY_FROM_STRING)) {
            throw new Error(`Invalid MaterialCategory id: ${id}`);
        }
        return MaterialCategoryStorage.instances[MaterialCategoryConfiguration.CATEGORY_FROM_STRING[id]]
    }
}

export class EquipSlotStorage {
    private static instances : Record<EQUIP_SLOT, EquipSlotInstance> = [new EquipSlotInstance(EQUIP_SLOT.WEAPON), new EquipSlotInstance(EQUIP_SLOT.SECONDARY), new EquipSlotInstance(EQUIP_SLOT.AMULET), new EquipSlotInstance(EQUIP_SLOT.MAIL), new EquipSlotInstance(EQUIP_SLOT.PAULDRON_LEFT), new EquipSlotInstance(EQUIP_SLOT.PAULDRON_RIGHT), new EquipSlotInstance(EQUIP_SLOT.GAUNTLET_LEFT), new EquipSlotInstance(EQUIP_SLOT.GAUNTLET_RIGHT), new EquipSlotInstance(EQUIP_SLOT.BOOTS), new EquipSlotInstance(EQUIP_SLOT.HELMET), new EquipSlotInstance(EQUIP_SLOT.BELT), new EquipSlotInstance(EQUIP_SLOT.ROBE), new EquipSlotInstance(EQUIP_SLOT.SHIRT), new EquipSlotInstance(EQUIP_SLOT.PANTS), new EquipSlotInstance(EQUIP_SLOT.DRESS), new EquipSlotInstance(EQUIP_SLOT.SOCKS), new EquipSlotInstance(EQUIP_SLOT.NONE)]

    // Retrieve instance of EquipSlotInstance 
    static get(id: EQUIP_SLOT) : EquipSlotInstance {
        if (!(id in EquipSlotStorage.instances)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return EquipSlotStorage.instances[id]
    }
    static from_string(id: equip_slot_string_id) : EquipSlotInstance {
        if (!(id in EquipSlotConfiguration.SLOT_FROM_STRING)) {
            throw new Error(`Invalid EquipSlot id: ${id}`);
        }
        return EquipSlotStorage.instances[EquipSlotConfiguration.SLOT_FROM_STRING[id]]
    }
}

export class ImpactStorage {
    private static instances : Record<IMPACT_TYPE, ImpactInstance> = [new ImpactInstance(IMPACT_TYPE.POINT), new ImpactInstance(IMPACT_TYPE.BLADE), new ImpactInstance(IMPACT_TYPE.BLUNT), new ImpactInstance(IMPACT_TYPE.NONE)]

    // Retrieve instance of ImpactInstance 
    static get(id: IMPACT_TYPE) : ImpactInstance {
        if (!(id in ImpactStorage.instances)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return ImpactStorage.instances[id]
    }
    static from_string(id: impact_type_string_id) : ImpactInstance {
        if (!(id in ImpactConfiguration.IMPACT_FROM_STRING)) {
            throw new Error(`Invalid Impact id: ${id}`);
        }
        return ImpactStorage.instances[ImpactConfiguration.IMPACT_FROM_STRING[id]]
    }
}

export class WeaponStorage {
    private static instances : Record<WEAPON, WeaponInstance> = [new WeaponInstance(WEAPON.BOW_WOOD), new WeaponInstance(WEAPON.SPEAR_WOOD_RED), new WeaponInstance(WEAPON.SPEAR_WOOD_RED_BONE_RAT), new WeaponInstance(WEAPON.DAGGER_BONE_RAT), new WeaponInstance(WEAPON.SWORD_STEEL), new WeaponInstance(WEAPON.MACE_WOOD_RED)]

    // Retrieve instance of WeaponInstance 
    static get(id: WEAPON) : WeaponInstance {
        if (!(id in WeaponStorage.instances)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return WeaponStorage.instances[id]
    }
    static from_string(id: weapon_string_id) : WeaponInstance {
        if (!(id in WeaponConfiguration.WEAPON_FROM_STRING)) {
            throw new Error(`Invalid Weapon id: ${id}`);
        }
        return WeaponStorage.instances[WeaponConfiguration.WEAPON_FROM_STRING[id]]
    }
}

export class ArmourStorage {
    private static instances : Record<ARMOUR, ArmourInstance> = [new ArmourInstance(ARMOUR.HELMET_SKULL_RAT), new ArmourInstance(ARMOUR.HELMET_TEXTILE), new ArmourInstance(ARMOUR.HELMET_LEATHER_RAT), new ArmourInstance(ARMOUR.HELMET_HAIR_GRACI), new ArmourInstance(ARMOUR.MAIL_BONE_RAT), new ArmourInstance(ARMOUR.MAIL_LEATHER_RAT), new ArmourInstance(ARMOUR.MAIL_TEXTILE), new ArmourInstance(ARMOUR.MAIL_LEATHER_BALL), new ArmourInstance(ARMOUR.MAIL_LEATHER_GRACI), new ArmourInstance(ARMOUR.DRESS_MEAT_ELODINO), new ArmourInstance(ARMOUR.PANTS_LEATHER_RAT), new ArmourInstance(ARMOUR.PANTS_TEXTILE), new ArmourInstance(ARMOUR.BOOTS_LEATHER_RAT), new ArmourInstance(ARMOUR.GAUNTLET_RIGHT_LEATHER_RAT), new ArmourInstance(ARMOUR.GAUNTLET_RIGHT_TEXTILE), new ArmourInstance(ARMOUR.GAUNTLET_LEFT_LEATHER_RAT), new ArmourInstance(ARMOUR.GAUNTLET_LEFT_TEXTILE), new ArmourInstance(ARMOUR.SOCKS_TEXTILE), new ArmourInstance(ARMOUR.PAULDRON_LEFT_BONE_RAT), new ArmourInstance(ARMOUR.PAULDRON_LEFT_LEATHER_RAT), new ArmourInstance(ARMOUR.PAULDRON_RIGHT_BONE_RAT), new ArmourInstance(ARMOUR.ROBE_LEATHER_RAT), new ArmourInstance(ARMOUR.BELT_TEXTILE), new ArmourInstance(ARMOUR.SHIRT_TEXTILE)]

    // Retrieve instance of ArmourInstance 
    static get(id: ARMOUR) : ArmourInstance {
        if (!(id in ArmourStorage.instances)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return ArmourStorage.instances[id]
    }
    static from_string(id: armour_string_id) : ArmourInstance {
        if (!(id in ArmourConfiguration.ARMOUR_FROM_STRING)) {
            throw new Error(`Invalid Armour id: ${id}`);
        }
        return ArmourStorage.instances[ArmourConfiguration.ARMOUR_FROM_STRING[id]]
    }
}

