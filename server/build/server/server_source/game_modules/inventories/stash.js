"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stash = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
class Stash {
    constructor() {
        this.data = [];
        for (let material of materials_manager_1.materials.get_materials_list()) {
            this.data[material] = 0;
        }
    }
    is_empty() {
        for (let material of materials_manager_1.materials.get_materials_list()) {
            if ((this.data[material] == null) || (this.data[material] == undefined))
                continue;
            if (this.data[material] > 0) {
                return false;
            }
        }
        return true;
    }
    get_json() {
        let data = {};
        for (let material of materials_manager_1.materials.get_materials_list()) {
            data[material] = this.data[material];
        }
        return data;
    }
    load_from_json(data) {
        for (let [i, amount] of Object.entries(data)) {
            if (amount == null)
                amount = 0;
            this.data[Number(i)] = amount;
        }
    }
    inc(tag, x) {
        let tag_stash = this.get(tag);
        var tmp = 0;
        if (tag_stash == undefined) {
            tag_stash = 0;
        }
        if ((x == undefined) || (Number.isNaN(x))) {
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
        return tmp;
    }
    set(tag, x) {
        if ((x < 0) || (x == undefined) || (Number.isNaN(x))) {
            this.data[tag] = 0;
        }
        else {
            this.data[tag] = x;
        }
    }
    get(tag) {
        let tmp = this.data[tag];
        if ((tmp == undefined) || (Number.isNaN(tmp)))
            return 0;
        return tmp;
    }
    transfer(target, tag, amount) {
        if ((amount == undefined) || (amount == null) || (Number.isNaN(amount)))
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
