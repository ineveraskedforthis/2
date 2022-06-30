"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stash = void 0;
class Stash {
    constructor() {
        this.data = [];
        this.changed = false;
    }
    get_json() {
        let data = {};
        for (let tag = 1; tag < this.data.length; tag++) {
            data[tag] = this.data[tag];
        }
        return data;
    }
    load_from_json(data) {
        for (let i in data) {
            this.data[i] = data[i];
        }
    }
    inc(tag, x) {
        let tag_stash = this.get(tag);
        var tmp = undefined;
        if (tag_stash == undefined) {
            tag_stash = 0;
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
        if (x < 0) {
            this.data[tag] = 0;
        }
        else {
            this.data[tag] = x;
        }
        this.changed = true;
    }
    get(tag) {
        let tmp = this.data[tag];
        if (tmp == undefined)
            return 0;
        return tmp;
    }
    transfer(target, tag, amount) {
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }
    transfer_all(target) {
        for (let tag = 1; tag < this.data.length; tag++) {
            this.transfer(target, tag, this.data[tag]);
        }
    }
}
exports.Stash = Stash;
