"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const types_1 = require("../../types");
const affix_1 = require("../affix");
const system_1 = require("../items/system");
// import { AttackResult } from "../misc/attack_result";
const damage_types_1 = require("../misc/damage_types");
const inventory_1 = require("./inventory");
class EquipData {
    constructor() {
        // explicitly setting to undefined
        this.weapon = undefined;
        this.secondary = undefined;
        this.armour = {};
        this.backpack = new inventory_1.Inventory();
    }
    get_json() {
        let result = {
            weapon: this.weapon?.json(),
            secondary: this.secondary?.json(),
            armour: {},
            backpack: {}
        };
        for (let tag of types_1.armour_slots) {
            result.armour[tag] = this.armour[tag]?.json();
        }
        result.backpack = this.backpack.get_json();
        return result;
    }
    load_json(json) {
        if (json.weapon != undefined) {
            this.weapon = system_1.ItemSystem.create(json.weapon);
        }
        if (json.secondary != undefined) {
            this.secondary = system_1.ItemSystem.create(json.secondary);
        }
        for (let tag of types_1.armour_slots) {
            const tmp = json.armour[tag];
            if (tmp != undefined) {
                this.armour[tag] = system_1.ItemSystem.create(tmp);
            }
        }
        this.backpack.load_from_json(json.backpack);
    }
}
class Equip {
    constructor() {
        this.data = new EquipData();
        this.changed = false;
    }
    transfer_all(target) {
        this.unequip('weapon');
        this.unequip_secondary();
        for (let tag of types_1.armour_slots) {
            this.unequip(tag);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack);
    }
    get_weapon_range() {
        let right_hand = this.data.weapon;
        if (right_hand == undefined) {
            return undefined;
        }
        return right_hand.range;
    }
    get_melee_damage(type) {
        let damage = new damage_types_1.Damage();
        const item = this.data.weapon;
        if (item == undefined)
            return undefined;
        return system_1.ItemSystem.melee_damage(item, type);
    }
    get_ranged_damage() {
        let weapon = this.data.weapon;
        if (weapon == undefined)
            return undefined;
        return system_1.ItemSystem.ranged_damage(weapon);
    }
    get_magic_power() {
        let result = 0;
        result += system_1.ItemSystem.power(this.data.weapon);
        result += system_1.ItemSystem.power(this.data.secondary);
        for (let tag of types_1.armour_slots) {
            result += system_1.ItemSystem.power(this.data.armour[tag]);
        }
        return result;
    }
    get_phys_power_modifier() {
        return 1;
    }
    get_magic_power_modifier() {
        return 1;
    }
    update(agent) {
        for (let i of types_1.armour_slots) {
            this.item_update(this.data.armour[i], agent);
        }
    }
    item_update(item, agent) {
        if (item == undefined) {
            return;
        }
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = affix_1.update_character[affix.tag];
            if (f != undefined) {
                f(agent);
            }
        }
    }
    equip_armour(index) {
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item != undefined) {
            let slot = item.slot;
            if (slot in types_1.armour_slots) {
                let tmp = this.data.armour[slot];
                this.data.armour[slot] = item;
                backpack.items[index] = tmp;
                this.changed = true;
            }
        }
    }
    equip_weapon(index) {
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item != undefined) {
            let tmp = this.data.weapon;
            if (tmp == undefined) {
                this.data.weapon = backpack.items[index];
                backpack.items[index] = undefined;
            }
            else {
                let tmp2 = this.data.secondary;
                if (tmp2 == undefined) {
                    this.data.secondary = backpack.items[index];
                    backpack.items[index] = undefined;
                }
                else {
                    this.data.weapon = backpack.items[index];
                    backpack.items[index] = tmp;
                }
            }
        }
        this.changed = true;
    }
    switch_weapon() {
        let tmp = this.data.weapon;
        this.data.weapon = this.data.secondary;
        this.data.secondary = tmp;
    }
    unequip_secondary() {
        this.data.backpack.add(this.data.secondary);
        this.data.secondary = undefined;
        this.changed = true;
    }
    unequip(tag) {
        this.changed = true;
        if (tag == 'weapon') {
            this.data.backpack.add(this.data.weapon);
            this.data.weapon = undefined;
            return;
        }
        let item = this.data.armour[tag];
        this.data.backpack.add(item);
        this.data.armour[tag] = undefined;
    }
    // ['right_hand', 'body', 'legs', 'foot', 'head', 'arms']
    // UNFINISHED
    // get_data() {
    //     return {
    //         right_hand: this.data.weapon?.get_data(),
    //         secondary: this.data.secondary?.get_data(),
    //         body: this.data.armour.get(ARMOUR_TYPE.BODY)?.get_data(),
    //         legs: this.data.armour.get(ARMOUR_TYPE.LEGS)?.get_data(),
    //         foot: this.data.armour.get(ARMOUR_TYPE.FOOT)?.get_data(),
    //         head: this.data.armour.get(ARMOUR_TYPE.HEAD)?.get_data(),
    //         arms: this.data.armour.get(ARMOUR_TYPE.ARMS)?.get_data(),
    //         backpack: this.data.backpack.get_data()
    //     }
    // }
    resists() {
        let resists = new damage_types_1.Damage;
        for (let i of types_1.armour_slots) {
            resists.add(system_1.ItemSystem.resists(this.data.armour[i]));
        }
        return resists;
    }
    get_json() {
        return this.data.get_json();
    }
    load_from_json(json) {
        this.data.load_json(json);
    }
}
exports.Equip = Equip;
