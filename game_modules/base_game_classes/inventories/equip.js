"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const types_1 = require("../../types");
const affix_1 = require("../affix");
const system_1 = require("../items/system");
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
            backpack: this.backpack.get_json()
        };
        for (let tag of types_1.armour_slots) {
            result.armour[tag] = this.armour[tag]?.json();
        }
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
    to_string() {
        let result = {
            weapon: system_1.ItemSystem.to_string(this.weapon),
            secondary: system_1.ItemSystem.to_string(this.secondary),
            armour: {},
            backpack: this.backpack.to_string()
        };
        for (let tag of types_1.armour_slots) {
            result.armour[tag] = system_1.ItemSystem.to_string(this.armour[tag]);
        }
        return JSON.stringify(result);
    }
    from_string(s) {
        const json = JSON.parse(s);
        if (json.weapon != undefined) {
            this.weapon = system_1.ItemSystem.from_string(json.weapon);
        }
        if (json.secondary != undefined) {
            this.secondary = system_1.ItemSystem.from_string(json.secondary);
        }
        for (let tag of types_1.armour_slots) {
            const tmp = json.armour[tag];
            if (tmp != undefined) {
                this.armour[tag] = system_1.ItemSystem.from_string(tmp);
            }
        }
        this.backpack.from_string(json.backpack);
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
        // let damage = new Damage()
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
        if (index == undefined)
            return;
        let item = backpack.items[index];
        if (item != undefined) {
            if (item.slot != 'weapon') {
                return;
            }
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
    get_data() {
        return {
            right_hand: this.data.weapon?.data(),
            secondary: this.data.secondary?.data(),
            body: this.data.armour['body']?.data(),
            legs: this.data.armour['legs']?.data(),
            foot: this.data.armour['foot']?.data(),
            head: this.data.armour['head']?.data(),
            arms: this.data.armour['arms']?.data(),
            backpack: this.data.backpack.get_data()
        };
    }
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
    to_string() {
        return this.data.to_string();
    }
    from_string(s) {
        this.data.from_string(s);
    }
}
exports.Equip = Equip;
