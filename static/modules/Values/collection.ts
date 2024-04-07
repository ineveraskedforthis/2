import { Socket } from "../../../shared/battle_data.js";
import { elementById, isHTML, select } from "../HTMLwrappers/common.js";

export function value_bar_class_name (tag: string) : string {
    return tag + "_value_bar";
}

export function value_class_name (tag: string) : string {
    return tag + "_value";
}

export class Value implements ValueInterface {
    protected _id: string;
    private _value: number;
    private _max_value: number;

    constructor(socket: Socket, tag: string){
        this._id = tag;
        this._value = 0;
        this._max_value = 100;

        this._update();

        ((display: Value) => socket.on(`val_${tag}_c`, (data: number) => {
            display.value = data
        }))(this);

        ((display: Value) => socket.on(`val_${tag}_m`, (data: number) => {
            display.max_value = data
        }))(this);
    }

    protected _update() {
        for (let item of select("." + value_class_name(this._id))) {
            item.innerHTML = `${this._value} / ${this._max_value}`
        }
    }

    set value(value: number) {
        this._value = value;
        this._update()
    }

    get value(): number {
        return this._value
    }

    set max_value(value: number) {
        this._max_value = value;
        this._update()
    }

    get max_value(): number {
        return this._max_value
    }
}

export class BarValue extends Value {
    protected _update() {
        super._update()

        for (let item of select("." + value_bar_class_name(this._id))) {
            if (isHTML(item)) {
                item.style.width = `${Math.floor(this.value / this.max_value * 100)}%`
            }
        }
    }
}