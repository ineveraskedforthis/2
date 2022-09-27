"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const system_1 = require("../items/system");
class Inventory {
    constructor() {
        this.items = [];
        this.changed = false;
    }
    add(item) {
        if (item == undefined)
            return;
        let responce = -1;
        if (item != undefined) {
            responce = this.items.push(item) - 1;
        }
        this.changed = true;
        return responce;
    }
    transfer_all(target) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (item != undefined) {
                target.add(item);
            }
            this.remove(i);
        }
    }
    remove(i) {
        let item = this.items[i];
        if (item != undefined) {
            this.items[i] = undefined;
        }
        this.changed = true;
    }
    get_json() {
        const array = [];
        for (let i of this.items) {
            if (i != undefined) {
                array.push(i.json());
            }
        }
        return { items_array: array };
    }
    get_data() {
        const array = [];
        for (let i in this.items) {
            let item = this.items[i];
            if (item != undefined) {
                array.push(item.data());
            }
        }
        return { items: array };
    }
    load_from_json(data) {
        for (let i = 1; i <= 100; i++) {
            const tmp = data[i];
            if (tmp == undefined)
                return;
            this.items.push(system_1.ItemSystem.create(tmp));
        }
    }
}
exports.Inventory = Inventory;
