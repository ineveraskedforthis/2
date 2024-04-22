"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
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
    is_empty() {
        let result = true;
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (item != undefined) {
                result = false;
            }
        }
        return result;
    }
    remove(i) {
        this.items.splice(i, 1);
    }
    load_from_json(data) {
        this.items = data.items.filter(item => item != null);
        this.limit = data.limit;
    }
}
exports.Inventory = Inventory;
