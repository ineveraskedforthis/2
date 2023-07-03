import { armour_slot } from "../../../shared/inventory"
import { money } from "../../../shared/common"
import { Damage } from "./Damage"
import { StatsTag } from "./races/stats"
import { BaseResistTag } from "./races/resists"
import { MaxHPTag } from "./races/max_hp"

export type char_id = number                    & {__brand:  "character_id"}
export type TEMP_CHAR_ID = '@' 
export type user_id = number                    & {__brand:  "user_id"}
export type user_online_id = user_id            & {__brand2: "online"}
export type TEMP_USER_ID = '#'
export type order_bulk_id = number              & { __brand: "bulk_order"}
// export type order_item_id = number              & { __brand: "auction_order_id"}
export type order_item_id_raw = number          & { __brand: "auction_order_id", __brand2: "raw"}
export type building_id = number                & { __brand: "building_id"}



export interface SavingsJson {
    data: money
}

export type damage_type = 'blunt'|'pierce'|'slice'|'fire'
export type melee_attack_type = 'blunt'|'pierce'|'slice'
export type weapon_tag = 'polearms'|'onehand'|'ranged'|'twohanded'
export type weapon_attack_tag = weapon_tag | 'noweapon'


export const armour_slots:armour_slot[] = ['body', 'legs', 'arms', 'head', 'foot']
export const weapon_attack_tags: weapon_attack_tag[] = ['polearms', 'noweapon', 'onehand', 'ranged', 'twohanded']

export type world_coordinates = [number, number]
export type map_position = [number, number]
export type terrain = 'sea' | 'city' | 'steppe' | 'coast' | 'void'

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

export type status_type = 'hp'|'rage'|'blood'|'stress'|'fatigue'

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