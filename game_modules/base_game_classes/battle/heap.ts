import { action_points, unit_id } from "../../../shared/battle_data";
import { UnitData } from "./unit";


export class UnitsHeap {
    data: {[_ in unit_id]: UnitData};
    raw_data: UnitData[];
    last: number;
    heap: unit_id[];
    selected: unit_id|'?';
    changed: boolean;

    constructor(raw_data: UnitData[]) {

        this.raw_data = []
        this.data = {}
        this.heap = []
        this.last = 0;
        this.selected = '?'
        this.changed = false

        for (let unit of raw_data) {
            this.add_unit(unit)
        } 
    }

    get_value(i: number) {
        return this.data[this.heap[i]].next_turn_after;
    }

    get_units_amount() {
        return this.raw_data.length
    }

    get_unit(i: unit_id): UnitData {
        return this.data[i]
    }

    get_selected_unit(): UnitData|undefined {
        if (this.selected == '?') return undefined
        return this.data[this.selected]
    }

    push(obj: unit_id) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1)
        this.changed = true
    }

    shift_up(i:number) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor((tmp - 1) / 2))) {
            this.swap(tmp, Math.floor((tmp - 1) / 2))
            tmp = Math.floor((tmp - 1) / 2)
        }
        this.changed = true
    }

    shift_down(i: number) {
        let tmp = i;
        while (tmp * 2 + 1 < this.last) {
            if (tmp * 2 + 2 < this.last) {
                if ((this.get_value(tmp * 2 + 2) < this.get_value(tmp * 2 + 1)) && (this.get_value(tmp * 2 + 2) < this.get_value(tmp))) {
                    this.swap(tmp, tmp * 2 + 2)
                    tmp = tmp * 2 + 2
                } else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                    this.swap(tmp, tmp * 2 + 1)
                    tmp = tmp * 2 + 1
                } else {
                    break
                }
            } else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                this.swap(tmp, tmp * 2 + 1)
                tmp = tmp * 2 + 1
            } else {
                break
            }
        }
        this.changed = true
    }

    add_unit(u: UnitData) {
        this.data[u.id] = u
        this.raw_data.push(u)
        this.push(u.id)
        this.changed = true
    }

    swap(a: number, b: number) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b]
        this.heap[b] = s
        this.changed = true
    }

    pop():unit_id|undefined {
        if (this.last == 0) {
            return undefined
        }
        let tmp = this.heap[0]
        this.selected = tmp;
        this.last -= 1
        this.heap[0] = this.heap[this.last]
        this.heap.length = this.last
        this.shift_down(0);
        this.changed = true
        return tmp
    }

    update(dt: number) {
        for (let unit of this.raw_data) {
            unit.next_turn_after = unit.next_turn_after - dt
        }
        this.changed = true
    }

    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap,
            selected: this.selected
        }
    }
}



