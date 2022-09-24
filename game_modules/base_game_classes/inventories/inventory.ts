import { Item, ItemData, ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";

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

    get_json():{items_array: ItemJson[]}  {
        const array:ItemJson[] = []
        for (let i of this.items) {
            if (i != undefined) {
                array.push(i.json())
            }
        }
        return {items_array: array}
    }

    get_data():{items: ItemData[]} {
        const array:ItemData[] = []
        for (let i in this.items) {
            let item = this.items[i]
            if (item != undefined) {
                array.push(item.data())
            }
        } 
        return {items: array}
    }

    load_from_json(data:{[_ in number]?: ItemJson}) {
        for (let i = 1; i <= 100; i++) {
            const tmp = data[i]
            if (tmp == undefined) return
            this.items.push(ItemSystem.create(tmp))
        }
    }
}