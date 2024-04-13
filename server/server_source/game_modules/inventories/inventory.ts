import { ItemBackpackData } from "../../../../shared/inventory";
import { Item } from "../items/item";
import { ItemJson } from "@custom_types/inventory";
import { ItemSystem } from "../items/system";

export interface InventoryJson {
    items_array: (ItemJson|undefined)[]
}
export interface InventoryStrings {
    items_array: string[]
}

export class Inventory{
    items: (Item)[]
    limit: number

    constructor(limit: number) {
        this.items = [];
        this.limit = limit
    }

    add(item:Item):number|false {
        if (this.items.length >= this.limit) return false
        return this.items.push(item) - 1;
    }

    transfer_all(target: Inventory) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item != undefined) {
                let response = target.add(item)
                if (response !== false) this.remove(i)
            }
        }
    }

    remove(i: number) {
        this.items.splice(i, 1)
    }

    get_data():{items: ItemBackpackData[]} {
        return {
            items: this.items.map((item, index) => {
                let new_item = ItemSystem.item_data(item) ;
                new_item.backpack_index = index;
                return new_item as ItemBackpackData
            })
        }
    }

    load_from_json(data:Inventory) {
        this.items = data.items.filter(item => item != null)
        this.limit = data.limit
    }
}