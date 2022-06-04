export class DamageByTypeObject {
    blunt: number;
    pierce: number;
    slice: number;
    fire: number;
    constructor() {
        this.blunt = 0
        this.pierce = 0
        this.slice = 0
        this.fire = 0
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