import { isHTML, select } from "../HTMLwrappers/common.js";
export function value_bar_class_name(tag) {
    return tag + "_value_bar";
}
export function value_class_name(tag) {
    return tag + "_value";
}
export class Value {
    constructor(socket, tag) {
        this._id = tag;
        this._value = 0;
        this._max_value = 100;
        this._update();
        ((display) => socket.on(`val_${tag}_c`, (data) => {
            display.value = data;
        }))(this);
        ((display) => socket.on(`val_${tag}_m`, (data) => {
            display.max_value = data;
        }))(this);
    }
    _update() {
        for (let item of select("." + value_class_name(this._id))) {
            item.innerHTML = `${this._value} / ${this._max_value}`;
        }
    }
    set value(value) {
        this._value = value;
        this._update();
    }
    get value() {
        return this._value;
    }
    set max_value(value) {
        this._max_value = value;
        this._update();
    }
    get max_value() {
        return this._max_value;
    }
}
export class BarValue extends Value {
    _update() {
        super._update();
        for (let item of select("." + value_bar_class_name(this._id))) {
            if (isHTML(item)) {
                item.style.width = `${Math.floor(this.value / this.max_value * 100)}%`;
            }
        }
    }
}
