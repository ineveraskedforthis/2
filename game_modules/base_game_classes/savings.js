"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Savings = void 0;
class Savings {
    constructor() {
        this.data = 0;
        this.prev_data = 0;
        this.income = 0;
        this.changed = false;
    }
    get_json() {
        var tmp = {
            data: this.data,
            prev_data: this.prev_data,
            income: this.income
        };
        return tmp;
    }
    transfer_all(target) {
        this.transfer(target, this.get());
    }
    load_from_json(x) {
        this.data = x.data;
        this.prev_data = x.prev_data;
        this.income = x.income;
    }
    update() {
        this.prev_data = this.data;
        this.income = 0;
    }
    set(x) {
        this.data = x;
        this.changed = true;
    }
    get() {
        return this.data;
    }
    get_estimated_income() {
        return this.data - this.prev_data;
    }
    inc(x) {
        var a = this.get();
        if ((a + x) < 0) {
            this.set(0);
        }
        else {
            this.set(a + x);
        }
        this.changed = true;
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
