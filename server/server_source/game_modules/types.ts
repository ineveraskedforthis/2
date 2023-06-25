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
export type order_item_id = number              & { __brand: "auction_order_id"}
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

// export interface Stats {
//     phys_power: number
//     magic_power: number
//     learning: number
//     movement_speed: number
// }

// export class InnateStats {
//     max: Status;
//     stats: StatsTag
//     base_resists: Damage;
//     constructor(stats_tag: StatsTag, hp_tag: MaxHPTag) {
//         this.max = new Status();
//         this.max.hp = max_hp
//         this.stats = {
//             movement_speed: speed,
//             phys_power: phys,
//             magic_power: magic,
//             learning: learning,
//         }
//         this.base_resists = new Damage();
//     }
// }

export type tagAI = 
    'steppe_walker_agressive'
    |'dummy'
    |'steppe_walker_passive'
    |'forest_walker'
    |'rat_hunter'
    |'urban_trader'
    |'urban_guard'

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