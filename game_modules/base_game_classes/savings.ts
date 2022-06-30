export type money = number & { __brand: "money"}

type savings_json = {
    data: money,
    prev_data: money,
    income: number
}

export class Savings {
    data: money
    prev_data: money
    income: number;
    changed: boolean

    constructor() {
        this.data = 0 as money;
        this.prev_data = 0 as money;
        this.income = 0;
        this.changed = false
    }

    get_json():savings_json {
        var tmp = {
            data: this.data,
            prev_data: this.prev_data,
            income: this.income
        };
        return tmp;
    }

    transfer_all(target:Savings) {
        this.transfer(target, this.get())
    }

    load_from_json(x:savings_json) {
        this.data = x.data;
        this.prev_data = x.prev_data;
        this.income = x.income;
    }

    update() {
        this.prev_data = this.data;
        this.income = 0;
    }

    set(x: money) {
        this.data = x;
        this.changed = true;
    }

    get() {
        return this.data;
    }

    get_estimated_income() {
        return this.data - this.prev_data;
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