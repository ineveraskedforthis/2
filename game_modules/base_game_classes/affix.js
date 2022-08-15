"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_character = exports.get_power = exports.protection_affixes_effects = exports.damage_affixes_effects = exports.affix = void 0;
class affix {
    constructor(tag, tier) {
        this.tag = tag;
        this.tier = tier;
    }
}
exports.affix = affix;
function dummy_attack_mod(result, tier) {
    return result;
}
function dummy_damage_mod(result, tier) {
    return result;
}
exports.damage_affixes_effects = {
    thick: dummy_attack_mod,
    elodino_pleasure: dummy_attack_mod,
    hard: dummy_attack_mod,
    power_of_graci_beauty: dummy_attack_mod,
    pain_shell: dummy_attack_mod,
    elder_beast_skin: dummy_attack_mod,
    protection: dummy_attack_mod,
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
    madness: (result, tier) => {
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
    power_battery: (result, tier) => {
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
    madness: dummy_damage_mod,
    calm: dummy_damage_mod,
    thick: (resists, tier) => {
        resists.pierce += tier * 1;
        resists.slice += tier * 2;
        return resists;
    },
    power_battery: (resists, tier) => {
        return resists;
    },
    hard: (resists, tier) => {
        resists.blunt += tier * 1;
        resists.pierce += tier * 1;
        resists.slice += tier * 1;
        return resists;
    },
    elder_beast_skin: (resists, tier) => {
        resists.blunt += 2 * tier;
        resists.pierce += 2 * tier;
        resists.slice += 2 * tier;
        return resists;
    },
    elodino_pleasure: (resists, tier) => {
        resists.blunt += -2 * tier;
        resists.pierce += -2 * tier;
        resists.slice += -2 * tier;
        resists.fire += -2 * tier;
        return resists;
    },
    protection: (resists, tier) => {
        resists.blunt += +2 * tier;
        resists.pierce += +2 * tier;
        resists.slice += +2 * tier;
        resists.fire += +2 * tier;
        return resists;
    },
    pain_shell: (resists, tier) => {
        resists.blunt += +5 * tier;
        resists.pierce += +5 * tier;
        resists.slice += +5 * tier;
        resists.fire += +5 * tier;
        return resists;
    },
    power_of_graci_beauty: (resists, tier) => {
        return resists;
    },
};
exports.get_power = {
    power_battery: (data, tier) => {
        data += tier;
        return data;
    },
    elodino_pleasure: (data, tier) => {
        data += tier * 2;
        return data;
    },
    power_of_graci_beauty: (data, tier) => {
        data += tier * 2;
        return data;
    }
};
exports.update_character = {
    elder_beast_skin: (agent, tier) => {
        agent.change_stress(5 * tier);
        agent.change_rage(5 * tier);
        agent.change_hp(1 * tier);
    },
    power_of_graci_beauty: (agent, tier) => {
        agent.change_stress(1 * tier);
    },
    pain_shell: (agent, tier) => {
        agent.change_hp(-1 * tier);
    }
};
