import type {StashData} from "../static_data/type_script_types"
import type {tag} from "../static_data/type_script_types"

export class Stash {
    data: StashData;
    changed: boolean;

    constructor() {
        this.data = {
            clothes: 0,
            food: 0,
            leather: 0,
            meat: 0,
            tools: 0,
            water: 0,
            zaz: 0,
        };
        
        this.changed = false;
    }

    get_json() {
        return this.data
    }

    load_from_json(x:StashData) {
        this.data = x;
    }

    inc(tag: tag, x: number) {
        this.check_tag(tag);
        var tmp = undefined
        if (typeof this.data[tag] === "undefined") {
            this.data[tag] = x
            tmp = x;
            return tmp;
        }

        if (this.data[tag] + x < 0) {
            tmp = -this.data[tag];
            this.data[tag] = 0;
        } else {
            tmp = x;
            this.data[tag] += x;
        }
        this.changed = true;
        return tmp;
    }

    set(tag: tag, x: number) {
        this.check_tag(tag);
        if (x < 0) {
            this.data[tag] = 0;
        } else {
            this.data[tag] = x;
        }
        this.changed = true;
    }

    get(tag: tag):number {
        this.check_tag(tag);
        return this.data[tag];
    }

    transfer(target: Stash, tag: tag, amount: number) {
        var tmp = this.inc(tag, -amount);
        target.inc(tag, -tmp);
        return -tmp;
    }

    check_tag(tag: tag) {
        if (!(tag in this.data)) {
            this.data[tag] = 0;
        }
    }
}
