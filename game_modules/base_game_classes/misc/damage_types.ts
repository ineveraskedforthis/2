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
}

export const damage_types = new Set(['blunt', 'pierce', 'slice', 'fire']);