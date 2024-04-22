import { EQUIP_SLOT, EquipSlotConfiguration, EquipSlotStorage } from "@content/content";
import { item_id } from "@custom_types/ids";
import { EquipSocket, ItemBackpackData, ItemData } from "@custom_types/inventory";
import { Data } from "../data/data_objects";
import { Character } from "../data/entities/character";
import { Equip } from "../data/entities/equip";
import { Inventory } from "../data/entities/inventory";
import { ItemSystem } from "../systems/items/item_system";

export namespace Extract {
    export function CharacterEquipModel(character: Character) :{[_ in EQUIP_SLOT]?: string}  {
        let response:{[_ in EQUIP_SLOT]?: string} = {}
        for (let k of EquipSlotConfiguration.SLOT) {
            const item_id = character.equip.data.slots[k]
            if (item_id == undefined) continue
            const item_data = Data.Items.from_id(item_id)
            response[k] = item_data.prototype.id_string
        }
        return response
    }

    export function InventoryData(inventory: Inventory) : {items: ItemBackpackData[]} {
        return {
            items: inventory.items.map((item, index) => {
                const item_object = Data.Items.from_id(item)
                let new_item = ItemSystem.data(item_object) ;
                new_item.backpack_index = index;
                return new_item as ItemBackpackData
            })
        }
    }

    export function EquipData(equip: Equip): EquipSocket {
        let response = {
            equip: EquipToStringEquip(equip.data.slots),
            backpack: InventoryData(equip.data.backpack)
        }
        return response
    }

    export function EquipToStringEquip(data: Partial<Record<EQUIP_SLOT, item_id>>): Partial<Record<string, ItemData>> {
        const result: Partial<Record<string, ItemData>> = {}

        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = data[key]
            if (item_id == undefined) continue
            const item_data = Data.Items.from_id(item_id)
            result[EquipSlotStorage.get(key).id_string] = ItemSystem.data(item_data)
        }

        return result
    }
}