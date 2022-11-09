import { ItemData } from "../../shared/inventory";
import { Item, ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";

export interface InventoryJson {
    items_array: ItemJson[]
}
export interface InventoryStrings {
    items_array: string[]
}

export class Inventory{
    items: (Item|undefined)[]
    changed: boolean

    constructor() {
        this.items = [];
        this.changed = false
    }

    add(item:Item|undefined) {
        if (item == undefined) return
        let responce = -1
        if (item != undefined) {
            responce = this.items.push(item) - 1;
        }
        this.changed = true
        return responce
    }

    transfer_all(target: Inventory) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item != undefined) {target.add(item)}            
            this.remove(i)
        }
    }

    remove(i: number) {
        let item = this.items[i]
        if (item != undefined) {
            this.items[i] = undefined
        }
        this.changed = true
    }


    get_json():InventoryJson  {
        const array:ItemJson[] = []
        for (let i of this.items) {
            if (i != undefined) {
                array.push(i.json())
            }
        }
        return {items_array: array}
    }

    to_string() {
        const array:string[] = []
        for (let i of this.items) {
            if (i != undefined) {
                array.push(ItemSystem.to_string(i))
            }
        }
        return JSON.stringify({items_array: array})
    }

    from_string(s: string) {
        const data:{items_array: string[]} = JSON.parse(s)
        for (let i = 0; i <= 100; i++) {
            const tmp = data.items_array[i]
            if (tmp == undefined) return
            this.items.push(ItemSystem.from_string(tmp))
        }
    }

    get_data():{items: ItemData[]} {
        const array:ItemData[] = []
        for (let [key, value] of Object.entries(this.items)) {
            if (value != undefined) {
                let data = ItemSystem.item_data(value)
                if (data == undefined) continue
                data.backpack_index = Number(key)
                array.push(data)
            }
        } 
        return {items: array}
    }

    load_from_json(data:InventoryJson) {
        for (let i = 0; i <= 100; i++) {
            const tmp = data.items_array[i]
            if (tmp == undefined) return
            this.items.push(ItemSystem.create(tmp))
        }
    }
}