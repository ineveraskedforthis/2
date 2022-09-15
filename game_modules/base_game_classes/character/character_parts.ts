import { DamageByTypeObject } from "../misc/damage_types";

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

export interface Stats {
    phys_power: number
    magic_power: number
    movement_speed: number
}

export class InnateStats {
    max: Status;
    stats: Stats
    base_resists: DamageByTypeObject;
    constructor(speed: number, phys: number, magic: number, max_hp: number) {
        this.max = new Status();
        this.max.hp = max_hp
        this.stats = {
            movement_speed: speed,
            phys_power: phys,
            magic_power: magic,
        }
        this.base_resists = new DamageByTypeObject();
    }
}

export type tagAI = 'steppe_walker_agressive'|'dummy'|'steppe_walker_passive'|'forest_walker'
export type tagRACE = 'human'|'rat'|'graci'|'elo'|'test'
export type tagModel = 'human'|'rat'|'graci'|'elo'|'test'
type tagTactic = 'basic'

export interface Archetype {
    model: tagModel;
    ai_map: tagAI;
    ai_battle: tagTactic;
    race: tagRACE;
}




export class Misc {
    model: string;
    explored: boolean[];
    battle_id: number;
    in_battle_id: number;
    tactic: any;
    ai_tag: tagAI;
    tag: tagRACE;
    constructor() {
        this.model = 'empty'
        this.explored = []
        this.battle_id = -1
        this.in_battle_id = -1
        this.tactic = {}
        this.ai_tag = 'dummy'
        this.tag = 'test'
    }
}

export class CharacterFlags {
    player: boolean;
    trainer: boolean;
    dead: boolean;
    in_battle: boolean;
    constructor() {
        this.player = false
        this.trainer = false
        this.dead = false
        this.in_battle = false
    }
}