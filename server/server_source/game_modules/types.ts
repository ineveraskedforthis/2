import { StatsTag } from "./races/stats"
import { BaseResistTag } from "./races/resists"
import { MaxHPTag } from "./races/max_hp"

export const enum WEAPON_TYPE {
    ONEHAND = 'onehand',
    POLEARMS = 'polearms',
    NOWEAPON = 'noweapon',
    TWOHANDED = 'twohanded',
    RANGED = 'ranged'
}

export type StashData = {
    [index in number]: number
}


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


export type tagAI =
    'rat'
    | 'urban_guard'
    | 'rat_hunter'
    | 'rat'
    | 'crafter'
    | 'fisherman'
    | 'nomad'
    | 'forest_dweller'
    | 'urban_trader'
    | 'lumberjack'

export type tagRACE =
    'human'
    |'rat'
    |'graci'
    |'elo'
    |'ball'
export type tagModel =
    'human'
    |'rat'
    |'graci'
    |'elo'
    |'test'
    |'bigrat'
    |'magerat'
    |'berserkrat'
    |'human_strong'
    |'ball'

export function model_interface_name(model: tagModel): string {
    switch (model) {
        case "human":return 'human'
        case "rat":return 'rat'
        case "graci":return 'graci'
        case "elo":return 'elodino'
        case "test":return 'test character'
        case "bigrat":return 'giant rat'
        case "magerat":return 'mage rat'
        case "berserkrat":return 'berserk rat'
        case "human_strong":return 'mutated human'
        case "ball":return 'meat ball'
    }
}

export function skeleton(model: tagModel): boolean {
    switch (model) {
        case "human":return true
        case "rat":return true
        case "graci":return true
        case "elo":return false
        case "test":return false
        case "bigrat":return true
        case "magerat":return true
        case "berserkrat":return true
        case "human_strong":return true
        case "ball":return false
    }
}

export type tagTactic = 'basic'

export interface CharacterTemplate {
    model: tagModel;
    ai_map: tagAI;
    ai_battle: tagTactic;
    race: tagRACE;
    stats: StatsTag;
    resists: BaseResistTag;
    max_hp: MaxHPTag;
    name_generator: () => string;
}

export interface ModelVariant {
    chin: number
    mouth: number
    eyes: number
}