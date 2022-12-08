import { materials, material_index } from "../manager_classes/materials_manager";
import { StashData } from "../types";

export class Stash {
    // data: {[key: material_index]: number};
    data: number[]
    changed: boolean;

    constructor() {
        this.data = [];
        this.changed = false;
    }

    get_json() {
        let data:{[_ in material_index]: number} = {};
        for (let material of materials.get_materials_list()) {
            data[material] = this.data[material as number];
        }
        return data
    }

    load_from_json(data:StashData) {
        for (let [i, amount] of Object.entries(data)) {
            if (amount == null) amount = 0
            this.data[Number(i) as material_index] = amount
        }
    }

    inc(tag: material_index, x: number) {
        let tag_stash = this.get(tag);
        var tmp:number = 0
        if (tag_stash == undefined) {
            tag_stash = 0
        }
        if ((x == undefined)||(Number.isNaN(x))) {
            x = 0
        }
        if (tag_stash + x < 0) {
            tmp = -tag_stash;
            this.set(tag, 0)
        } else {
            tmp = x;
            this.set(tag, tag_stash + x)
        }
        this.changed = true;
        return tmp;
    }

    set(tag: material_index, x: number) {
        if ((x < 0)||(x == undefined)||(Number.isNaN(x))) {
            this.data[tag] = 0
        } else {
            this.data[tag] = x;
        }
        this.changed = true;
    }

    get(tag: material_index):number {
        let tmp = this.data[tag]
        if ((tmp == undefined)||(Number.isNaN(tmp))) return 0
        return tmp;
    }

    transfer(target: Stash, tag: material_index, amount: number) {
        if ((amount == undefined) || (amount == null) || (Number.isNaN(amount))) amount = 0
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    transfer_all(target: Stash) {
        for (let tag of materials.get_materials_list()) {
            this.transfer(target, tag, this.get(tag))
        }
    }
}
