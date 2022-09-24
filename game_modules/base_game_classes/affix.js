"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_character = exports.get_power = exports.protection_affixes_effects = exports.damage_affixes_effects = exports.roll_affix_armour = exports.roll_affix_weapon = exports.enchant_item = exports.get_potential_affix_armour = exports.get_potential_affix_weapon = exports.affix = void 0;
const item_tags_1 = require("../static_data/item_tags");
class affix {
    constructor(tag, tier) {
        this.tag = tag;
        this.tier = tier;
    }
}
exports.affix = affix;
function get_potential_affix_weapon(enchant_rating, item) {
    let potential_affix = [];
    potential_affix.push({ tag: 'hot', weight: 1 });
    potential_affix.push({ tag: 'of_power', weight: 1 });
    if ((item.impact_type == item_tags_1.IMPACT_TYPE.POINT) || (item.impact_type == item_tags_1.IMPACT_TYPE.EDGE)) {
        potential_affix.push({ tag: 'sharp', weight: 10 });
    }
    if ((item.impact_type == item_tags_1.IMPACT_TYPE.EDGE) || (item.impact_type == item_tags_1.IMPACT_TYPE.HEAD)) {
        potential_affix.push({ tag: 'sharp', weight: 6 });
        potential_affix.push({ tag: 'heavy', weight: 5 });
        potential_affix.push({ tag: 'notched', weight: 2 });
    }
    potential_affix.push({ tag: 'precise', weight: 5 });
    if (enchant_rating > 20) {
        potential_affix.push({ tag: 'daemonic', weight: 1 });
        potential_affix.push({ tag: 'of_madness', weight: 1 });
    }
    return potential_affix;
}
exports.get_potential_affix_weapon = get_potential_affix_weapon;
function get_potential_affix_armour(enchant_rating, item) {
    return [{ tag: 'thick', weight: 10 }, { tag: 'layered', weight: 10 }, { tag: 'hard', weight: 10 }, { tag: 'of_heat', weight: 3 }, { tag: 'of_power', weight: 3 }, { tag: 'of_protection', weight: 1 }, { tag: 'of_painful_protection', weight: 1 }];
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
            item.affixes.push(new affix(aff.tag, 1));
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
function dummy_attack_mod(result, tier) {
    return result;
}
function dummy_damage_mod(result, tier) {
    return result;
}
exports.damage_affixes_effects = {
    thick: dummy_attack_mod,
    of_elodino_pleasure: dummy_attack_mod,
    hard: dummy_attack_mod,
    of_graci_beauty: dummy_attack_mod,
    of_painful_protection: dummy_attack_mod,
    of_elder_beast: dummy_attack_mod,
    of_protection: dummy_attack_mod,
    layered: dummy_attack_mod,
    of_heat: dummy_attack_mod,
    sharp: (result, tier) => {
        result.damage.pierce += tier * 5;
        result.damage.slice += tier * 5;
        return result;
    },
    heavy: (result, tier) => {
        result.damage.blunt += tier * 5;
        return result;
    },
    hot: (result, tier) => {
        result.damage.fire += tier * 10;
        return result;
    },
    precise: (result, tier) => {
        result.chance_to_hit += tier * 0.02;
        return result;
    },
    of_madness: (result, tier) => {
        result.damage.blunt += 20 * tier;
        result.attacker_status_change.rage += 2 * tier;
        return result;
    },
    calm: (result, tier) => {
        result.attacker_status_change.rage += -1 * tier;
        return result;
    },
    daemonic: (result, tier) => {
        result.damage.fire += 300 * tier;
        result.attacker_status_change.stress += 90;
        result.attacker_status_change.rage += 100;
        return result;
    },
    notched: (result, tier) => {
        result.damage.pierce += 7 * tier;
        result.damage.slice += 7 * tier;
        result.attacker_status_change.blood += 2 * tier;
        return result;
    },
    of_power: (result, tier) => {
        result.damage.blunt += 1 * tier;
        return result;
    }
};
exports.protection_affixes_effects = {
    sharp: dummy_damage_mod,
    hot: dummy_damage_mod,
    notched: dummy_damage_mod,
    daemonic: dummy_damage_mod,
    heavy: dummy_damage_mod,
    precise: dummy_damage_mod,
    of_madness: dummy_damage_mod,
    calm: dummy_damage_mod,
    thick: (resists, tier) => {
        resists.pierce += tier * 1;
        resists.slice += tier * 2;
        return resists;
    },
    layered: (resists, tier) => {
        resists.pierce += tier * 3;
        return resists;
    },
    of_heat: (resists, tier) => {
        resists.fire += tier * 3;
        return resists;
    },
    of_power: dummy_damage_mod,
    hard: (resists, tier) => {
        resists.blunt += tier * 1;
        resists.pierce += tier * 1;
        resists.slice += tier * 1;
        return resists;
    },
    of_elder_beast: (resists, tier) => {
        resists.blunt += 2 * tier;
        resists.pierce += 2 * tier;
        resists.slice += 2 * tier;
        return resists;
    },
    of_elodino_pleasure: (resists, tier) => {
        resists.blunt += -2 * tier;
        resists.pierce += -2 * tier;
        resists.slice += -2 * tier;
        resists.fire += -2 * tier;
        return resists;
    },
    of_protection: (resists, tier) => {
        resists.blunt += +2 * tier;
        resists.pierce += +2 * tier;
        resists.slice += +2 * tier;
        resists.fire += +2 * tier;
        return resists;
    },
    of_painful_protection: (resists, tier) => {
        resists.blunt += +5 * tier;
        resists.pierce += +5 * tier;
        resists.slice += +5 * tier;
        resists.fire += +5 * tier;
        return resists;
    },
    of_graci_beauty: dummy_damage_mod,
};
exports.get_power = {
    of_power: (data, tier) => {
        data += tier * 2;
        return data;
    },
    of_elodino_pleasure: (data, tier) => {
        data += tier * 4;
        return data;
    },
    of_graci_beauty: (data, tier) => {
        data += tier * 2;
        return data;
    }
};
exports.update_character = {
    of_elder_beast: (agent, tier) => {
        agent.change_stress(5 * tier);
        agent.change_rage(5 * tier);
        agent.change_hp(1 * tier);
    },
    of_graci_beauty: (agent, tier) => {
        agent.change_stress(1 * tier);
    },
    of_painful_protection: (agent, tier) => {
        agent.change_hp(-1 * tier);
    }
};
