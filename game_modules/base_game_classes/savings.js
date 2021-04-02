module.exports = class Savings {
    constructor() {
        this.data = {};
        this.data['standard_money'] = 0;
        this.prev_data = {};
        this.prev_data['standard_money'] = 0;
        this.income = 0;
        this.changed = false
    }

    get_json() {
        var tmp = {};
        tmp.data = this.data;
        tmp.prev_data = this.prev_data;
        tmp.income = this.income;
        return tmp;
    }

    load_from_json(x) {
        this.data = x.data;
        this.prev_data = x.prev_data;
        this.income = x.income;
    }

    update() {
        this.prev_data['standard_money'] = this.data['standard_money'];
        this.income = 0;
    }

    set(x) {
        this.data['standard_money'] = x;
        this.changed = true;
    }

    get() {
        return this.data['standard_money'];
    }

    get_estimated_income() {
        return this.data['standard_money'] - this.prev_data['standard_money'];
    }

    inc(x) {
        var a = this.get();
        if ((a + x) < 0) {
            this.set(0);
        } else {
            this.set(a + x)
        }
        this.changed = true
    }

    transfer(target, x) {
        var a = this.get();
        var b = target.get();
        var tmp = x;
        if ((a - x >= 0) && (b + x >= 0)) {
            this.inc(-x);
            target.inc(x);
        } else if ((a - x < 0) && (b + x >= 0)) {
            tmp = a - x;
            this.set(0);
            target.inc(x + tmp);
        }
        return tmp;
    }
}