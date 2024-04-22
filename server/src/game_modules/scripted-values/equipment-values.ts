import { melee_attack_type } from "@custom_types/common";
import { Equip } from "../data/entities/equip";
import { ItemSystem } from "../systems/items/item_system";
import { Damage } from "../Damage";
import { EQUIP_SLOT, EquipSlotConfiguration } from "@content/content";
import { Data } from "../data/data_objects";
import { is_weapon } from "../../content_wrappers/item";
import { DmgOps } from "../damage_types";
import { EquipmentPiece, Weapon } from "../data/entities/item";

export namespace EquipmentValues {
    export function item(equipment: Equip, tag: EQUIP_SLOT): EquipmentPiece|undefined {
        const id = equipment.data.slots[tag]
        return id ? Data.Items.from_id(id) : undefined
    }

    export function weapon(equipment: Equip) : Weapon | undefined {
        return equipment.weapon_id ? Data.Items.from_id(equipment.weapon_id) as Weapon : undefined
    }

    export function secondary(equipment: Equip) : Weapon | undefined {
        return equipment.secondary ? Data.Items.from_id(equipment.secondary) as Weapon : undefined
    }

    export function weapon_range(equipment: Equip): undefined|number {
        let item = weapon(equipment)
        return item ? ItemSystem.range(item) : undefined
    }

    export function melee_damage(equipment: Equip, type: melee_attack_type): Damage|undefined {
        let item = weapon(equipment)
        return item ? ItemSystem.melee_damage(item, type) : undefined
    }

    export function ranged_damage(equipment: Equip): Damage|undefined {
        let item = weapon(equipment)
        return item ? ItemSystem.ranged_damage(item, equipment.data.selected_ammo) : undefined
    }

    export function magic_power(equipment: Equip) {
        let result = 0;
        for (let tag of EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[tag]
            if (item_id == undefined) continue;
            result += ItemSystem.power(Data.Items.from_id(item_id))
        }
        return result
    }

    export function phys_power_modifier(equipment: Equip) {
        return 1
    }

    export function magic_power_modifier(equipment: Equip) {
        return 1
    }

    export function resists(equipment: Equip) {
        let resists = new Damage;
        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = equipment.data.slots[key]
            if (item_id == undefined) continue;

            const item_data = Data.Items.from_id(item_id)
            if (is_weapon(item_data)) continue;

            DmgOps.add_ip(resists, ItemSystem.resists(item_data))
        }
        return resists
    }
}