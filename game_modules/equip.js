var {item_base_damage, affixes_effects} = require("./item_tags.js")

module.exports = class Equip {
    constructor() {
        this.data = {
            right_hand: {tag: 'empty', affixes: 0},
            backpack: []
        }
    }

    get_weapon_range() {
        return 1;
    }

    get_weapon_damage(result) {
        let right_hand = this.data.right_hand;
        result = item_base_damage[right_hand.tag](result);
        for (let i=0; i<right_hand.affixes; i++) {
            let affix = right_hand['a' + i];
            result = affixes_effects[affix.tag](result, affix.tier);
        }
        return result
    }

    get_resists() {
        return {blunt: 0, pierce: 0, slice: 0, fire: 0};
    }

    get_json() {
        return this.data;
    }

    load_from_json(json) {
        this.data = json;
    }

    add_item(item) {
        this.data.backpack.push(item);
    }
}