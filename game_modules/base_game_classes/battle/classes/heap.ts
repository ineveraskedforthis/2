
import { unit_id } from "../../../../shared/battle_data";
import { Unit } from "./unit";

/**  Implementation of priority queue to decide priority in battle  
* Current unit is stored in heap[0]
* To end turn, use .pop to delete current unit, reset it and then .push it back
* If current unit is '?', then priority queue is empty and battle should be stopped
*/
export class UnitsHeap {
    
    data: {[_ in unit_id]: Unit};
    raw_data: Unit[];
    last: number;
    heap: unit_id[];

    constructor(raw_data: Unit[]) {
        this.raw_data = []
        this.data = {}
        this.heap = []
        this.last = 0;
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

    get_unit(i: unit_id): Unit {
        return this.data[i]
    }

    get_selected_unit(): Unit|undefined {
        const current = this.heap[0]
        if (current == undefined) return undefined
        return this.get_unit(current)
    }

    push(obj: unit_id) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1)
    }

    shift_up(i:number) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor((tmp - 1) / 2))) {
            this.swap(tmp, Math.floor((tmp - 1) / 2))
            tmp = Math.floor((tmp - 1) / 2)
        }
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
    }

    add_unit(u: Unit) {
        this.data[u.id] = u
        this.raw_data.push(u)
        this.push(u.id)
    }

    swap(a: number, b: number) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b]
        this.heap[b] = s
    }

    pop():unit_id|undefined {
        if (this.last == 0) {
            return undefined
        }
        let tmp = this.heap[0]
        this.last -= 1
        this.heap[0] = this.heap[this.last]
        this.heap.length = this.last
        this.shift_down(0);
        return tmp
    }

    update(dt: number) {
        for (let unit of this.raw_data) {
            unit.next_turn_after = unit.next_turn_after - dt
        }
    }

    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap,
        }
    }
}



