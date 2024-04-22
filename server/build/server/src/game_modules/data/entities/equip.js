"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equip = void 0;
const inventory_1 = require("./inventory");
const content_1 = require("../../../.././../game_content/src/content");
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
    is_empty() {
        let result = true;
        for (let slot of content_1.EquipSlotConfiguration.SLOT) {
            if (this.data.slots[slot] != undefined) {
                result = false;
            }
        }
        return result && this.data.backpack.is_empty();
    }
    get weapon_id() {
        return this.data.slots[0 /* EQUIP_SLOT.WEAPON */];
    }
    set weapon_id(x) {
        this.data.slots[0 /* EQUIP_SLOT.WEAPON */] = x;
    }
    get secondary() {
        return this.data.slots[1 /* EQUIP_SLOT.SECONDARY */];
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
    load_from_json(json) {
        this.data.load_json(json.data);
    }
}
exports.Equip = Equip;

