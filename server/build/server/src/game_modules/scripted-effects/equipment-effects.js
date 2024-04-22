"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentEffects = void 0;
const content_1 = require("../../.././../game_content/src/content");
const item_1 = require("../../content_wrappers/item");
const data_objects_1 = require("../data/data_objects");
const item_system_1 = require("../systems/items/item_system");
var EquipmentEffects;
(function (EquipmentEffects) {
    function equip_from_backpack(equipment, index, model) {
        let backpack = equipment.data.backpack;
        let item = backpack.items[index];
        if (item == undefined)
            return;
        const item_object = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_weapon)(item_object)) {
            equip_weapon(equipment, index, model);
        }
        else {
            equip_armour(equipment, index, model);
        }
    }
    EquipmentEffects.equip_from_backpack = equip_from_backpack;
    function equip_armour(equipment, index, model) {
        if (model != 'human') {
            return;
        }
        let backpack = equipment.data.backpack;
        let item = backpack.items[index];
        const item_data = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_weapon)(item_data))
            return;
        if (item != undefined) {
            let slot = item_data.prototype.slot;
            let tmp = equipment.data.slots[slot];
            equipment.data.slots[slot] = item;
            backpack.remove(index);
            if (tmp != undefined)
                backpack.add(tmp);
        }
    }
    EquipmentEffects.equip_armour = equip_armour;
    function equip_weapon(equipment, index, model) {
        let backpack = equipment.data.backpack;
        if (index == undefined)
            return;
        let item = backpack.items[index];
        if (item == undefined)
            return;
        const item_data = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_armour)(item_data)) {
            return;
        }
        let tmp = equipment.data.slots[0 /* EQUIP_SLOT.WEAPON */];
        if (tmp == undefined) {
            equipment.data.slots[0 /* EQUIP_SLOT.WEAPON */] = backpack.items[index];
            backpack.remove(index);
        }
        else {
            let tmp2 = equipment.data.slots[1 /* EQUIP_SLOT.SECONDARY */];
            if (tmp2 == undefined) {
                equipment.data.slots[1 /* EQUIP_SLOT.SECONDARY */] = backpack.items[index];
                backpack.remove(index);
            }
            else {
                equipment.data.slots[0 /* EQUIP_SLOT.WEAPON */] = backpack.items[index];
                backpack.remove(index);
                backpack.add(tmp);
            }
        }
    }
    EquipmentEffects.equip_weapon = equip_weapon;
    function modify_attack(equipment, attack) {
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            item_system_1.ItemSystem.modify_attack(item_data, attack);
        }
    }
    EquipmentEffects.modify_attack = modify_attack;
})(EquipmentEffects || (exports.EquipmentEffects = EquipmentEffects = {}));

