"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_character = exports.get_power = exports.protection_affixes_effects = exports.damage_affixes_effects = exports.attack_affixes_effects = exports.roll_affix_armour = exports.roll_affix_weapon = exports.enchant_item = exports.get_potential_affix_armour = exports.get_potential_affix_weapon = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const base_values_1 = require("../items/base_values");
function get_potential_affix_weapon(enchant_rating, item) {
    let potential_affix = [];
    // checking for phys damage mods
    if ((base_values_1.BaseDamage[item.model_tag].pierce > 0) || (base_values_1.BaseDamage[item.model_tag].slice > 0)) {
        potential_affix.push({ tag: 'sharp', weight: 20 });
        potential_affix.push({ tag: 'notched', weight: 2 });
    }
    if ((base_values_1.BaseDamage[item.model_tag].slice > 0) || (base_values_1.BaseDamage[item.model_tag].blunt > 0)) {
        potential_affix.push({ tag: 'heavy', weight: 10 });
    }
    // adding universal mods
    if (enchant_rating > 20) {
        potential_affix.push({ tag: 'hot', weight: 1 });
        potential_affix.push({ tag: 'of_power', weight: 1 });
        potential_affix.push({ tag: 'precise', weight: 5 });
    }
    // extra mods
    if (enchant_rating > 150) {
        potential_affix.push({ tag: 'daemonic', weight: 1 });
        potential_affix.push({ tag: 'of_madness', weight: 1 });
    }
    return potential_affix;
}
exports.get_potential_affix_weapon = get_potential_affix_weapon;
function get_potential_affix_armour(enchant_rating, item) {
    let potential_affix = [];
    //universal    
    potential_affix.push({ tag: 'thick', weight: 25 });
    potential_affix.push({ tag: 'layered', weight: 25 });
    potential_affix.push({ tag: 'hard', weight: 25 });
    // special when you reach 
    if (enchant_rating > 30) {
        potential_affix.push({ tag: 'of_heat', weight: 3 });
        potential_affix.push({ tag: 'of_power', weight: 3 });
        potential_affix.push({ tag: 'of_protection', weight: 3 });
    }
    // for local creatures you have better chances for special affixes
    // if your enchanting rating is high
    if (enchant_rating > 60) {
        if (base_values_1.ModelToMaterial[item.model_tag].string_tag == materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH).string_tag) {
            potential_affix.push({ tag: 'of_heat', weight: 5 });
            potential_affix.push({ tag: 'of_power', weight: 5 });
            potential_affix.push({ tag: 'of_protection', weight: 5 });
            potential_affix.push({ tag: 'of_painful_protection', weight: 1 });
            potential_affix.push({ tag: 'of_elodino_pleasure', weight: 10 });
            potential_affix.push({ tag: 'of_elder_beast', weight: 1 });
        }
    }
    if (enchant_rating > 100) {
        if (base_values_1.ModelToMaterial[item.model_tag].string_tag == materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR).string_tag) {
            potential_affix.push({ tag: 'of_heat', weight: 5 });
            potential_affix.push({ tag: 'of_power', weight: 5 });
            potential_affix.push({ tag: 'of_protection', weight: 5 });
            potential_affix.push({ tag: 'of_painful_protection', weight: 1 });
            potential_affix.push({ tag: 'of_graci_beauty', weight: 10 });
            potential_affix.push({ tag: 'of_elder_beast', weight: 1 });
        }
    }
    return potential_affix;
}
exports.get_potential_affix_armour = get_potential_affix_armour;
function enchant_item(enchant_rating, item, potential_affix) {
    // enchant success
    let current_affixes = item.affixes.length;
    let difficulty = 10 * current_affixes * current_affixes;
    let luck = Math.random();
    if (((luck + 1) * enchant_rating) < difficulty) {
        return 'fail';
    }
    //selection of the affix
    let total_weight = 0;
    for (let aff of potential_affix) {
        total_weight += aff.weight;
    }
    let rolled_position = Math.random() * total_weight;
    let current_weight = 0;
    for (let aff of potential_affix) {
        current_weight = current_weight + aff.weight;
        if (current_weight >= rolled_position) {
            item.affixes.push({ tag: aff.tag });
            return 'ok';
        }
    }
    return '???';
}
exports.enchant_item = enchant_item;
function roll_affix_weapon(enchant_rating, item) {
    let potential_affix = get_potential_affix_weapon(enchant_rating, item);
    return enchant_item(enchant_rating, item, potential_affix);
}
exports.roll_affix_weapon = roll_affix_weapon;
function roll_affix_armour(enchant_rating, item) {
    let potential_affix = get_potential_affix_armour(enchant_rating, item);
    return enchant_item(enchant_rating, item, potential_affix);
}
exports.roll_affix_armour = roll_affix_armour;
function dummy_attack_mod(result) {
    return result;
}
function dummy_damage_mod(result) {
    return result;
}
exports.attack_affixes_effects = {
    precise: (result) => {
        result.attack_skill += 10;
        return result;
    },
    of_madness: (result) => {
        result.attacker_status_change.rage += 50;
        return result;
    },
    daemonic: (result) => {
        result.attacker_status_change.stress += 100;
        result.attacker_status_change.rage += 100;
        result.attacker_status_change.fatigue += 100;
        return result;
    },
    notched: (result) => {
        result.attacker_status_change.blood += 10;
        result.defender_status_change.blood += 10;
        return result;
    },
    of_power: dummy_attack_mod
};
exports.damage_affixes_effects = {
    sharp: (damage) => {
        damage.pierce += 5;
        damage.slice += 5;
        return damage;
    },
    heavy: (damage) => {
        damage.blunt += 5;
        return damage;
    },
    hot: (damage) => {
        damage.fire += 10;
        return damage;
    },
    precise: (damage) => {
        damage.pierce += 10;
        return damage;
    },
    of_madness: (damage) => {
        damage.slice += 50;
        damage.pierce += 50;
        damage.blunt += 50;
        return damage;
    },
    daemonic: (damage) => {
        damage.fire += 300;
        return damage;
    },
    notched: (damage) => {
        damage.pierce += 7;
        damage.slice += 7;
        return damage;
    },
    of_power: (damage) => {
        damage.fire += 1;
        return damage;
    }
};
exports.protection_affixes_effects = {
    thick: (resists) => {
        resists.fire += 3;
        resists.pierce += 5;
        resists.slice += 10;
        return resists;
    },
    layered: (resists) => {
        resists.fire += 3;
        resists.pierce += 10;
        return resists;
    },
    of_heat: (resists) => {
        resists.fire += 10;
        return resists;
    },
    of_power: dummy_damage_mod,
    hard: (resists) => {
        resists.fire += 2;
        resists.blunt += 3;
        resists.pierce += 3;
        resists.slice += 3;
        return resists;
    },
    of_elder_beast: (resists) => {
        resists.fire += 5;
        resists.blunt += 5;
        resists.pierce += 5;
        resists.slice += 5;
        return resists;
    },
    of_elodino_pleasure: (resists) => {
        resists.blunt += -2;
        resists.pierce += -2;
        resists.slice += -2;
        resists.fire += -2;
        return resists;
    },
    of_protection: (resists) => {
        resists.blunt += +2;
        resists.pierce += +2;
        resists.slice += +2;
        resists.fire += +2;
        return resists;
    },
    of_painful_protection: (resists) => {
        resists.blunt += +5;
        resists.pierce += +5;
        resists.slice += +5;
        resists.fire += +5;
        return resists;
    },
    of_graci_beauty: dummy_damage_mod,
};
exports.get_power = {
    of_power: (data) => {
        data += 2;
        return data;
    },
    of_elodino_pleasure: (data) => {
        data += 5;
        return data;
    },
    of_graci_beauty: (data) => {
        data += 5;
        return data;
    }
};
exports.update_character = {
    of_elder_beast: (agent) => {
        agent.change('stress', 5);
        agent.change('rage', 5);
        agent.change('hp', 1);
    },
    of_graci_beauty: (agent) => {
        agent.change('stress', 1);
    },
    of_elodino_pleasure: (agent) => {
        agent.change('stress', 1);
    },
    of_painful_protection: (agent) => {
        agent.change('hp', -1);
    }
};
