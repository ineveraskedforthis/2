"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Savings = void 0;
class Savings {
    constructor() {
        this.data = 0;
    }
    json() {
        var tmp = {
            data: this.data,
        };
        return tmp;
    }
    transfer_all(target) {
        this.transfer(target, this.get());
    }
    from_json(x) {
        this.data = x.data;
    }
    set(x) {
        if (this.data == x)
            return;
        this.data = x;
    }
    get() {
        return this.data;
    }
    inc(x) {
        var a = this.get();
        if ((a + x) < 0) {
            this.set(0);
        }
        else {
            this.set(a + x);
        }
    }
    transfer(target, x) {
        var a = this.get();
        var b = target.get();
        var tmp = x;
        if ((a - x >= 0) && (b + x >= 0)) {
            this.inc(-x);
            target.inc(x);
        }
        else if ((a - x < 0) && (b + x >= 0)) {
            tmp = a - x;
            this.set(0);
            target.inc(x + tmp);
        }
        return tmp;
    }
}
exports.Savings = Savings;
