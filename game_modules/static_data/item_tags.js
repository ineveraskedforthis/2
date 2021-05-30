"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loot_affixes_weight = exports.loot_chance_weight = exports.slots = exports.update_character = exports.get_power = exports.protection_affixes_effects = exports.damage_affixes_effects = exports.item_base_resists = exports.item_base_range = exports.item_base_damage = void 0;
exports.item_base_damage = {
    sword: (result) => {
        result.damage = { blunt: 5, pierce: 10, slice: 20, fire: 0 };
        return result;
    },
    empty: (result) => {
        result.damage = { blunt: 3, pierce: 1, slice: 1, fire: 0 };
        return result;
    },
    fist: (result) => {
        result.damage = { blunt: 10, pierce: 1, slice: 1, fire: 0 };
        return result;
    },
    spear: (result) => {
        result.damage = { blunt: 5, pierce: 20, slice: 5, fire: 0 };
        return result;
    },
    mace: (result) => {
        result.damage = { blunt: 60, pierce: 0, slice: 0, fire: 0 };
        return result;
    },
};
exports.item_base_range = {
    sword: (range) => {
        range += 0;
        return range;
    },
    empty: (range) => {
        range += 0;
        return range;
    },
    fist: (range) => {
        range += 0;
        return range;
    },
    spear: (range) => {
        range += 2;
        return range;
    },
    mace: (range) => {
        range += 0;
        return range;
    },
};
exports.item_base_resists = {
    empty: (resists) => {
        return resists;
    },
    rat_leather_armour: (resists) => {
        resists.pierce += 3;
        resists.slice += 3;
        return resists;
    },
    rat_fur_cap: (resists) => {
        resists.pierce += 1;
        resists.slice += 1;
        return resists;
    },
    rat_leather_leggins: (resists) => {
        resists.pierce += 2;
        resists.slice += 2;
        return resists;
    },
    rat_leather_boots: (resists) => {
        resists.slice += 1;
        return resists;
    },
    rat_leather_gauntlets: (resists) => {
        resists.slice += 1;
        return resists;
    },
    elodino_flesh_dress: (resists) => {
        return resists;
    },
    graci_hair: (resists) => {
        resists.slice += 1;
        return resists;
    }
};
exports.damage_affixes_effects = {
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
exports.slots = {
    sword: 'right_hand',
    spear: 'right_hand',
    mace: 'right_hand',
    rat_leather_armour: 'body',
    elodino_flesh_dress: 'body',
    rat_fur_cap: 'head',
    graci_hair: 'head',
    rat_leather_leggins: 'legs',
    rat_leather_gauntlets: 'arms',
    rat_leather_boots: 'foot'
};
exports.loot_chance_weight = {
    rat: {
        sword: 30,
        spear: 30,
        mace: 30,
        rat_leather_armour: 100,
        rat_fur_cap: 100,
        rat_leather_leggins: 100,
        rat_leather_gauntlets: 50,
        rat_leather_boots: 50,
    },
    elodino: {
        sword: 300,
        spear: 300,
        mace: 300,
        elodino_flesh_dress: 100
    },
    graci: {
        sword: 100,
        spear: 100,
        mace: 100,
        graci_hair: 100,
    },
    test: {}
};
exports.loot_affixes_weight = {
    sword: {
        sharp: 60,
        heavy: 100,
        hot: 30,
        precise: 50,
        power_battery: 10,
        madness: 20,
        calm: 10,
        daemonic: 1,
        notched: 60
    },
    spear: {
        heavy: 5,
        hot: 50,
        sharp: 50,
        power_battery: 50,
        precise: 50,
        calm: 10,
        daemonic: 1,
    },
    mace: {
        heavy: 150,
        hot: 50,
        precise: 50,
        power_battery: 50,
        madness: 50,
        daemonic: 1
    },
    rat_leather_armour: {
        thick: 2,
        power_battery: 1,
        hard: 1
    },
    rat_fur_cap: {
        thick: 2,
        power_battery: 1,
        hard: 1
    },
    elodino_flesh_dress: {
        power_battery: 10,
        elodino_pleasure: 2
    },
    graci_hair: {
        power_battery: 10,
        thick: 2,
        power_of_graci_beauty: 3,
    },
    rat_leather_leggins: {
        thick: 2,
        power_battery: 1
    },
    rat_leather_gauntlets: {
        thick: 2,
        power_battery: 2
    },
    rat_leather_boots: {
        thick: 2,
        power_battery: 1
    },
    empty: {},
    fist: {}
};
