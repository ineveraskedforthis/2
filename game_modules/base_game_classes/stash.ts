import { MaterialsManager, material_index } from "../manager_classes/materials_manager";
import { ITEM_MATERIAL } from "../static_data/item_tags";
import type {StashData} from "../static_data/type_script_types"


export class Stash {
    // data: {[key: material_index]: number};
    data: number[]
    changed: boolean;

    constructor() {
        this.data = [];
        this.changed = false;
    }

    get_json() {
        let data:any = {}
        for (let tag = 1; tag < this.data.length; tag++) {
            data[tag] = this.data[tag]
        }
        return data
    }

    load_from_json(data:StashData) {
        for (let i in data) {
            this.data[i] = data[i]
        }
    }

    inc(tag: material_index, x: number) {
        let tag_stash = this.get(tag);
        var tmp = undefined
        if (tag_stash == undefined) {
            tag_stash = 0
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
        if (x < 0) {
            this.data[tag] = 0
        } else {
            this.data[tag] = x;
        }
        this.changed = true;
    }

    get(tag: material_index):number {
        let tmp = this.data[tag]
        if (tmp == undefined) return 0
        return tmp;
    }

    transfer(target: Stash, tag: material_index, amount: number) {
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    transfer_all(target: Stash) {
        for (let tag = 1; tag < this.data.length; tag++) {
            this.transfer(target, tag as material_index, this.data[tag])
        }
    }
}
