import { MATERIAL, MaterialConfiguration, MaterialStorage } from "@content/content";
import { StashData } from "../types";

export class Stash {
    data: Record<MATERIAL, number>

    constructor() {
        this.data = MaterialConfiguration.zero_record;
    }

    is_empty() {
        for (let material of MaterialConfiguration.MATERIAL) {
            if ((this.data[material] == null) || (this.data[material] == undefined)) continue
            if (this.data[material] > 0) {
                return false
            }
        }
        return true
    }

    get_json() {
        let data: Record<string, number> = {};
        for (let material of MaterialConfiguration.MATERIAL) {
            const material_data = MaterialStorage.get(material)
            data[material_data.id_string] = this.data[material];
        }
        return data
    }

    load_from_json(data:StashData) {
        for (let [i, amount] of Object.entries(data)) {
            if (amount == null) amount = 0
            this.data[Number(i) as MATERIAL] = amount
        }
    }

    inc(tag: MATERIAL, x: number) {
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
        return tmp;
    }

    set(tag: MATERIAL, x: number) {
        if ((x < 0)||(x == undefined)||(Number.isNaN(x))) {
            this.data[tag] = 0
        } else {
            this.data[tag] = x;
        }
    }

    get(tag: MATERIAL):number {
        let tmp = this.data[tag]
        if ((tmp == undefined)||(Number.isNaN(tmp))) return 0
        return tmp;
    }

    transfer(target: Stash, tag: MATERIAL, amount: number) {
        if ((amount == undefined) || (amount == null) || (Number.isNaN(amount))) amount = 0
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    transfer_all(target: Stash) {
        for (let tag of MaterialConfiguration.MATERIAL) {
            this.transfer(target, tag, this.get(tag))
        }
    }

    clear() {
        for (let tag of MaterialConfiguration.MATERIAL) {
            this.set(tag, 0)
        }
    }
}
