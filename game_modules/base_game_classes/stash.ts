import { materials, MaterialsManager, material_index } from "../manager_classes/materials_manager";
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
        let data:{[_ in material_index]: number} = {};
        for (let material of materials.get_materials_list()) {
            data[material] = this.data[material as number];
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
        var tmp:number = 0
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

        for (let tag of materials.get_materials_list()) {
            this.transfer(target, tag, this.data[tag])
        }
    }
}
