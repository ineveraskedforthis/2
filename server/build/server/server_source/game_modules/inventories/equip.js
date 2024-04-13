"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const inventory_1 = require("../../../../shared/inventory");
const system_1 = require("../items/system");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const inventory_2 = require("./inventory");
class EquipData {
    constructor(backpack_limit) {
        this.slots = {};
        this.backpack = new inventory_2.Inventory(backpack_limit);
    }
    load_json(json) {
        for (let slot of inventory_1.slots) {
            const item_data = json.slots[slot];
            if (item_data == undefined)
                continue;
            const item = system_1.ItemSystem.create(item_data.model_tag, item_data.affixes, item_data.durability);
            item.price = item_data.price;
            this.slots[slot] = item;
        }
        this.backpack.load_from_json(json.backpack);
    }
}
class Equip {
    constructor() {
        this.data = new EquipData(10);
    }
    transfer_all(target) {
        for (let tag of inventory_1.slots) {
            this.unequip(tag);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack);
    }
    get_weapon_range() {
        let right_hand = this.data.slots.weapon;
        if (right_hand == undefined) {
            return undefined;
        }
        return system_1.ItemSystem.range(right_hand);
    }
    get_melee_damage(type) {
        // let damage = new Damage()
        const item = this.data.slots.weapon;
        if (item == undefined)
            return undefined;
        return system_1.ItemSystem.melee_damage(item, type);
    }
    get_ranged_damage() {
        let weapon = this.data.slots.weapon;
        if (weapon == undefined)
            return undefined;
        return system_1.ItemSystem.ranged_damage(weapon);
    }
    get_magic_power() {
        let result = 0;
        result += system_1.ItemSystem.power(this.data.slots.weapon);
        result += system_1.ItemSystem.power(this.data.slots.secondary);
        for (let tag of inventory_1.slots) {
            result += system_1.ItemSystem.power(this.data.slots[tag]);
        }
        return result;
    }
    get_phys_power_modifier() {
        return 1;
    }
    get_magic_power_modifier() {
        return 1;
    }
    equip_from_backpack(index, model) {
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item == undefined)
            return;
        if (system_1.ItemSystem.slot(item) == 'weapon') {
            this.equip_weapon(index, model);
        }
        else {
            this.equip_armour(index, model);
        }
    }
    equip_armour(index, model) {
        if (model != 'human') {
            return;
        }
        let backpack = this.data.backpack;
        let item = backpack.items[index];
        if (item != undefined) {
            let slot = system_1.ItemSystem.slot(item);
            let tmp = this.data.slots[slot];
            this.data.slots[slot] = item;
            backpack.remove(index);
            if (tmp != undefined)
                backpack.add(tmp);
        }
    }
    equip_weapon(index, model) {
        let backpack = this.data.backpack;
        if (index == undefined)
            return;
        let item = backpack.items[index];
        if (item == undefined)
            return;
        if (system_1.ItemSystem.slot(item) != 'weapon') {
            return;
        }
        let tmp = this.data.slots.weapon;
        if (model == 'graci') {
            if (item.model_tag == 'spear') {
            }
            else if (item.model_tag == 'bone_spear') {
            }
            else {
                return;
            }
        }
        else if (model == 'human') {
        }
        else if (model == 'human_strong') {
            if (item.model_tag == 'spear') {
            }
            else if (item.model_tag == 'bone_spear') {
            }
            else {
                return;
            }
        }
        else {
            return;
        }
        if (tmp == undefined) {
            this.data.slots.weapon = backpack.items[index];
            backpack.remove(index);
        }
        else {
            let tmp2 = this.data.slots.secondary;
            if (tmp2 == undefined) {
                this.data.slots.secondary = backpack.items[index];
                backpack.remove(index);
            }
            else {
                this.data.slots.weapon = backpack.items[index];
                backpack.remove(index);
                backpack.add(tmp);
            }
        }
    }
    switch_weapon() {
        let tmp = this.data.slots.weapon;
        this.data.slots.weapon = this.data.slots.secondary;
        this.data.slots.secondary = tmp;
    }
    unequip(tag) {
        let item = this.data.slots[tag];
        if (item == undefined)
            return;
        let response = this.data.backpack.add(item);
        if (response !== false)
            this.data.slots[tag] = undefined;
    }
    destroy_slot(tag) {
        this.data.slots[tag] = undefined;
        return;
    }
    slot_to_item(tag) {
        if (tag == 'weapon') {
            return this.data.slots.weapon;
        }
        return this.data.slots[tag];
    }
    _equip_to_data(data) {
        const result = {};
        for (const key of Object.keys(data)) {
            result[key] = system_1.ItemSystem.item_data(data[key]);
        }
        return result;
    }
    get_data() {
        let response = {
            equip: this._equip_to_data(this.data.slots),
            backpack: this.data.backpack.get_data()
        };
        return response;
    }
    resists() {
        let resists = new Damage_1.Damage;
        for (let i of inventory_1.slots) {
            damage_types_1.DmgOps.add_ip(resists, system_1.ItemSystem.resists(this.data.slots[i]));
        }
        return resists;
    }
    modify_attack(attack) {
        for (let i of inventory_1.slots) {
            system_1.ItemSystem.modify_attack(this.data.slots[i], attack);
        }
    }
    load_from_json(json) {
        this.data.load_json(json.data);
    }
}
exports.Equip = Equip;
