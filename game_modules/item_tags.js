module.exports = {
    item_base_damage: {
        sword: (result) => {
            result.damage = {blunt: 5, pierce: 10, slice: 20, fire: 0}
            return result
        },
        empty: (result) => {
            result.damage = {blunt: 3, pierce: 1, slice: 1, fire: 0}
            return result
        },
        fist: (result) => {
            result.damage = {blunt: 10, pierce: 1, slice: 1, fire: 0};
            return result
        },
        spear: (result) => {
            result.damage = {blunt: 5, pierce: 20, slice: 5, fire: 0}
            return result
        },
        mace: (result) => {
            result.damage = {blunt: 60, pierce: 0, slice: 0, fire: 0}
            return result
        },
    },

    item_base_range: {
        sword: (range) => {
            range += 0;
            return range
        },
        empty: (range) => {
            range += 0;
            return range
        },
        fist: (range) => {
            range += 0;
            return range
        },
        spear: (range) => {
            range += 2;
            return range
        },
        mace: (range) => {
            range += 0;
            return range
        },
    },

    item_base_resists : {
        empty: (resists) => {
            return resists
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
    },

    damage_affixes_effects: {
        sharp: (result, tier) => {
            result.damage.pierce += tier * 5;
            result.damage.slice += tier * 5
            return result
        },
        heavy: (result, tier) => {
            result.damage.blunt += tier * 5;
            return result
        },
        hot: (result, tier) => {
            result.damage.fire += tier * 10
            return result
        },
        precise: (result, tier) => {
            result.chance_to_hit += tier * 0.02
            return result
        },
        madness: (result, tier) => {
            result.damage.blunt +=  20 * tier;
            result.rage_gain +=      2 * tier;
            return result
        },
        calm: (result, tier) => {
            result.rage_gain +=     -1 * tier;
            return result
        },
        daemonic: (result, tier) => {
            result.damage.fire +=  300 * tier;
            result.stress_gain +=   90;
            result.rage_gain +=    100;
            return result
        },
        notched: (result, tier) => {
            result.damage.pierce +=  7 * tier;
            result.damage.slice +=   7 * tier;
            result.blood_gain +=     2 * tier;
            return result
        }
    },

    protection_affixes_effects: {
        thick: (resists, tier) => {
            resists.pierce += tier * 1;
            resists.slice += tier * 2;
            return resists;
        },
        power_battery: (resists, tier) => {
            return resists
        },
        hard: (resists, tier) => {
            resists.blunt += tier * 1;
            resists.pierce += tier * 1;
            resists.slice += tier * 1;
            return resists
        }
    },

    get_power: {
        power_battery: (data, tier) => {
            data += tier
            return data
        }
    },

    slots: {
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
    },

    loot_chance_weight: {
        rat: {
            sword:                     300,
            spear:                     300,
            mace:                      300,
            rat_leather_armour:       1000,
            rat_fur_cap:              1000,
            rat_leather_leggins:      1000,
            rat_leather_gauntlets:     500,
            rat_leather_boots:         500,
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
        test: {

        }
    },

    loot_affixes_weight: {
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
            power_battery: 10
        },
        graci_hair: {
            power_battery: 10,
            thick: 2,
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
        }
    }
}