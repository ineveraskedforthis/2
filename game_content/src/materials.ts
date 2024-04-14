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
    FOOD,
    FRUIT,
    WOOD,
}




export interface MaterialData {
    readonly id: MATERIAL
    readonly category: MATERIAL_CATEGORY
    readonly id_string: string
    readonly category_string: string
    readonly cutting_power: number
    readonly density: number
    readonly cutting_protection: number
    readonly blunt_protection: number
    readonly penentration_protection: number
    readonly magic: number
}
export class MaterialConfiguration {
    static MATERIALS : MATERIAL[] = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIALS_FROM_STRING : Record<string, MATERIAL> = { "arrow-bone": MATERIAL.ARROW_BONE, "arrow-zaz": MATERIAL.ARROW_ZAZ, "cotton": MATERIAL.COTTON, "textile": MATERIAL.TEXTILE, "small-bone-rat": MATERIAL.SMALL_BONE_RAT, "small-bone-human": MATERIAL.SMALL_BONE_HUMAN, "small-bone-graci": MATERIAL.SMALL_BONE_GRACI, "bone-rat": MATERIAL.BONE_RAT, "bone-human": MATERIAL.BONE_HUMAN, "bone-graci": MATERIAL.BONE_GRACI, "skin-rat": MATERIAL.SKIN_RAT, "skin-human": MATERIAL.SKIN_HUMAN, "skin-graci": MATERIAL.SKIN_GRACI, "skin-ball": MATERIAL.SKIN_BALL, "leather-rat": MATERIAL.LEATHER_RAT, "leather-human": MATERIAL.LEATHER_HUMAN, "leather-graci": MATERIAL.LEATHER_GRACI, "leather-ball": MATERIAL.LEATHER_BALL, "meat-rat": MATERIAL.MEAT_RAT, "meat-rat-fried": MATERIAL.MEAT_RAT_FRIED, "meat-elodino": MATERIAL.MEAT_ELODINO, "meat-ball": MATERIAL.MEAT_BALL, "meat-human": MATERIAL.MEAT_HUMAN, "meat-human-fried": MATERIAL.MEAT_HUMAN_FRIED, "meat-graci": MATERIAL.MEAT_GRACI, "meat-graci-fried": MATERIAL.MEAT_GRACI_FRIED, "berry-fie": MATERIAL.BERRY_FIE, "berry-zaz": MATERIAL.BERRY_ZAZ, "zaz": MATERIAL.ZAZ, "wood-red": MATERIAL.WOOD_RED, "wood-red-plate": MATERIAL.WOOD_RED_PLATE, "hair-graci": MATERIAL.HAIR_GRACI, "steel": MATERIAL.STEEL }
    static MATERIALS_TO_STRING : Record<MATERIAL, string> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-human-fried", "meat-graci", "meat-graci-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]
    static MATERIAL_MATERIAL : Record<MATERIAL, MATERIAL> = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, MATERIAL.HAIR_GRACI, MATERIAL.STEEL, ]
    static MATERIAL_MATERIAL_STRING : Record<MATERIAL, string> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-human-fried", "meat-graci", "meat-graci-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", "hair-graci", "steel", ]
    static MATERIAL_CATEGORIES : MATERIAL_CATEGORY[] = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, ]
    static MATERIAL_CATEGORIES_FROM_STRING : Record<string, MATERIAL_CATEGORY> = { "bow-ammo": MATERIAL_CATEGORY.BOW_AMMO, "plant": MATERIAL_CATEGORY.PLANT, "material": MATERIAL_CATEGORY.MATERIAL, "bone": MATERIAL_CATEGORY.BONE, "skin": MATERIAL_CATEGORY.SKIN, "meat": MATERIAL_CATEGORY.MEAT, "food": MATERIAL_CATEGORY.FOOD, "fruit": MATERIAL_CATEGORY.FRUIT, "wood": MATERIAL_CATEGORY.WOOD }
    static MATERIAL_CATEGORIES_TO_STRING : Record<MATERIAL_CATEGORY, string> = ["bow-ammo", "plant", "material", "bone", "skin", "meat", "food", "fruit", "wood", ]
    static MATERIAL_MATERIAL_CATEGORY : Record<MATERIAL, MATERIAL_CATEGORY> = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.WOOD, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.MATERIAL, ]
    static MATERIAL_MATERIAL_CATEGORY_STRING : Record<MATERIAL, string> = ["bow-ammo", "bow-ammo", "plant", "material", "bone", "bone", "bone", "bone", "bone", "bone", "skin", "skin", "skin", "skin", "material", "material", "material", "material", "meat", "food", "meat", "food", "meat", "food", "meat", "meat", "fruit", "fruit", "material", "wood", "material", "material", "material", ]

    static MATERIAL_CUTTING_POWER : Record<MATERIAL, number> = [1.0, 2.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.5, 0.5, 10.0, 2.5, ]
    static MATERIAL_DENSITY : Record<MATERIAL, number> = [0.2, 0.2, 0.1, 1.0, 0.5, 0.6, 0.2, 0.5, 0.6, 0.2, 1.5, 1.2, 1.1, 0.8, 3.0, 2.4, 2.2, 1.6, 0.4, 0.6, 0.1, 0.1, 0.5, 0.7, 0.2, 0.2, 0.2, 0.3, 10.0, 1.0, 2.0, 10.0, 8.0, ]
    static MATERIAL_CUTTING_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 5.0, 5.0, 10.0, 0.9, 0.8, 0.7, 0.5, 2.0, 1.5, 1.0, 0.5, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 1.0, 2.0, 10.0, 10.0, ]
    static MATERIAL_BLUNT_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 1.0, 2.0, 10.0, 10.0, ]
    static MATERIAL_PENENTRATION_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 0.75, 0.25, 0.0, 0.0, 1.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 2.5, 5.0, 10.0, 10.0, ]
    static MATERIAL_MAGIC : Record<MATERIAL, number> = [0.0, 1.0, 0.1, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 2.0, 4.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 4.0, 2.0, 0.0, 0.1, 1.0, 0.1, 0.1, 5.0, 0.0, ]
    static MATERIAL_NAME : Record<MATERIAL, string> = ["Bone arrow", "Zaz arrow", "Cotton", "Textile", "Bone(rat, small)", "Bone(human, small)", "Bone(graci, small)", "Bone(rat)", "Bone(human)", "Bone(graci)", "Skin(rat)", "Skin(human)", "Skin(graci)", "Skin(meat ball)", "Leather(rat)", "Leather(human)", "Leather(graci)", "Leather(meat ball)", "Meat(rat)", "Fried meat(rat)", "Meat(elodino)", "Meat(meat ball)", "Meat(human)", "Fried meat(human)", "Meat(graci)", "Fried meat(graci)", "Fieberry", "Zazberry", "Zaz", "Wood(raw)", "Wood(plates)", "Hair(graci)", "Steel", ]
}

export class Material implements MaterialData {
    private _id: MATERIAL
    constructor(id: MATERIAL) {
        if (!(id in MaterialConfiguration.MATERIAL_MATERIAL_STRING)) {
            throw new Error(`Invalid material id: ${id}`);
        }
        this._id = id
    }
    static from_string(id: string) {
        if (!(id in MaterialConfiguration.MATERIALS_FROM_STRING)) {
            throw new Error(`Invalid material id: ${id}`);
        }
        return new Material(MaterialConfiguration.MATERIALS_FROM_STRING[id])
    }
    get id() {
        return this._id
    }
    get id_string() {
        return MaterialConfiguration.MATERIAL_MATERIAL_STRING[this._id]
    }
    get category() {
        return MaterialConfiguration.MATERIAL_MATERIAL_CATEGORY[this._id]
    }
    get category_string() {
        return MaterialConfiguration.MATERIAL_MATERIAL_CATEGORY_STRING[this._id]
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
    get magic() {
        return MaterialConfiguration.MATERIAL_MAGIC[this._id]
    }
    get name() {
        return MaterialConfiguration.MATERIAL_NAME[this._id]
    }
}

