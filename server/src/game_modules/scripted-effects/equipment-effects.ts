import { EQUIP_SLOT, EquipSlotConfiguration } from "@content/content";
import { is_armour, is_weapon } from "../../content_wrappers/item";
import { Data } from "../data/data_objects";
import { Equip } from "../data/entities/equip";
import { tagModel } from "../types";
import { AttackObj } from "../attack/class";
import { ItemSystem } from "../systems/items/item_system";

export namespace EquipmentEffects {
    export function equip_from_backpack(equipment: Equip, index: number, model: tagModel) {
        let backpack = equipment.data.backpack;
        let item = backpack.items[index]
        if (item == undefined) return
        const item_object = Data.Items.from_id(item)
        if (is_weapon(item_object)) {
            equip_weapon(equipment, index, model)
        } else {
            equip_armour(equipment, index, model)
        }
    }

    export function equip_armour(equipment: Equip, index:number, model: tagModel) {
        if (model != 'human') {
            return
        }

        let backpack = equipment.data.backpack;
        let item = backpack.items[index]
        const item_data = Data.Items.from_id(item)

        if (is_weapon(item_data)) return

        if (item != undefined) {
            let slot = item_data.prototype.slot;
            let tmp = equipment.data.slots[slot];
            equipment.data.slots[slot] = item
            backpack.remove(index)
            if (tmp != undefined) backpack.add(tmp)
        }
    }

    export function equip_weapon(equipment: Equip, index:number|undefined, model: tagModel) {
        let backpack = equipment.data.backpack;
        if (index == undefined) return
        let item = backpack.items[index]
        if (item == undefined) return
        const item_data = Data.Items.from_id(item)

        if (is_armour(item_data)) {return}

        let tmp = equipment.data.slots[EQUIP_SLOT.WEAPON];

        if (tmp == undefined) {
            equipment.data.slots[EQUIP_SLOT.WEAPON] = backpack.items[index];
            backpack.remove(index)
        } else {
            let tmp2 = equipment.data.slots[EQUIP_SLOT.SECONDARY]
            if (tmp2 == undefined) {
                equipment.data.slots[EQUIP_SLOT.SECONDARY] = backpack.items[index];
                backpack.remove(index)
            } else {
                equipment.data.slots[EQUIP_SLOT.WEAPON] = backpack.items[index];
                backpack.remove(index)
                backpack.add(tmp)
            }
        }
    }

    export function modify_attack(equipment: Equip, attack: AttackObj) {
        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[key]
            if (item_id == undefined) continue;
            const item_data = Data.Items.from_id(item_id)
            ItemSystem.modify_attack(item_data, attack)
        }
    }
}