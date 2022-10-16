"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsHeap = void 0;
/**  Implementation of priority queue to decide priority in battle
* Current unit is stored in .selected
* To end turn, use .pop to delete current unit, reset it and then .push it back
* If current unit is '?', then priority queue is empty and battle should be stopped
*/
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
}
exports.UnitsHeap = UnitsHeap;
