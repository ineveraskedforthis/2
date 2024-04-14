"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const item_system_1 = require("../systems/items/item_system");
const data_objects_1 = require("../data/data_objects");
class Inventory {
    constructor(limit) {
        this.items = [];
        this.limit = limit;
    }
    add(item) {
        if (this.items.length >= this.limit)
            return false;
        return this.items.push(item) - 1;
    }
    transfer_all(target) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (item != undefined) {
                let response = target.add(item);
                if (response !== false)
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
                const item_object = data_objects_1.Data.Items.from_id(item);
                let new_item = item_system_1.ItemSystem.data(item_object);
                new_item.backpack_index = index;
                return new_item;
            })
        };
    }
    load_from_json(data) {
        this.items = data.items.filter(item => item != null);
        this.limit = data.limit;
    }
}
exports.Inventory = Inventory;

