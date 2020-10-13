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
        }
    },

    protection_affixes_effects: {
        thick: (resists, tier) => {
            resists.pierce += tier * 3;
            resists.slice += tier * 3;
            return resists;
        },
        power_battery: (resists, tier) => {
            return resists
        },
        hard: (resists, tier) => {
            resists.blunt += tier * 2;
            resists.pierce += tier * 2;
            resists.slice += tier * 2;
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
        rat_fur_cap: 'head',
        rat_leather_leggins: 'legs',
        rat_leather_gauntlets: 'arms',
        rat_leather_boots: 'foot'
    },

    loot_chance_weight: {
        sword: 300,
        spear: 30000,
        mace: 300,
        rat_leather_armour: 1000,
        rat_fur_cap: 1000,
        rat_leather_leggins: 1000,
        rat_leather_gauntlets: 500,
        rat_leather_boots: 500
    },

    loot_affixes_weight: {
        sword: {
            sharp: 6,
            heavy: 10,
            hot: 3,
            power_battery: 1
        },
        spear: {
            heavy: 10,
            hot: 5,
            sharp: 5,
            power_battery: 5
        },
        mace: {
            heavy: 10,
            hot: 5,
            power_battery: 5
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