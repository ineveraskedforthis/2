export class DamageByTypeObject {
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

    add_object(x: DamageByTypeObject):DamageByTypeObject {
        this.blunt = this.blunt + x.blunt
        this.pierce = this.pierce + x.pierce
        this.slice = this.slice + x.slice
        this.fire = this.fire + x.fire
        return this
    }
}

export const damage_types = new Set(['blunt', 'pierce', 'slice', 'fire']);