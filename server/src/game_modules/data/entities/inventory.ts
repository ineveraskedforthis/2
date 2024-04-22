import { item_id } from "@custom_types/ids";

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

    is_empty() : boolean {
        let result = true;

        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item != undefined) {
                result = false
            }
        }

        return result
    }

    remove(i: number) {
        this.items.splice(i, 1)
    }

    load_from_json(data:Inventory) {
        this.items = data.items.filter(item => item != null)
        this.limit = data.limit
    }
}