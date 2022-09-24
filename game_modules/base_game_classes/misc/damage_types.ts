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

    add(x: Damage):Damage {
        this.blunt = this.blunt + x.blunt
        this.pierce = this.pierce + x.pierce
        this.slice = this.slice + x.slice
        this.fire = this.fire + x.fire
        return this
    }
    subtract(x: Damage):Damage {
        this.blunt=     this.blunt - x.blunt,
        this.pierce=    this.pierce - x.pierce,
        this.slice=     this.slice - x.slice,
        this.fire=      this.fire - x.fire
        return this
    }
    copy():Damage {
        return new Damage(
            this.blunt,
            this.pierce,
            this.slice,
            this.fire
        )
    }
}

export const damage_types: damage_type[] = ['blunt', 'pierce', 'slice', 'fire'];
export type damage_type = 'blunt'|'pierce'|'slice'|'fire'