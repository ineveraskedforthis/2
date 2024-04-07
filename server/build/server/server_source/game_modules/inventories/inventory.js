"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const system_1 = require("../items/system");
class Inventory {
    // changed: boolean
    constructor(limit) {
        this.items = [];
        this.limit = limit;
        // this.changed = false
    }
    // add(item:Item):number
    // add(item:undefined):undefined
    // add(item:Item|undefined):number|undefined
    add(item) {
        // console.log(item, this.items, this.limit, this.items.length)
        if (this.items.length >= this.limit)
            return false;
        return this.items.push(item) - 1;
    }
    transfer_all(target) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (item != undefined) {
                let response = target.add(item);
                if (response != false)
                    this.remove(i);
            }
        }
    }
    remove(i) {
        this.items.splice(i, 1);
    }
    get_data() {
        return {
            items: this.items.map((item, index) => {
                let new_item = system_1.ItemSystem.item_data(item);
                new_item.backpack_index = index;
                return new_item;
            })
        };
    }
    load_from_json(data) {
        this.items = data.items.filter(item => item != null);
        this.limit = data.limit;
        // for (let i = 0; i <= 100; i++) {
        //     const tmp = data.items_array[i]
        //     if (tmp == undefined) return
        //     this.items.push(ItemSystem.create(tmp))
        // }
    }
}
exports.Inventory = Inventory;
