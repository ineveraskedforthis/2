import { money, SavingsJson } from "../types";

export class Savings {
    data: money
    changed: boolean

    constructor() {
        this.data = 0 as money;
        this.changed = false
    }

    json():SavingsJson {
        var tmp = {
            data: this.data,
        };
        return tmp;
    }

    transfer_all(target:Savings) {
        this.transfer(target, this.get())
    }

    from_json(x:SavingsJson) {
        this.data = x.data;
    }

    set(x: money) {
        if (this.data == x) return
        this.data = x;
        this.changed = true;
    }

    get() {
        return this.data;
    }

    inc(x:money) {
        var a = this.get();
        if ((a + x) < 0) {
            this.set(0 as money);
        } else {
            this.set(a + x as money)
        }
        this.changed = true
    }

    transfer(target: Savings, x: money) {
        var a = this.get();
        var b = target.get();
        var tmp = x;
        if ((a - x >= 0) && (b + x >= 0)) {
            this.inc(-x as money);
            target.inc(x);
        } else if ((a - x < 0) && (b + x >= 0)) {
            tmp = a - x as money;
            this.set(0 as money);
            target.inc(x + tmp as money);
        }
        return tmp;
    }
}