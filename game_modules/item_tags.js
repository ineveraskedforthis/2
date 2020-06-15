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
        }
    },
    affixes_effects: {
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
    }
}