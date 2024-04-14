import { isHTML, select, selectHTMLs } from "../HTMLwrappers/common.js";
import { material_icon_url } from "../Stash/stash.js";
export function value_bar_class_name(id) {
    return id + "_value_bar";
}
export function value_class_name(id) {
    return id + "_value";
}
export function value_indicator_class_name(id) {
    return id + "_value_indicator";
}
export class Value {
    constructor(socket, id, dependents) {
        this._id = id;
        this._value = 0;
        this._update(1);
        console.log("register value: " + id);
        ((display) => socket.on(`val_${id}_c`, (data) => {
            console.log("update value: " + id);
            console.log("new value: ", data);
            display.value = data;
            for (let item of dependents) {
                item.update_display();
            }
        }))(this);
    }
    _update(difference) {
        if (difference == 0)
            return;
        for (let item of select("." + value_class_name(this._id))) {
            item.innerHTML = `${this._value}`;
        }
    }
    set value(value) {
        let old_value = this._value;
        this._value = value;
        this._update(value - old_value);
    }
    get value() {
        return this._value;
    }
    get id() {
        return this._id;
    }
}
export class LimitedValue extends Value {
    constructor(socket, id, dependents) {
        super(socket, id, dependents);
        this._max_value = 100;
        ((display) => socket.on(`val_${id}_m`, (data) => {
            display.max_value = data;
        }))(this);
    }
    _update(difference) {
        for (let item of select("." + value_class_name(this._id))) {
            item.innerHTML = `${this._value} / ${this._max_value}`;
        }
    }
    set max_value(value) {
        this._max_value = value;
        this._update(0);
    }
    get max_value() {
        return this._max_value;
    }
}
export class BarValue extends LimitedValue {
    _update(difference) {
        super._update(difference);
        for (let item of select("." + value_bar_class_name(this._id))) {
            if (isHTML(item)) {
                item.style.width = `${Math.floor(this.value / this.max_value * 100)}%`;
            }
        }
    }
}
export class BulkAmount extends Value {
    constructor(socket, id, material_index, dependents) {
        super(socket, id, dependents);
        this.material_index = material_index;
    }
    _update(difference) {
        super._update(difference);
        for (let item of selectHTMLs("." + value_class_name(this._id))) {
            item.style.backgroundImage = material_icon_url(this.material_string);
        }
    }
    get material_string() {
        return this._id;
    }
}
export class StashValue extends BulkAmount {
    constructor(socket, id, material_index, dependents) {
        super(socket, id, material_index, dependents);
        let indicators = select(`.${value_indicator_class_name(this._id)}`);
        for (let item of indicators) {
            ((item) => item.addEventListener("animationend", (event) => {
                item.classList.remove(...["stash_up", "stash_down"]);
            }, false))(item);
        }
    }
    _update(difference) {
        super._update(difference);
        if (difference == 0)
            return;
        let indicators = select(`.${this._id}_value_indicator`);
        for (let item of indicators) {
            if (difference < 0) {
                item.classList.remove(...['stash_up', 'stash_down']);
                item.classList.add('stash_down');
            }
            else if (difference > 0) {
                item.classList.remove(...['stash_up', 'stash_down']);
                item.classList.add('stash_up');
            }
        }
    }
}

