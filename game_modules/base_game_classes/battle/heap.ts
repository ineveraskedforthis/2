import { UnitData } from "./unit";


export class UnitsHeap {
    data: UnitData[];
    last: number;
    heap: number[];
    selected: number;
    changed: boolean;

    constructor(data: UnitData[]) {
        this.data = []
        this.heap = []
        this.last = 0;
        this.selected = -1
        this.changed = false

        for (let unit of data) {
            this.add_unit(unit)
        } 
    }

    get_value(i: number) {
        return this.data[this.heap[i]].next_turn_after;
    }

    get_units_amount() {
        return this.data.length
    }

    get_unit(i: number): UnitData {
        return this.data[i]
    }

    get_selected_unit(): UnitData {
        return this.data[this.selected]
    }

    push(obj: number) {
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
        this.data.push(u);
        this.push(this.data.length - 1)
        this.changed = true
    }

    swap(a: number, b: number) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b]
        this.heap[b] = s
        this.changed = true
    }

    pop():number|undefined {
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
        for (let i in this.data) {
            this.data[i].next_turn_after = this.data[i].next_turn_after - dt
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



    // turn_end() {
    //     this.next_turn_after = this.slowness;
    //     this.action_points_left = Math.min((this.action_points_left + this.speed), this.action_points_max) as action_points;
    //     this.dodge_turns = Math.max(0, this.dodge_turns - 1)
    // }