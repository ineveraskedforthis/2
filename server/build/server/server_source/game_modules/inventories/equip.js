"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const types_1 = require("../types");
const system_1 = require("../items/system");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const inventory_1 = require("./inventory");
const strings_management_1 = require("../strings_management");
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
            weapon: (0, strings_management_1.item_to_string)(this.weapon),
            secondary: (0, strings_management_1.item_to_string)(this.secondary),
            armour: {},
            backpack: (0, strings_management_1.inventory_to_string)(this.backpack)
        };
        for (let tag of types_1.armour_slots) {
            result.armour[tag] = (0, strings_management_1.item_to_string)(this.armour[tag]);
        }
        return JSON.stringify(result);
    }
    from_string(s) {
        const json = JSON.parse(s);
        if (json.weapon != undefined) {
            this.weapon = (0, strings_management_1.item_from_string)(json.weapon);
        }
        if (json.secondary != undefined) {
            this.secondary = (0, strings_management_1.item_from_string)(json.secondary);
        }
        for (let tag of types_1.armour_slots) {
            const tmp = json.armour[tag];
            if (tmp != undefined) {
                this.armour[tag] = (0, strings_management_1.item_from_string)(tmp);
            }
        }
        (0, strings_management_1.inventory_from_string)(this.backpack, json.backpack);
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
    // update(agent:Character) {
    //     for (let i of armour_slots) {
    //         this.item_update(this.data.armour[i], agent);
    //     }
    // }
    // item_update(item:Item|undefined, agent:Character) {
    //     if (item == undefined) {return}
    //     for (let i = 0; i < item.affixes.length; i++) {
    //         let affix = item.affixes[i];
    //         let f = update_character[affix.tag];
    //         if (f != undefined) {
    //             f(agent);
    //         }
    //     }
    // }
    equip_from_backpack(index, race) {
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item == undefined)
            return;
        if (race == 'elo') {
            return;
        }
        if (race == 'rat') {
            return;
        }
        if (race == 'graci') {
            return;
        }
        if (item.slot == 'weapon') {
            this.equip_weapon(index);
        }
        else {
            this.equip_armour(index);
        }
    }
    equip_armour(index) {
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item != undefined) {
            let slot = item.slot;
            let tmp = this.data.armour[slot];
            this.data.armour[slot] = item;
            backpack.items[index] = tmp;
            this.changed = true;
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
    destroy_slot(tag) {
        if (tag == 'weapon') {
            this.data.weapon = undefined;
            return;
        }
        this.data.armour[tag] = undefined;
        return;
    }
    slot_to_item(tag) {
        if (tag == 'weapon') {
            return this.data.weapon;
        }
        return this.data.armour[tag];
    }
    get_data() {
        return {
            equip: {
                weapon: system_1.ItemSystem.item_data(this.data.weapon),
                secondary: system_1.ItemSystem.item_data(this.data.secondary),
                body: system_1.ItemSystem.item_data(this.data.armour['body']),
                legs: system_1.ItemSystem.item_data(this.data.armour['legs']),
                foot: system_1.ItemSystem.item_data(this.data.armour['foot']),
                head: system_1.ItemSystem.item_data(this.data.armour['head']),
                arms: system_1.ItemSystem.item_data(this.data.armour['arms']),
            },
            backpack: this.data.backpack.get_data()
        };
    }
    resists() {
        let resists = new Damage_1.Damage;
        for (let i of types_1.armour_slots) {
            damage_types_1.DmgOps.add_ip(resists, system_1.ItemSystem.resists(this.data.armour[i]));
        }
        return resists;
    }
    modify_attack(attack) {
        for (let i of types_1.armour_slots) {
            system_1.ItemSystem.modify_attack(this.data.armour[i], attack);
        }
        system_1.ItemSystem.modify_attack(this.data.weapon, attack);
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
