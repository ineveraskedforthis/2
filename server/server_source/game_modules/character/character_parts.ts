import { Damage } from "../misc/damage_types";

export class Status {
    hp:number;
    rage:number;
    blood:number;
    stress:number;
    fatigue:number;
    constructor() {
        this.hp = 100
        this.rage = 100
        this.blood = 100
        this.stress = 100
        this.fatigue = 100
    }
}

export type status_type = 'hp'|'rage'|'blood'|'stress'|'fatigue'

export interface Stats {
    phys_power: number
    magic_power: number
    movement_speed: number
}

export class InnateStats {
    max: Status;
    stats: Stats
    base_resists: Damage;
    constructor(speed: number, phys: number, magic: number, max_hp: number) {
        this.max = new Status();
        this.max.hp = max_hp
        this.stats = {
            movement_speed: speed,
            phys_power: phys,
            magic_power: magic,
        }
        this.base_resists = new Damage();
    }
}

export type tagAI = 'steppe_walker_agressive'|'dummy'|'steppe_walker_passive'|'forest_walker'
export type tagRACE = 'human'|'rat'|'graci'|'elo'|'test'
export type tagModel = 'human'|'rat'|'graci'|'elo'|'test'|'bigrat'|'magerat'
type tagTactic = 'basic'

export interface Archetype {
    model: tagModel;
    ai_map: tagAI;
    ai_battle: tagTactic;
    race: tagRACE;
}

export interface ModelVariant {
    chin: number
    mouth: number
    eyes: number
}