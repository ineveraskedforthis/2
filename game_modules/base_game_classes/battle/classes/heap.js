"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsHeap = void 0;
class UnitsHeap {
    constructor(raw_data) {
        this.raw_data = [];
        this.data = {};
        this.heap = [];
        this.last = 0;
        this.selected = '?';
        this.changed = false;
        for (let unit of raw_data) {
            this.add_unit(unit);
        }
    }
    get_value(i) {
        return this.data[this.heap[i]].next_turn_after;
    }
    get_units_amount() {
        return this.raw_data.length;
    }
    get_unit(i) {
        return this.data[i];
    }
    get_selected_unit() {
        if (this.selected == '?')
            return undefined;
        return this.data[this.selected];
    }
    push(obj) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1);
        this.changed = true;
    }
    shift_up(i) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor((tmp - 1) / 2))) {
            this.swap(tmp, Math.floor((tmp - 1) / 2));
            tmp = Math.floor((tmp - 1) / 2);
        }
        this.changed = true;
    }
    shift_down(i) {
        let tmp = i;
        while (tmp * 2 + 1 < this.last) {
            if (tmp * 2 + 2 < this.last) {
                if ((this.get_value(tmp * 2 + 2) < this.get_value(tmp * 2 + 1)) && (this.get_value(tmp * 2 + 2) < this.get_value(tmp))) {
                    this.swap(tmp, tmp * 2 + 2);
                    tmp = tmp * 2 + 2;
                }
                else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                    this.swap(tmp, tmp * 2 + 1);
                    tmp = tmp * 2 + 1;
                }
                else {
                    break;
                }
            }
            else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                this.swap(tmp, tmp * 2 + 1);
                tmp = tmp * 2 + 1;
            }
            else {
                break;
            }
        }
        this.changed = true;
    }
    add_unit(u) {
        this.data[u.id] = u;
        this.raw_data.push(u);
        this.push(u.id);
        this.changed = true;
    }
    swap(a, b) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = s;
        this.changed = true;
    }
    pop() {
        if (this.last == 0) {
            return undefined;
        }
        let tmp = this.heap[0];
        this.selected = tmp;
        this.last -= 1;
        this.heap[0] = this.heap[this.last];
        this.heap.length = this.last;
        this.shift_down(0);
        this.changed = true;
        return tmp;
    }
    update(dt) {
        for (let unit of this.raw_data) {
            unit.next_turn_after = unit.next_turn_after - dt;
        }
        this.changed = true;
    }
    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap,
            selected: this.selected
        };
    }
    end_turn(id) {
        if (this.selected != id)
            return false;
        let unit_id = this.pop();
        if (unit_id == undefined)
            return false;
        let unit = this.data[unit_id];
        unit.next_turn_after = unit.slowness;
        unit.action_points_left = Math.min((unit.action_points_left + unit.action_units_per_turn), unit.action_points_max);
        unit.dodge_turns = Math.max(0, unit.dodge_turns - 1);
        this.push(id);
        return true;
    }
}
exports.UnitsHeap = UnitsHeap;
