"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stash = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
class Stash {
    constructor() {
        this.data = [];
        this.changed = false;
    }
    get_json() {
        let data = {};
        for (let material of materials_manager_1.materials.get_materials_list()) {
            data[material] = this.data[material];
        }
        return data;
    }
    load_from_json(data) {
        console.log(data);
        for (let [i, amount] of Object.entries(data)) {
            if (amount == null)
                amount = 0;
            this.data[Number(i)] = amount;
        }
        console.log(this.data);
    }
    inc(tag, x) {
        let tag_stash = this.get(tag);
        var tmp = 0;
        if (tag_stash == undefined) {
            tag_stash = 0;
        }
        if ((x == undefined) || (x == NaN)) {
            x = 0;
        }
        if (tag_stash + x < 0) {
            tmp = -tag_stash;
            this.set(tag, 0);
        }
        else {
            tmp = x;
            this.set(tag, tag_stash + x);
        }
        this.changed = true;
        return tmp;
    }
    set(tag, x) {
        if ((x < 0) || (x == undefined) || (x == NaN)) {
            this.data[tag] = 0;
        }
        else {
            this.data[tag] = x;
        }
        this.changed = true;
    }
    get(tag) {
        let tmp = this.data[tag];
        if ((tmp == undefined) || (tmp == NaN))
            return 0;
        return tmp;
    }
    transfer(target, tag, amount) {
        if ((amount == undefined) || (amount == null) || (amount == NaN))
            amount = 0;
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }
    transfer_all(target) {
        for (let tag of materials_manager_1.materials.get_materials_list()) {
            this.transfer(target, tag, this.get(tag));
        }
    }
}
exports.Stash = Stash;
