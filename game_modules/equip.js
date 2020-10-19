var {item_base_damage, item_base_range, item_base_resists, damage_affixes_effects, protection_affixes_effects, get_power, slots, update_character} = require("./item_tags.js");
let items = require("./weapons.js");
const { empty } = require("./weapons.js");
const item_tags = require("./item_tags.js");

const EQUIP_TAGS = ['right_hand', 'body', 'legs', 'foot', 'head', 'arms']

module.exports = class Equip {
    constructor() {
        this.data = {
            right_hand: empty,
            body: empty,
            legs: empty,
            foot: empty,
            head: empty,
            arms: empty,
            backpack: []
        }
    }

    

    get_weapon_range(range) {
        let right_hand = this.data.right_hand;
        return  item_base_range[right_hand.tag](range);
    }

    get_weapon_damage(result) {
        let right_hand = this.data.right_hand;
        result = item_base_damage[right_hand.tag](result);
        for (let i=0; i<right_hand.affixes; i++) {
            let affix = right_hand['a' + i];
            result = damage_affixes_effects[affix.tag](result, affix.tier);
        }
        return result
    }

    get_item_power(item) {
        let result = 0;
        for (let i = 0; i < item.affixes; i++) {
            let affix = item['a' + i];
            let f = get_power[affix.tag];
            if (f != undefined) {
                result = f(result, affix.tier);
            }
        }
        return result;
    }

    get_item_resists(item, resists) {
        let base = item_base_resists[item.tag];
        if (base != undefined) {
            resists = item_base_resists[item.tag](resists);
        }        
        for (let i = 0; i < item.affixes; i++) {
            let affix = item['a' + i];
            let f = protection_affixes_effects[affix.tag];
            if (f != undefined) {
                resists = f(resists, affix.tier);
            }
        }
        return resists;
    }

    get_magic_power() {
        let result = 0;
        for (let i of EQUIP_TAGS) {
            result += this.get_item_power(this.data[i])
        }
        return result
    }

    update(pool, agent) {
        for (let i of EQUIP_TAGS) {
            this.get_item_update(this.data[i], pool, agent);
        }
    }

    get_item_update(item, pool, agent) {
        for (let i = 0; i < item.affixes; i++) {
            let affix = item['a' + i];
            let f = update_character[affix.tag];
            if (f != undefined) {
                f(pool, agent, affix.tier);
            }
        }
    }

    equip(index) {
        let backpack = this.data.backpack;
        if (backpack[index] != undefined) {
            let slot = slots[backpack[index].tag];
            let tmp = this.data[slot];
            this.data[slot] = backpack[index]
            if (tmp.tag != 'empty' & tmp.tag != 'fist') {
                backpack[index] = tmp;
            } else {
                backpack[index] = undefined;
            }
        }
    }

    unequip(tag) {
        if (!(EQUIP_TAGS.includes(tag))) {
            return true
        }
        let item = this.data[tag];
        console.log(item)
        if ((item.tag == 'empty') || (item.tag == 'fist')) {
            return
        }
        if (tag == 'right_hand') {
            this.data[tag] = items.fist;
        } else {
            this.data[tag] = empty;   
        }             
        if ((item.tag != 'empty') || (item.tag != 'fist')) {
            this.add_item(item);
        }
    }

    get_resists() {
        let resists = {blunt: 0, pierce: 0, slice: 0, fire: 0};
        for (let i of EQUIP_TAGS) {
            resists = this.get_item_resists(this.data[i], resists)
        }
        return resists
    }

    get_json() {
        return this.data;
    }

    load_from_json(json) {
        this.data = json;
    }

    add_item(item) {
        if (item != undefined) {
            this.data.backpack.push(item);
        }
    }
}