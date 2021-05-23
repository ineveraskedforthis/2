"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stash = void 0;
class Stash {
    constructor() {
        this.data = {
            clothes: 0,
            food: 0,
            leather: 0,
            meat: 0,
            tools: 0,
            water: 0,
            zaz: 0,
        };
        this.changed = false;
    }
    get_json() {
        return this.data;
    }
    load_from_json(x) {
        this.data = x;
    }
    inc(tag, x) {
        this.check_tag(tag);
        var tmp = undefined;
        if (this.data[tag] + x < 0) {
            tmp = -this.data[tag];
            this.data[tag] = 0;
        }
        else {
            tmp = x;
            this.data[tag] += x;
        }
        this.changed = true;
        return tmp;
    }
    set(tag, x) {
        this.check_tag(tag);
        if (x < 0) {
            this.data[tag] = 0;
        }
        else {
            this.data[tag] = x;
        }
        this.changed = true;
    }
    get(tag) {
        this.check_tag(tag);
        return this.data[tag];
    }
    transfer(target, tag, amount) {
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }
    check_tag(tag) {
        if (!(tag in this.data)) {
            this.data[tag] = 0;
        }
    }
}
exports.Stash = Stash;
