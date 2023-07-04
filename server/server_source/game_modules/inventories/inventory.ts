import { ItemData } from "../../../../shared/inventory";
import { item_from_string, item_to_string } from "../strings_management";
import { Item, ItemJson } from "../items/item";
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
    // changed: boolean

    constructor(limit: number) {
        this.items = [];
        this.limit = limit
        // this.changed = false
    }

    // add(item:Item):number
    // add(item:undefined):undefined
    // add(item:Item|undefined):number|undefined
    add(item:Item):number|false {
        // console.log(item, this.items, this.limit, this.items.length)
        if (this.items.length >= this.limit) return false
        return this.items.push(item) - 1;
    }

    transfer_all(target: Inventory) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item != undefined) {
                let response = target.add(item)
                if (response != false) this.remove(i)
            } 
        }
    }

    remove(i: number) {
        this.items.splice(i, 1)
    }

    // get_json():InventoryJson  {
    //     const array:ItemJson[] = []
    //     for (let i of this.items) {
    //         if (i != undefined) {
    //             array.push(i.json())
    //         }
    //     }
    //     return {items_array: array}
    // }

    get_data():{items: ItemData[]} {
        // const array:ItemData[] = []
        // for (let [key, value] of Object.entries(this.items)) {
        //     if (value != undefined) {
        //         let data = ItemSystem.item_data(value)
        //         if (data == undefined) continue
        //         data.backpack_index = Number(key)
        //         array.push(data)
        //     }
        // } 
        return {items: this.items.map((item, index) => {
            let new_item = ItemSystem.item_data(item); 
            new_item.backpack_index = index; 
            return new_item})}
    }

    load_from_json(data:Inventory) {
        this.items = data.items.filter(item => item != null)
        this.limit = data.limit
        // for (let i = 0; i <= 100; i++) {
        //     const tmp = data.items_array[i]
        //     if (tmp == undefined) return
        //     this.items.push(ItemSystem.create(tmp))
        // }
    }
}