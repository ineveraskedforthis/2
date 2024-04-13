const enum MATERIAL {
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
}
const enum MATERIAL_CATEGORY {
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




interface MaterialData {
    readonly id: MATERIAL
    readonly CATEGORY: MATERIAL_CATEGORY
    readonly tag: string
    readonly category: string
    readonly cutting_power: number
    readonly density: number
    readonly cutting_protection: number
    readonly blunt_protection: number
    readonly penentration_protection: number
    readonly magic: number
}
export class MaterialConfiguration {
    private static _instance: MaterialConfiguration;
    static MATERIALS: MATERIAL[] = [MATERIAL.ARROW_BONE, MATERIAL.ARROW_ZAZ, MATERIAL.COTTON, MATERIAL.TEXTILE, MATERIAL.SMALL_BONE_RAT, MATERIAL.SMALL_BONE_HUMAN, MATERIAL.SMALL_BONE_GRACI, MATERIAL.BONE_RAT, MATERIAL.BONE_HUMAN, MATERIAL.BONE_GRACI, MATERIAL.SKIN_RAT, MATERIAL.SKIN_HUMAN, MATERIAL.SKIN_GRACI, MATERIAL.SKIN_BALL, MATERIAL.LEATHER_RAT, MATERIAL.LEATHER_HUMAN, MATERIAL.LEATHER_GRACI, MATERIAL.LEATHER_BALL, MATERIAL.MEAT_RAT, MATERIAL.MEAT_RAT_FRIED, MATERIAL.MEAT_ELODINO, MATERIAL.MEAT_BALL, MATERIAL.MEAT_HUMAN, MATERIAL.MEAT_HUMAN_FRIED, MATERIAL.MEAT_GRACI, MATERIAL.MEAT_GRACI_FRIED, MATERIAL.BERRY_FIE, MATERIAL.BERRY_ZAZ, MATERIAL.ZAZ, MATERIAL.WOOD_RED, MATERIAL.WOOD_RED_PLATE, ]
    static MATERIAL_CATEGORIES: MATERIAL_CATEGORY[] = [MATERIAL_CATEGORY.BOW_AMMO, MATERIAL_CATEGORY.PLANT, MATERIAL_CATEGORY.MATERIAL, MATERIAL_CATEGORY.BONE, MATERIAL_CATEGORY.SKIN, MATERIAL_CATEGORY.MEAT, MATERIAL_CATEGORY.FOOD, MATERIAL_CATEGORY.FRUIT, MATERIAL_CATEGORY.WOOD, ]
    static MATERIAL_STRING : Record<MATERIAL, string> = ["arrow-bone", "arrow-zaz", "cotton", "textile", "small-bone-rat", "small-bone-human", "small-bone-graci", "bone-rat", "bone-human", "bone-graci", "skin-rat", "skin-human", "skin-graci", "skin-ball", "leather-rat", "leather-human", "leather-graci", "leather-ball", "meat-rat", "meat-rat-fried", "meat-elodino", "meat-ball", "meat-human", "meat-human-fried", "meat-graci", "meat-graci-fried", "berry-fie", "berry-zaz", "zaz", "wood-red", "wood-red-plate", ]
    static MATERIAL_CATEGORY_STRING : Record<MATERIAL, string> = ["bow-ammo", "bow-ammo", "plant", "material", "bone", "bone", "bone", "bone", "bone", "bone", "skin", "skin", "skin", "skin", "material", "material", "material", "material", "meat", "food", "meat", "food", "meat", "food", "meat", "meat", "fruit", "fruit", "material", "wood", "material", ]
    static MATERIAL_CUTTING_POWER : Record<MATERIAL, number> = [1.0, 2.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.5, 0.5, ]
    static MATERIAL_DENSITY : Record<MATERIAL, number> = [0.2, 0.2, 0.1, 1.0, 0.5, 0.6, 0.2, 0.5, 0.6, 0.2, 1.5, 1.2, 1.1, 0.8, 3.0, 2.4, 2.2, 1.6, 0.4, 0.6, 0.1, 0.1, 0.5, 0.7, 0.2, 0.2, 0.2, 0.3, 5.0, 1.0, 2.0, ]
    static MATERIAL_CUTTING_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 5.0, 5.0, 10.0, 0.9, 0.8, 0.7, 0.5, 2.0, 1.5, 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 1.0, 2.0, ]
    static MATERIAL_BLUNT_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 1.0, 2.0, ]
    static MATERIAL_PENENTRATION_PROTECTION : Record<MATERIAL, number> = [0.0, 0.0, 0.2, 1.0, 0.5, 0.5, 0.5, 3.0, 4.0, 10.0, 0.75, 0.25, 0.0, 0.0, 1.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 2.5, 5.0, ]
    static MATERIAL_MAGIC : Record<MATERIAL, number> = [0.0, 1.0, 0.1, 0.1, 0.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 0.0, 1.0, 2.0, 0.0, 0.0, 2.0, 4.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 4.0, 2.0, 0.0, 0.1, 1.0, 0.1, 0.1, ]
}

export class FatMaterial implements MaterialData {
    private _id: MATERIAL
    constructor(id: MATERIAL) {
        if (!(id in MaterialConfiguration.MATERIAL_STRING)) {
            throw new Error(`Invalid material id: $<built-in function id>`);
        }
        this._id = id
    }
    get tag() {
        return MaterialConfiguration.MATERIAL_STRING[this._id]
    }
    get category() {
        return MaterialConfiguration.MATERIAL_CATEGORY_STRING[this._id]
    }
    get id() {
        return MaterialConfiguration.MATERIALS[this._id]
    }
    get CATEGORY() {
        return MaterialConfiguration.MATERIAL_CATEGORIES[this._id]
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
}

