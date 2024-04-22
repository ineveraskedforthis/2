"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentValues = void 0;
const item_system_1 = require("../systems/items/item_system");
const Damage_1 = require("../Damage");
const content_1 = require("../../.././../game_content/src/content");
const data_objects_1 = require("../data/data_objects");
const item_1 = require("../../content_wrappers/item");
const damage_types_1 = require("../damage_types");
var EquipmentValues;
(function (EquipmentValues) {
    function item(equipment, tag) {
        const id = equipment.data.slots[tag];
        return id ? data_objects_1.Data.Items.from_id(id) : undefined;
    }
    EquipmentValues.item = item;
    function weapon(equipment) {
        return equipment.weapon_id ? data_objects_1.Data.Items.from_id(equipment.weapon_id) : undefined;
    }
    EquipmentValues.weapon = weapon;
    function secondary(equipment) {
        return equipment.secondary ? data_objects_1.Data.Items.from_id(equipment.secondary) : undefined;
    }
    EquipmentValues.secondary = secondary;
    function weapon_range(equipment) {
        let item = weapon(equipment);
        return item ? item_system_1.ItemSystem.range(item) : undefined;
    }
    EquipmentValues.weapon_range = weapon_range;
    function melee_damage(equipment, type) {
        let item = weapon(equipment);
        return item ? item_system_1.ItemSystem.melee_damage(item, type) : undefined;
    }
    EquipmentValues.melee_damage = melee_damage;
    function ranged_damage(equipment) {
        let item = weapon(equipment);
        return item ? item_system_1.ItemSystem.ranged_damage(item, equipment.data.selected_ammo) : undefined;
    }
    EquipmentValues.ranged_damage = ranged_damage;
    function magic_power(equipment) {
        let result = 0;
        for (let tag of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[tag];
            if (item_id == undefined)
                continue;
            result += item_system_1.ItemSystem.power(data_objects_1.Data.Items.from_id(item_id));
        }
        return result;
    }
    EquipmentValues.magic_power = magic_power;
    function phys_power_modifier(equipment) {
        return 1;
    }
    EquipmentValues.phys_power_modifier = phys_power_modifier;
    function magic_power_modifier(equipment) {
        return 1;
    }
    EquipmentValues.magic_power_modifier = magic_power_modifier;
    function resists(equipment) {
        let resists = new Damage_1.Damage;
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            if ((0, item_1.is_weapon)(item_data))
                continue;
            damage_types_1.DmgOps.add_ip(resists, item_system_1.ItemSystem.resists(item_data));
        }
        return resists;
    }
    EquipmentValues.resists = resists;
})(EquipmentValues || (exports.EquipmentValues = EquipmentValues = {}));

