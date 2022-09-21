"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base_damage = exports.ranged_base_damage = exports.base_resist = exports.Weapon = exports.Armour = exports.ITEM_MATERIAL = exports.armour_types = exports.ARMOUR_TYPE = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
var ARMOUR_TYPE;
(function (ARMOUR_TYPE) {
    ARMOUR_TYPE[ARMOUR_TYPE["BODY"] = 0] = "BODY";
    ARMOUR_TYPE[ARMOUR_TYPE["LEGS"] = 1] = "LEGS";
    ARMOUR_TYPE[ARMOUR_TYPE["ARMS"] = 2] = "ARMS";
    ARMOUR_TYPE[ARMOUR_TYPE["HEAD"] = 3] = "HEAD";
    ARMOUR_TYPE[ARMOUR_TYPE["FOOT"] = 4] = "FOOT";
})(ARMOUR_TYPE = exports.ARMOUR_TYPE || (exports.ARMOUR_TYPE = {}));
exports.armour_types = [ARMOUR_TYPE.ARMS, ARMOUR_TYPE.BODY, ARMOUR_TYPE.FOOT, ARMOUR_TYPE.HEAD, ARMOUR_TYPE.LEGS];
function protection_rating(x) {
    switch (x) {
        case ARMOUR_TYPE.BODY: return 5;
        case ARMOUR_TYPE.LEGS: return 2;
        case ARMOUR_TYPE.ARMS: return 1;
        case ARMOUR_TYPE.HEAD: return 2;
        case ARMOUR_TYPE.FOOT: return 1;
    }
}
class ITEM_MATERIAL {
    constructor(density, hardness, string_tag) {
        this.density = density;
        this.hardness = hardness;
        this.string_tag = string_tag;
    }
}
exports.ITEM_MATERIAL = ITEM_MATERIAL;
class Armour {
    constructor(data) {
        this.durability = data.durability;
        this.material = data.material;
        this.type = data.type;
        this.quality = data.quality;
        this.affixes = [...data.affixes];
        this.item_type = 'armour';
    }
    get_weight() {
        return this.material.density * protection_rating(this.type);
    }
    get_json() {
        let data = {
            durability: this.durability,
            material: this.material,
            type: this.type,
            quality: this.quality,
            affixes: this.affixes,
            item_type: this.item_type
        };
        return data;
    }
    get_tag() {
        let tag = this.material.string_tag;
        switch (this.type) {
            case ARMOUR_TYPE.ARMS: return tag + '_gloves';
            case ARMOUR_TYPE.LEGS: return tag + '_pants';
            case ARMOUR_TYPE.BODY: return tag + '_armour';
            case ARMOUR_TYPE.HEAD: return tag + '_helmet';
            case ARMOUR_TYPE.FOOT: return tag + '_boots';
        }
    }
    get_data() {
        return { tag: this.get_tag(), affixes: this.affixes.length, affixes_list: this.affixes, item_type: this.item_type };
    }
}
exports.Armour = Armour;
function shaft_length_to_number(x) {
    switch (x) {
        case 0 /* SHAFT_LEGTH.HAND */: return 0.2;
        case 1 /* SHAFT_LEGTH.SHORT */: return +0.8;
        case 2 /* SHAFT_LEGTH.LONG */: return +2.0;
    }
}
function impact_size_to_number(x) {
    switch (x) {
        case 1 /* IMPACT_SIZE.SMALL */: return 0.3;
        case 2 /* IMPACT_SIZE.MEDIUM */: return 1.0;
        case 3 /* IMPACT_SIZE.LARGE */: return 1.5;
    }
}
class Weapon {
    constructor(data) {
        this.durability = data.durability;
        this.shaft_length = data.shaft_length;
        this.shaft_material = data.shaft_material;
        this.shaft_weight = shaft_length_to_number(this.shaft_length) * this.shaft_material.density;
        this.impact_size = data.impact_size;
        this.impact_material = data.impact_material;
        this.impact_type = data.impact_type;
        this.impact_quality = data.impact_quality;
        this.impact_weight = impact_size_to_number(this.impact_size) * this.impact_material.density;
        this.affixes = [...data.affixes];
        if (data.ranged == true) {
            this.ranged = true;
        }
        else {
            this.ranged = false;
        }
        this.item_type = 'weapon';
    }
    get_weight() {
        return this.shaft_weight + this.impact_weight;
    }
    get_length() {
        let length = 0;
        return impact_size_to_number(this.impact_size) + shaft_length_to_number(this.shaft_length);
    }
    get_weapon_type() {
        switch (this.shaft_length) {
            case 2 /* SHAFT_LEGTH.LONG */: return "polearms" /* WEAPON_TYPE.POLEARMS */;
            case 1 /* SHAFT_LEGTH.SHORT */: return "polearms" /* WEAPON_TYPE.POLEARMS */;
            case 0 /* SHAFT_LEGTH.HAND */: switch (this.impact_size) {
                case 1 /* IMPACT_SIZE.SMALL */: return "onehand" /* WEAPON_TYPE.ONEHAND */;
                case 2 /* IMPACT_SIZE.MEDIUM */: return "onehand" /* WEAPON_TYPE.ONEHAND */;
                case 3 /* IMPACT_SIZE.LARGE */: return "twohanded" /* WEAPON_TYPE.TWOHANDED */;
            }
        }
        return "noweapon" /* WEAPON_TYPE.NOWEAPON */;
    }
    get_json() {
        let data = {
            durability: this.durability,
            shaft_length: this.shaft_length,
            shaft_material: this.shaft_material,
            impact_size: this.impact_size,
            impact_material: this.impact_material,
            impact_type: this.impact_type,
            impact_quality: this.impact_quality,
            affixes: this.affixes,
            item_type: this.item_type,
            ranged: this.ranged
        };
        return data;
    }
    get_tag() {
        let imp_type = this.impact_type;
        if (this.ranged) {
            return 'bow';
        }
        switch (imp_type) {
            case 0 /* IMPACT_TYPE.POINT */: {
                if (this.impact_material.string_tag == 'rat_bone')
                    return 'bone_spear';
                return 'spear';
            }
            case 2 /* IMPACT_TYPE.HEAD */: return 'mace';
            case 1 /* IMPACT_TYPE.EDGE */: return 'sword';
        }
    }
    get_data() {
        return { tag: this.get_tag(), affixes: this.affixes.length, affixes_list: this.affixes, item_type: this.item_type };
    }
}
exports.Weapon = Weapon;
function base_resist(result, item) {
    let temp_protection = protection_rating(item.type);
    let temp_hardness = item.material.hardness;
    result.blunt = result.blunt + temp_protection * temp_hardness;
    result.slice = result.slice + temp_protection * temp_hardness * 2;
    result.pierce = result.pierce + temp_protection * temp_hardness;
    return result;
}
exports.base_resist = base_resist;
function ranged_base_damage(result, arrow_type) {
    if (arrow_type == materials_manager_1.ARROW_BONE) {
        result.damage.pierce += 10;
    }
    return result;
}
exports.ranged_base_damage = ranged_base_damage;
function base_damage(result, item) {
    switch (item.impact_type) {
        case 1 /* IMPACT_TYPE.EDGE */: {
            let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight);
            result.damage.slice = effective_weight * item.impact_quality / 100;
            result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100;
        }
        case 0 /* IMPACT_TYPE.POINT */: {
            let effective_weight = (item.impact_weight + item.shaft_weight);
            result.damage.pierce = 2 * effective_weight * item.impact_quality / 100;
            result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100;
        }
        case 2 /* IMPACT_TYPE.HEAD */: {
            let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight);
            result.damage.blunt = effective_weight;
        }
    }
    return result;
}
exports.base_damage = base_damage;
// export const item_base_damage = {
//         sword: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 10, slice: 20, fire: 0}
//             return result
//         },
//         empty: (result:AttackResult) => {
//             result.damage = {blunt: 3, pierce: 1, slice: 1, fire: 0}
//             return result
//         },
//         fist: (result:AttackResult) => {
//             result.damage = {blunt: 10, pierce: 1, slice: 1, fire: 0};
//             return result
//         },
//         spear: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 20, slice: 5, fire: 0}
//             return result
//         },
//         mace: (result:AttackResult) => {
//             result.damage = {blunt: 60, pierce: 0, slice: 0, fire: 0}
//             return result
//         },
//     }
