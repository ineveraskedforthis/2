"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const item_system_1 = require("../systems/items/item_system");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const inventory_1 = require("./inventory");
const content_1 = require("../../.././../game_content/src/content");
const data_objects_1 = require("../data/data_objects");
const item_1 = require("../../content_wrappers/item");
class EquipData {
    constructor(backpack_limit) {
        this.slots = {};
        this.backpack = new inventory_1.Inventory(backpack_limit);
        this.selected_ammo = 0 /* MATERIAL.ARROW_BONE */;
    }
    load_json(json) {
        for (let slot_id of content_1.EquipSlotConfiguration.SLOT) {
            const slot = content_1.EquipSlotStorage.get(slot_id);
            this.slots[slot.id] = json.slots[slot.id_string];
        }
        this.backpack.load_from_json(json.backpack);
    }
    toJSON() {
        const result = {};
        for (let slot_id of content_1.EquipSlotConfiguration.SLOT) {
            const slot = content_1.EquipSlotStorage.get(slot_id);
            result[slot.id_string] = this.slots[slot.id];
        }
        return {
            slots: result,
            backpack: this.backpack
        };
    }
}
class Equip {
    constructor() {
        this.data = new EquipData(10);
    }
    transfer_all(target) {
        for (let slot of content_1.EquipSlotConfiguration.SLOT) {
            this.unequip(slot);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack);
    }
    get weapon() {
        return this.data.slots[0 /* EQUIP_SLOT.WEAPON */] ? data_objects_1.Data.Items.from_id(this.data.slots[0 /* EQUIP_SLOT.WEAPON */]) : undefined;
    }
    set weapon(weapon) {
        this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = weapon ? weapon.id : undefined;
    }
    get weapon_id() {
        return this.data.slots[0 /* EQUIP_SLOT.WEAPON */];
    }
    set weapon_id(x) {
        this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = x;
    }
    get secondary() {
        return this.data.slots[1 /* EQUIP_SLOT.SECONDARY */] ? data_objects_1.Data.Items.from_id(this.data.slots[1 /* EQUIP_SLOT.SECONDARY */]) : undefined;
    }
    get_weapon_range() {
        let weapon = this.weapon;
        if (weapon == undefined)
            return;
        return item_system_1.ItemSystem.range(weapon);
    }
    get_melee_damage(type) {
        let weapon = this.weapon;
        if (weapon == undefined)
            return;
        return item_system_1.ItemSystem.melee_damage(weapon, type);
    }
    get_ranged_damage() {
        let weapon = this.weapon;
        if (weapon == undefined)
            return;
        return item_system_1.ItemSystem.ranged_damage(weapon, this.data.selected_ammo);
    }
    get_magic_power() {
        let result = 0;
        for (let tag of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[tag];
            if (item_id == undefined)
                continue;
            result += item_system_1.ItemSystem.power(data_objects_1.Data.Items.from_id(item_id));
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
        const item_object = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_weapon)(item_object)) {
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
        const item_data = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_weapon)(item_data))
            return;
        if (item != undefined) {
            let slot = item_data.prototype.slot;
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
        const item_data = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_armour)(item_data)) {
            return;
        }
        let tmp = this.data.slots[0 /* EQUIP_SLOT.WEAPON */];
        if (tmp == undefined) {
            this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = backpack.items[index];
            backpack.remove(index);
        }
        else {
            let tmp2 = this.data.slots[1 /* EQUIP_SLOT.SECONDARY */];
            if (tmp2 == undefined) {
                this.data.slots[1 /* EQUIP_SLOT.SECONDARY */] = backpack.items[index];
                backpack.remove(index);
            }
            else {
                this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = backpack.items[index];
                backpack.remove(index);
                backpack.add(tmp);
            }
        }
    }
    switch_weapon() {
        let tmp = this.data.slots[0 /* EQUIP_SLOT.WEAPON */];
        this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = this.data.slots[1 /* EQUIP_SLOT.SECONDARY */];
        this.data.slots[1 /* EQUIP_SLOT.SECONDARY */] = tmp;
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
        const id = this.data.slots[tag];
        return id ? data_objects_1.Data.Items.from_id(id) : undefined;
    }
    _equip_to_data(data) {
        const result = {};
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = data[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            result[content_1.EquipSlotStorage.get(key).id_string] = item_system_1.ItemSystem.data(item_data);
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
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            if ((0, item_1.is_weapon)(item_data))
                continue;
            damage_types_1.DmgOps.add_ip(resists, item_system_1.ItemSystem.resists(item_data));
        }
        return resists;
    }
    modify_attack(attack) {
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            item_system_1.ItemSystem.modify_attack(item_data, attack);
        }
    }
    load_from_json(json) {
        this.data.load_json(json.data);
    }
}
exports.Equip = Equip;

