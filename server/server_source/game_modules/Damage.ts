
export class Damage {
    blunt: number;
    pierce: number;
    slice: number;
    fire: number;
    constructor(blunt: number = 0, pierce: number = 0, slice: number = 0, fire: number = 0) {
        this.blunt = blunt;
        this.pierce = pierce;
        this.slice = slice;
        this.fire = fire;
    }
}
