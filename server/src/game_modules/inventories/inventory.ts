import { ItemBackpackData } from "../../../../shared/inventory";
import { ItemSystem } from "../systems/items/item_system";
import { item_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";


export class Inventory{
    items: item_id[]
    limit: number

    constructor(limit: number) {
        this.items = [];
        this.limit = limit
    }

    add(item:item_id):number|false {
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
                const item_object = Data.Items.from_id(item)
                let new_item = ItemSystem.data(item_object) ;
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