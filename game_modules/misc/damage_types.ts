import { damage_type } from "../types";

export class Damage {
    blunt: number;
    pierce: number;
    slice: number;
    fire: number;
    constructor(blunt: number = 0, pierce: number = 0, slice: number = 0, fire: number = 0) {
        this.blunt = blunt
        this.pierce = pierce
        this.slice = slice
        this.fire = fire
    }
}

export namespace DmgOps {
    export function add(y:Damage, x: Damage):Damage {
        let responce = new Damage()
        for (let t of damage_types) {
            responce[t] = x[t] + y[t]
        }
        return responce
    }
    export function add_ip(x: Damage, y: Damage) {
        for (let t of damage_types) {
            x[t] = x[t] + y[t]
        }
        return x
    }
    export function subtract(x: Damage ,y:Damage):Damage {
        let responce = new Damage()
        for (let t of damage_types) {
            responce[t] = Math.max(x[t] - y[t], 0)
        }
        return responce
    }
    export function subtract_ip(x: Damage ,y:Damage):Damage {
        for (let t of damage_types) {
            x[t] = Math.max(x[t] - y[t], 0)
        }
        return x
    }
    export function mult_ip(x: Damage, m: number) {
        for (let i of damage_types) {
            x[i] = Math.max(Math.floor(x[i] * m), 0)
        }
        return x
    }
    export function copy(x: Damage):Damage {
        return new Damage(
            x.blunt,
            x.pierce,
            x.slice,
            x.fire
        )
    }

    export function total(x: Damage): number {
        let total = 0
        for (let tag of damage_types) {
            total += x[tag]
        }
        return total
    }
}

export const damage_types: damage_type[] = ['blunt', 'pierce', 'slice', 'fire'];