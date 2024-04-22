import { Inventory } from "./inventory";
import { EQUIP_SLOT, EquipSlotConfiguration, EquipSlotStorage, MATERIAL } from "@content/content";
import { item_id } from "@custom_types/ids";
import { AMMO_BOW } from "../../../content_wrappers/item";

interface EquipDataParsed {
    slots: Partial<Record<string, item_id>> //{[_ in EQUIP_SLOT]?: Item}
    backpack: Inventory
}

class EquipData {
    slots: Partial<Record<EQUIP_SLOT, item_id>> //{[_ in EQUIP_SLOT]?: Item}
    backpack: Inventory
    selected_ammo: AMMO_BOW

    constructor(backpack_limit: number) {
        this.slots = {}
        this.backpack = new Inventory(backpack_limit)
        this.selected_ammo = MATERIAL.ARROW_BONE
    }

    load_json(json:EquipDataParsed){
        for (let slot_id of EquipSlotConfiguration.SLOT) {
            const slot = EquipSlotStorage.get(slot_id);
            this.slots[slot.id] = json.slots[slot.id_string]
        }

        this.backpack.load_from_json(json.backpack)
    }

    toJSON() {
        const result : Partial<Record<string, item_id>> = {}
        for (let slot_id of EquipSlotConfiguration.SLOT) {
            const slot = EquipSlotStorage.get(slot_id);
            result[slot.id_string] = this.slots[slot.id]
        }

        return {
            slots: result,
            backpack: this.backpack
        }
    }
}


export class Equip {
    data: EquipData;

    constructor() {
        this.data = new EquipData(10)
    }

    transfer_all(target: {equip: Equip}) {
        for (let slot of EquipSlotConfiguration.SLOT) {
            this.unequip(slot);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack)
    }

    is_empty(): boolean {
        let result = true;
        for (let slot of EquipSlotConfiguration.SLOT) {
            if (this.data.slots[slot] != undefined) {
                result = false
            }
        }
        return result && this.data.backpack.is_empty()
    }

    get weapon_id(): item_id|undefined {
        return this.data.slots[EQUIP_SLOT.WEAPON]
    }

    set weapon_id(x: item_id|undefined) {
        this.data.slots[EQUIP_SLOT.WEAPON] = x
    }

    get secondary(): item_id|undefined {
        return this.data.slots[EQUIP_SLOT.SECONDARY]
    }

    switch_weapon() {
        let tmp = this.data.slots[EQUIP_SLOT.WEAPON]
        this.data.slots[EQUIP_SLOT.WEAPON] = this.data.slots[EQUIP_SLOT.SECONDARY]
        this.data.slots[EQUIP_SLOT.SECONDARY] = tmp
    }

    unequip(tag:EQUIP_SLOT) {
        let item = this.data.slots[tag]
        if (item == undefined) return
        let response = this.data.backpack.add(item);
        if (response !== false) this.data.slots[tag] = undefined
    }

    destroy_slot(tag: EQUIP_SLOT) {
        this.data.slots[tag] = undefined
        return
    }

    load_from_json(json:Equip) {
        this.data.load_json(json.data);
    }
}